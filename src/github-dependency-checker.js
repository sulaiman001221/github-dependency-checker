import dotenv from "dotenv";
import axios from "axios";
dotenv.config();
import { Buffer } from "buffer";

import {
  checkOwnerExists,
  checkRepositoryExists,
} from "./utils/validate-repo.js";
import { parseGitHubRepoURL } from "./utils/parse-url.js";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API_URL = "https://api.github.com";
const NPM_REGISTRY_URL = "https://registry.npmjs.org";
const headers = GITHUB_TOKEN
  ? {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3.raw",
    }
  : {};

export async function checkDependencies(repoUrl) {
  const { owner, repo } = parseGitHubRepoURL(repoUrl);
  await checkOwnerExists(owner, headers);
  await checkRepositoryExists(owner, repo, headers);

  const apiUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/package.json`;

  try {
    const response = await axios.get(apiUrl, {
      headers,
    });

    const packageJson = response.data;

    const packageJsonContent = Buffer.from(
      packageJson.content,
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
      `Failed to fetch package.json: ${
        error.response?.statusText || error.message
      }`
    );
  }
}

export async function checkOutdatedPackages(dependencies) {
  const results = [];

  for (const [pkg, currentVersion] of Object.entries(dependencies)) {
    try {
      const res = await axios.get(`${NPM_REGISTRY_URL}/${pkg}`);
      const latestVersion = res.data["dist-tags"].latest;

      if (currentVersion.replace(/[^0-9.]/g, "") !== latestVersion) {
        results.push({
          name: pkg,
          current: currentVersion,
          latest: latestVersion,
          status: "outdated",
        });
      } else {
        results.push({
          name: pkg,
          current: currentVersion,
          latest: latestVersion,
          status: "up-to-date",
        });
      }
    } catch (error) {
      results.push({
        name: pkg,
        current: currentVersion,
        latest: "unknown",
        status: "error",
        message: error.message,
      });
    }
  }

  return results;
}

const dependencies = await checkDependencies(
  "https://github.com/sulaiman/github-dependency-checker"
);
const outdatedPackages = await checkOutdatedPackages(
  dependencies.dependencies
).then(console.log);