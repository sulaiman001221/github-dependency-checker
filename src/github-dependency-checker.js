import dotenv from "dotenv";
import axios from "axios";
import { Buffer } from "buffer";
import { errorMessages } from "./utils/error-messages.js";
dotenv.config();

const GITHUB_API_URL = "https://api.github.com";
const NPM_REGISTRY_URL = "https://registry.npmjs.org";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
export const headers = GITHUB_TOKEN
  ? {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3.raw",
    }
  : {};

export function parseGitHubRepoURL(url) {
  const githubUrlRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/;
  const match = url.match(githubUrlRegex);
  if (!match) {
    throw new Error(errorMessages.invalidRepoUrl);
  }
  return { owner: match[1], repo: match[2] };
}

export async function checkOwnerExists(owner, headers) {
  const url = `${GITHUB_API_URL}/users/${owner}/repos`;

  try {
    await axios.get(url, { headers });
  } catch (error) {
    const message =
      error.response && error.response.status === 404
        ? errorMessages.ownerNotFound(owner)
        : errorMessages.ownerCheckError(error.message);
    throw new Error(message);
  }
}

export async function checkRepositoryExists(owner, repo, headers) {
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}`;

  try {
    await axios.get(url, { headers });
  } catch (error) {
    const message =
      error.response && error.response.status === 404
        ? errorMessages.repositoryNotFound(repo, owner)
        : errorMessages.repoCheckError(error.message);
    throw new Error(message);
  }
}

export async function checkDependencies(repoUrl) {
  const { owner, repo } = parseGitHubRepoURL(repoUrl);
  await checkOwnerExists(owner, headers);
  await checkRepositoryExists(owner, repo, headers);

  const apiUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/package.json`;

  try {
    const response = await axios.get(apiUrl, { headers });
    const fileMeta = response.data;

    if (fileMeta.type === "file" && fileMeta.content) {
      const contentBuffer = Buffer.from(fileMeta.content, "base64");
      const packageJsonContent = contentBuffer.toString("utf8");
      const parsedJson = JSON.parse(packageJsonContent);
      return {
        name: parsedJson.name,
        dependencies: parsedJson.dependencies || {},
        devDependencies: parsedJson.devDependencies || {},
      };
    }

    // Fallback to raw.githubusercontent if content missing
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/package.json`;

    const rawResponse = await axios.get(rawUrl, {
      headers: { Accept: "application/vnd.github.v3.raw" },
    });

    const parsedJson =
      typeof rawResponse.data === "string"
        ? JSON.parse(rawResponse.data)
        : rawResponse.data;

    return {
      name: parsedJson.name,
      dependencies: parsedJson.dependencies || {},
      devDependencies: parsedJson.devDependencies || {},
    };
  } catch (error) {
    console.error(
      "GitHub API/RAW error:",
      error.response?.data || error.message
    );
    throw new Error(
      errorMessages.fetchPackageJsonError(
        error.response?.statusText || error.message
      )
    );
  }
}

export async function checkOutdatedPackages(dependencies) {
  const results = [];

  for (const [pkg, currentVersion] of Object.entries(dependencies)) {
    try {
      const res = await axios.get(`${NPM_REGISTRY_URL}/${pkg}`);
      const latestVersion = res.data["dist-tags"].latest;
      const cleanedCurrent = currentVersion.replace(/[^0-9.]/g, "");

      results.push({
        name: pkg,
        current: currentVersion,
        latest: latestVersion,
        status: cleanedCurrent !== latestVersion ? "outdated" : "up-to-date",
      });
    } catch (error) {
      results.push({
        name: pkg,
        current: currentVersion,
        latest: "unknown",
        status: "error",
        message: errorMessages.npmPackageCheckError(pkg, error.message),
      });
    }
  }

  return results;
}
