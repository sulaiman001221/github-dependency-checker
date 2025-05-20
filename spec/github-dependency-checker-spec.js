import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

import {
  checkOwnerExists,
  checkRepositoryExists,
  errorMessages,
} from "../src/utils/validate-repo.js";
import { parseGitHubRepoURL } from "../src/utils/parse-url.js";
import {
  checkDependencies,
  checkOutdatedPackages,
} from "../src/github-dependency-checker.js";

describe("GitHub Dependency Checker", () => {
  let headers, urls, mockUser;
  beforeEach(() => {
    const token = process.env.GITHUB_TOKEN;
    headers = token ? { Authorization: `token ${token}` } : {};
    const GITHUB_API_URL = "https://api.github.com";

    mockUser = {
      owner: "Sulaiman",
      repo: "github-dependency-checker",
    };

    urls = {
      ownerUrl: (owner) => `${GITHUB_API_URL}/users/${owner}/repos`,
      repoUrl: (owner, repo) => `${GITHUB_API_URL}/repos/${owner}/${repo}`,
      packageJsonUrl: (owner, repo) =>
        `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/package.json`,
    };
  });

  describe("checkOwnerExists function", () => {
    it("should throw an error if the owner does not exist", async () => {
      spyOn(axios, "get").and.callFake(() =>
        Promise.reject({ response: { status: 404 } })
      );
      const invalidOwner = "ABC123";

      await expectAsync(
        checkOwnerExists(invalidOwner, { headers })
      ).toBeRejectedWithError(errorMessages.ownerNotFound(invalidOwner));

      expect(axios.get).toHaveBeenCalledOnceWith(urls.ownerUrl(invalidOwner), {
        headers: { headers },
      });
    });

    it("should throw an owner check error if the API call fails with a non-404 error", async () => {
      spyOn(axios, "get").and.callFake(() =>
        Promise.reject({
          response: { status: 500 },
          message: "Internal Server Error",
        })
      );
      await expectAsync(
        checkOwnerExists(mockUser.owner, { headers })
      ).toBeRejectedWithError(
        errorMessages.ownerCheckError("Internal Server Error")
      );
      expect(axios.get).toHaveBeenCalledOnceWith(
        urls.ownerUrl(mockUser.owner),
        {
          headers: { headers },
        }
      );
    });
  });

  describe("checkRepositoryExists function", () => {
    it("should throw an error if the repository does not exist", async () => {
      spyOn(axios, "get").and.callFake(() =>
        Promise.reject({ response: { status: 404 } })
      );

      const invalidRepo = "InvalidRepoName";

      await expectAsync(
        checkRepositoryExists(mockUser.owner, invalidRepo, { headers })
      ).toBeRejectedWithError(
        errorMessages.repositoryNotFound(invalidRepo, mockUser.owner)
      );

      expect(axios.get).toHaveBeenCalledOnceWith(
        urls.repoUrl(mockUser.owner, invalidRepo),
        {
          headers: { headers },
        }
      );
    });

    it("should throw a repo check error if the API call fails with a non-404 error", async () => {
      spyOn(axios, "get").and.callFake(() =>
        Promise.reject({
          response: { status: 403 },
          message: "Forbidden",
        })
      );
      await expectAsync(
        checkRepositoryExists(mockUser.owner, mockUser.repo, { headers })
      ).toBeRejectedWithError(errorMessages.repoCheckError("Forbidden"));

      expect(axios.get).toHaveBeenCalledOnceWith(
        urls.repoUrl(mockUser.owner, mockUser.repo),
        {
          headers: { headers },
        }
      );
    });
  });

  describe("parseGitHubRepoURL", () => {
    it("should extract owner and repo from a valid GitHub HTTPS URL", () => {
      const url = "https://github.com/sula/Hello-World";
      const result = parseGitHubRepoURL(url);
      expect(result).toEqual({ owner: "sula", repo: "Hello-World" });
    });

    it("should extract owner and repo even if there's a trailing slash", () => {
      const url = "https://github.com/sula/Hello-World/";
      const result = parseGitHubRepoURL(url);
      expect(result).toEqual({ owner: "sula", repo: "Hello-World" });
    });

    it("should throw an error for a malformed GitHub URL", () => {
      const badUrl = "https://notgithub.com/sula/Hello-World";
      expect(() => parseGitHubRepoURL(badUrl)).toThrowError(
        "Invalid GitHub repository URL format."
      );
    });

    it("should throw an error for missing repo name", () => {
      const badUrl = "https://github.com/sula";
      expect(() => parseGitHubRepoURL(badUrl)).toThrowError(
        "Invalid GitHub repository URL format."
      );
    });

    it("should throw an error for missing owner", () => {
      const badUrl = "https://github.com//Hello-World";
      expect(() => parseGitHubRepoURL(badUrl)).toThrowError(
        "Invalid GitHub repository URL format."
      );
    });
  });

  describe("checkDependencies", () => {
    const mockPackageJson = {
      name: "example-repo",
      dependencies: {
        lodash: "^4.17.21",
      },
      devDependencies: {
        jest: "^29.0.0",
      },
    };

    beforeEach(() => {
      spyOn(axios, "get").and.callFake((url) => {
        if (url === urls.ownerUrl(mockUser.owner)) {
          return Promise.resolve({ status: 200 });
        } else if (url === urls.repoUrl(mockUser.owner, mockUser.repo)) {
          return Promise.resolve({ status: 200 });
        } else if (url.includes("package.json")) {
          return Promise.resolve({ data: mockPackageJson });
        }
        return Promise.reject(new Error("Unexpected URL"));
      });
    });

    it("should return dependencies from a repo with a mocked package.json", async () => {
      const result = await checkDependencies(
        urls.repoUrl(mockUser.owner, mockUser.repo)
      );

      expect(axios.get).toHaveBeenCalledOnceWith(urls.ownerUrl(invalidOwner), {
        headers: { headers },
      });
      expect(axios.get).toHaveBeenCalledOnceWith(
        urls.repoUrl(mockUser.owner, mockUser.repo),
        {
          headers: { headers },
        }
      );

      expect(axios.get).toHaveBeenCalledOnceWith(
        urls.packageJsonUrl(mockUser.owner, mockUser.repo),
        {
          headers: { headers },
        }
      );
      expect(result).toEqual(mockPackageJson);
    });
  });
});
