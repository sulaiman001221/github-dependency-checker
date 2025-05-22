export const errorMessages = {
  ownerNotFound: (owner) => `Repository owner ${owner} not found`,
  repositoryNotFound: (repo, owner) =>
    `Repository ${repo} not found for owner ${owner}`,
  ownerCheckError: (message) =>
    `An error occurred while checking owner: ${message}`,
  repoCheckError: (message) =>
    `An error occurred while checking repository: ${message}`,
  invalidRepoUrl:
    "Invalid GitHub URL. Please use format: https://github.com/owner/repo",
  fetchPackageJsonError: (message) =>
    `Failed to fetch package.json: ${message}`,
  npmPackageCheckError: (pkg, message) =>
    `Failed to check NPM package '${pkg}': ${message}`,
};
