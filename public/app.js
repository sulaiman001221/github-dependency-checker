const errorMessages = {
  invalidUrl:
    "Invalid GitHub URL. Please use format: https://github.com/owner/repo",
  missingRepoInfo: "Please provide repository information",
  missingDependencies: "No dependencies found in package.json",
};

const repoUrlInput = document.getElementById("repoUrl");
const ownerInput = document.getElementById("owner");
const repoInput = document.getElementById("repo");
const checkBtn = document.getElementById("checkBtn");
const refreshBtn = document.getElementById("refreshBtn");
const errorDiv = document.getElementById("error");
const errorMessage = document.getElementById("errorMessage");
const summaryDiv = document.getElementById("summary");
const resultsDiv = document.getElementById("results");
const resultsTable = document.getElementById("resultsTable");
const resultsDescription = document.getElementById("resultsDescription");
const loadingDiv = document.getElementById("loading");
const totalCount = document.getElementById("totalCount");
const upToDateCount = document.getElementById("upToDateCount");
const outdatedCount = document.getElementById("outdatedCount");
const errorCount = document.getElementById("errorCount");

let currentOwner = "";
let currentRepo = "";

checkBtn.addEventListener("click", handleCheckDependencies);
refreshBtn.addEventListener("click", handleCheckDependencies);
repoUrlInput.addEventListener("input", validateInputs);
ownerInput.addEventListener("input", validateInputs);
repoInput.addEventListener("input", validateInputs);

function validateInputs() {
  const hasRepoUrl = repoUrlInput.value.trim() !== "";
  const hasOwnerAndRepo =
    ownerInput.value.trim() !== "" && repoInput.value.trim() !== "";
  checkBtn.disabled = !(hasRepoUrl || hasOwnerAndRepo);
}

function parseGitHubRepoURL(url) {
  const githubUrlRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/;
  const match = url.match(githubUrlRegex);
  if (!match) throw new Error(errorMessages.invalidUrl);
  return { owner: match[1], repo: match[2] };
}

function extractOwnerRepo() {
  let owner = ownerInput.value.trim();
  let repo = repoInput.value.trim();

  if (repoUrlInput.value.trim()) {
    const { owner: parsedOwner, repo: parsedRepo } = parseGitHubRepoURL(
      repoUrlInput.value.trim()
    );
    owner = parsedOwner;
    repo = parsedRepo;
    ownerInput.value = owner;
    repoInput.value = repo;
  }

  if (!owner || !repo) throw new Error(errorMessages.missingRepoInfo);

  return { owner, repo };
}

async function fetchDependencies(repoUrl) {
  const response = await fetch("/api/dependencies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoUrl }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error);

  const dependencies = {
    ...data.dependencies,
    ...data.devDependencies,
  };

  if (!Object.keys(dependencies).length)
    throw new Error(errorMessages.missingDependencies);
  return dependencies;
}

async function checkOutdatedDependencies(dependencies) {
  const response = await fetch("/api/outdated", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dependencies }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error);

  return data;
}

async function handleCheckDependencies() {
  hideError();
  showLoading();
  hideResults();

  try {
    const { owner, repo } = extractOwnerRepo();
    currentOwner = owner;
    currentRepo = repo;

    const repoUrl = `https://github.com/${owner}/${repo}`;
    const dependencies = await fetchDependencies(repoUrl);
    const results = await checkOutdatedDependencies(dependencies);

    displayResults(results, owner, repo);
  } catch (err) {
    showError(`Error: ${err.message}`);
  } finally {
    hideLoading();
  }
}

function displayResults(results, owner, repo) {
  resultsTable.innerHTML = "";
  resultsDescription.textContent = `Showing ${results.length} dependencies from ${owner}/${repo}`;

  const outdated = results.filter((r) => r.status === "outdated").length;
  const upToDate = results.filter((r) => r.status === "up-to-date").length;
  const error = results.filter((r) => r.status === "error").length;

  totalCount.textContent = results.length;
  upToDateCount.textContent = upToDate;
  outdatedCount.textContent = outdated;
  errorCount.textContent = error;

  results.forEach((pkg) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="font-medium">${pkg.name}</td>
      <td>${pkg.current}</td>
      <td>${pkg.latest}</td>
      <td>
        <span class="badge ${pkg.status}">
          ${
            pkg.status === "up-to-date"
              ? "✅ Up to date"
              : pkg.status === "outdated"
              ? "⚠️ Outdated"
              : "❌ Error"
          }
        </span>
      </td>
    `;

    resultsTable.appendChild(row);
  });

  summaryDiv.classList.remove("hidden");
  resultsDiv.classList.remove("hidden");
}

function showError(message) {
  errorMessage.textContent = message;
  errorDiv.classList.remove("hidden");
}

function hideError() {
  errorDiv.classList.add("hidden");
}

function showLoading() {
  loadingDiv.classList.remove("hidden");
}

function hideLoading() {
  loadingDiv.classList.add("hidden");
}

function hideResults() {
  summaryDiv.classList.add("hidden");
  resultsDiv.classList.add("hidden");
}

validateInputs();
