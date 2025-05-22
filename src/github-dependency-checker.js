import dotenv from "dotenv";
import axios from "axios";
import { Buffer } from "buffer";
import { errorMessages } from "./utils/error-messages.js";
import { parseGitHubRepoURL } from "./utils/helper-functions.js";
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
    const packageJsonContent = Buffer.from(
      response.data.content,
      "base64"
    ).toString("utf8");
    const parsedJson = JSON.parse(packageJsonContent);

    return {
      name: parsedJson.name,
      dependencies: parsedJson.dependencies || {},
      devDependencies: parsedJson.devDependencies || {},
    };
  } catch (error) {
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
