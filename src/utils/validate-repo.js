import axios from "axios";
const GITHUB_API_URL = "https://api.github.com";

export const errorMessages = {
  ownerNotFound: (owner) => `Repository owner ${owner} not found`,
  repositoryNotFound: (repo, owner) =>
    `Repository ${repo} not found for owner ${owner}`,
  ownerCheckError: (message) =>
    `An error occurred while checking owner: ${message}`,
  repoCheckError: (message) =>
    `An error occurred while checking repository: ${message}`,
};

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
