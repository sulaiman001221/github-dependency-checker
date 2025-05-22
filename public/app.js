const errorMessages = {
  invalidUrl:
    "Invalid GitHub URL. Please use format: https://github.com/owner/repo",
  missingRepoInfo: "Please provide repository information",
  missingDependencies: "No dependencies found in package.json",
};

// DOM Elements
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

// State
let currentOwner = "";
let currentRepo = "";

// Event Listeners
checkBtn.addEventListener("click", handleCheckDependencies);
refreshBtn.addEventListener("click", handleCheckDependencies);
repoUrlInput.addEventListener("input", validateInputs);
ownerInput.addEventListener("input", validateInputs);
repoInput.addEventListener("input", validateInputs);

// Validate inputs and enable/disable check button
function validateInputs() {
  const hasRepoUrl = repoUrlInput.value.trim() !== "";
  const hasOwnerAndRepo =
    ownerInput.value.trim() !== "" && repoInput.value.trim() !== "";

  checkBtn.disabled = !(hasRepoUrl || hasOwnerAndRepo);
}

function parseGitHubRepoURL(url) {
  const githubUrlRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/;
  const match = url.match(githubUrlRegex);
  if (!match) {
    throw new Error(errorMessages.invalidUrl);
  }
  return { owner: match[1], repo: match[2] };
}

async function handleCheckDependencies() {
  hideError();
  showLoading();
  hideResults();

  let owner = ownerInput.value.trim();
  let repo = repoInput.value.trim();

  if (repoUrlInput.value.trim()) {
    const parsed = parseGitHubRepoURL(repoUrlInput.value.trim());
    if (parsed.owner && parsed.repo) {
      owner = parsed.owner;
      repo = parsed.repo;
      ownerInput.value = owner;
      repoInput.value = repo;
    } else {
      hideLoading();
      return;
    }
  }

  if (!owner || !repo) {
    showError(errorMessages.missingRepoInfo);
    hideLoading();
    return;
  }

  currentOwner = owner;
  currentRepo = repo;

  const repoUrl = `https://github.com/${owner}/${repo}`;

  try {
    const depRes = await fetch("http://localhost:3000/api/dependencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl }),
    });
    const depData = await depRes.json();
    if (!depRes.ok) throw new Error(depData.error);

    const dependencies = {
      ...depData.dependencies,
      ...depData.devDependencies,
    };

    if (!Object.keys(dependencies).length) {
      showError(errorMessages.missingDependencies);
      hideLoading();
      return;
    }

    const outRes = await fetch("http://localhost:3000/api/outdated", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dependencies }),
    });
    const results = await outRes.json();
    if (!outRes.ok) throw new Error(results.error);

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

    const nameCell = document.createElement("td");
    nameCell.className = "font-medium";
    nameCell.textContent = pkg.name;
    row.appendChild(nameCell);

    const currentCell = document.createElement("td");
    currentCell.textContent = pkg.current;
    row.appendChild(currentCell);

    const latestCell = document.createElement("td");
    latestCell.textContent = pkg.latest;
    row.appendChild(latestCell);

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `badge ${pkg.status}`;

    const icon = document.createElement("span");
    if (pkg.status === "up-to-date") {
      icon.textContent = "✅";
      badge.textContent = "Up to date";
    } else if (pkg.status === "outdated") {
      icon.textContent = "⚠️";
      badge.textContent = "Outdated";
    } else {
      icon.textContent = "❌";
      badge.textContent = "Error";
    }
    badge.prepend(icon);
    statusCell.appendChild(badge);
    row.appendChild(statusCell);

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
