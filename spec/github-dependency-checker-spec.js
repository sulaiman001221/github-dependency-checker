import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import {
  headers,
  parseGitHubRepoURL,
  checkOwnerExists,
  checkRepositoryExists,
  checkDependencies,
  checkOutdatedPackages,
} from "../src/github-dependency-checker.js";
import { errorMessages } from "../src/utils/error-messages.js";

const GITHUB_API_URL = "https://api.github.com";
const NPM_REGISTRY_URL = "https://registry.npmjs.org";

const mockUser = {
  owner: "Sulaiman",
  repo: "github-dependency-checker",
};

const urls = {
  ownerUrl: (owner) => `${GITHUB_API_URL}/users/${owner}/repos`,
  repoUrl: (owner, repo) => `${GITHUB_API_URL}/repos/${owner}/${repo}`,
  packageJsonUrl: (owner, repo) =>
    `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/package.json`,
};

describe("GitHub Dependency Checker", () => {
  describe("checkOwnerExists function", () => {
    it("should throw an error if the owner does not exist", async () => {
      spyOn(axios, "get").and.callFake(() =>
        Promise.reject({ response: { status: 404 } })
      );
      const invalidOwner = "muzi";

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
      const owner = "Umuzi";
      const invalidRepo = "ANC-syllabus";

      await expectAsync(
        checkRepositoryExists(owner, invalidRepo, { headers })
      ).toBeRejectedWithError(
        errorMessages.repositoryNotFound(invalidRepo, owner)
      );

      expect(axios.get).toHaveBeenCalledOnceWith(
        urls.repoUrl(owner, invalidRepo),
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
      expect(parseGitHubRepoURL(url)).toEqual({
        owner: "sula",
        repo: "Hello-World",
      });
    });

    it("should extract owner and repo even if there's a trailing slash", () => {
      const url = "https://github.com/sula/Hello-World/";
      expect(parseGitHubRepoURL(url)).toEqual({
        owner: "sula",
        repo: "Hello-World",
      });
    });

    it("should throw an error for a malformed GitHub URL", () => {
      expect(() =>
        parseGitHubRepoURL("https://notgithub.com/sula/Hello-World")
      ).toThrowError(errorMessages.invalidRepoUrl);
    });

    it("should throw an error for missing repo name", () => {
      expect(() => parseGitHubRepoURL("https://github.com/sula")).toThrowError(
        errorMessages.invalidRepoUrl
      );
    });

    it("should throw an error for missing owner", () => {
      expect(() =>
        parseGitHubRepoURL("https://github.com//Hello-World")
      ).toThrowError(errorMessages.invalidRepoUrl);
    });
  });

  describe("checkDependencies", () => {
    const mockPackageJson = {
      name: "example-repo",
      dependencies: { lodash: "^4.17.21" },
      devDependencies: { jest: "^29.0.0" },
    };

    const encodedContent = Buffer.from(
      JSON.stringify(mockPackageJson)
    ).toString("base64");

    beforeEach(() => {
      spyOn(axios, "get").and.callFake((url) => {
        if (url === urls.ownerUrl(mockUser.owner))
          return Promise.resolve({ status: 200 });
        if (url === urls.repoUrl(mockUser.owner, mockUser.repo))
          return Promise.resolve({ status: 200 });
        if (url === urls.packageJsonUrl(mockUser.owner, mockUser.repo)) {
          return Promise.resolve({
            data: {
              type: "file",
              content: encodedContent,
            },
          });
        }
        return Promise.reject(new Error("Unexpected URL"));
      });
    });

    it("should return parsed dependencies and devDependencies", async () => {
      const result = await checkDependencies(
        `https://github.com/${mockUser.owner}/${mockUser.repo}`
      );

      expect(axios.get.calls.allArgs()).toEqual([
        [urls.ownerUrl(mockUser.owner), { headers }],
        [urls.repoUrl(mockUser.owner, mockUser.repo), { headers }],
        [urls.packageJsonUrl(mockUser.owner, mockUser.repo), { headers }],
      ]);

      expect(result).toEqual({
        name: "example-repo",
        dependencies: { lodash: "^4.17.21" },
        devDependencies: { jest: "^29.0.0" },
      });
    });
  });

  describe("checkOutdatedPackages", () => {
    beforeEach(() => {
      spyOn(axios, "get").and.callFake((url) => {
        if (url === `${NPM_REGISTRY_URL}/lodash`) {
          return Promise.resolve({
            data: { "dist-tags": { latest: "4.17.21" } },
          });
        }
        if (url === `${NPM_REGISTRY_URL}/jest`) {
          return Promise.resolve({
            data: { "dist-tags": { latest: "29.0.0" } },
          });
        }
        if (url === `${NPM_REGISTRY_URL}/unknown-pkg`) {
          return Promise.reject(new Error("Package not found"));
        }
        return Promise.reject(new Error("Unexpected package"));
      });
    });

    it("should correctly mark packages as outdated, up-to-date, or error", async () => {
      const inputDependencies = {
        lodash: "^4.17.20",
        jest: "^29.0.0",
        "unknown-pkg": "^1.0.0",
      };

      const result = await checkOutdatedPackages(inputDependencies);

      expect(result).toEqual([
        {
          name: "lodash",
          current: "^4.17.20",
          latest: "4.17.21",
          status: "outdated",
        },
        {
          name: "jest",
          current: "^29.0.0",
          latest: "29.0.0",
          status: "up-to-date",
        },
        {
          name: "unknown-pkg",
          current: "^1.0.0",
          latest: "unknown",
          status: "error",
          message: errorMessages.npmPackageCheckError(
            "unknown-pkg",
            "Package not found"
          ),
        },
      ]);
    });
  });
});
