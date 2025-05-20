export function parseGitHubRepoURL(url) {
  const githubUrlRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/;

  const match = url.match(githubUrlRegex);
  if (!match) {
    throw new Error("Invalid GitHub repository URL format.");
  }

  const owner = match[1];
  const repo = match[2];

  return { owner, repo };
}
