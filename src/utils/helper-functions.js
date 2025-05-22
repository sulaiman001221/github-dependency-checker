import { errorMessages } from "./error-messages.js";

export function parseGitHubRepoURL(url) {
  const githubUrlRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/;
  const match = url.match(githubUrlRegex);
  if (!match) {
    throw new Error(errorMessages.invalidRepoUrl);
  }
  return { owner: match[1], repo: match[2] };
}
