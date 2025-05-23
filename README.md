# 📦 GitHub Repo Dependency Checker

A web tool that checks for outdated dependencies in any public GitHub repository. Just paste a GitHub repo URL, and instantly see which `npm` packages are up-to-date, outdated, or dangerously behind.

---

## 🚀 Live Demo

👉 [Live App](https://github-dependency-checker.onrender.com/)

---

## 🧠 Problem Solved

Developers often clone open-source repositories without realizing that some dependencies are outdated or insecure. This tool solves that by:

- Listing all `dependencies` and `devDependencies`
- Showing the installed vs latest versions
- Highlighting outdated or major-breaking packages
- Offering a quick health check before running or contributing to a repo

---

## 🔧 Features

- ✅ Paste any public GitHub repo URL
- ✅ Fetches and parses `package.json`
- ✅ Checks each dependency against the npm registry
- ✅ Highlights outdated packages with clear visual feedback
- ✅ Clean and simple UI — no login required
- ✅ Express backend with dedicated API routes
- ✅ Jasmine unit tests for core logic

---

## ⚙️ How It Works

1. User enters a GitHub repository URL (e.g., `https://github.com/user/project-name`)
2. The app uses GitHub's REST API to fetch the `package.json` file
3. The `dependencies` and `devDependencies` are extracted
4. Each dependency is checked against the npm registry
5. Results are shown with visual indicators for up-to-date, minor, major, and critical updates

---

## 🛠 Tech Stack

| Area       | Tech                          |
| ---------- | ----------------------------- |
| Frontend   | HTML, CSS, JavaScript         |
| Backend    | Node.js, Express              |
| APIs       | GitHub REST API, npm Registry |
| Testing    | Jasmine, npm                  |
| Versioning | Git, GitHub                   |
| Deployment | Render                        |

---

## 📁 Project Structure

```
/github-dependency-checker
│
├── public/
│ ├── index.html
│ ├── app.js
│ └── styles.css
│
├── src/
│ ├── github-dependency-checker.js
│ ├── utils/
│ │ └── error-messages.js
│ └── server/
│   └── server.js
│   └── routes/
│     └── dependency.js
│
├── spec/
│ ├── github-dependency-checker-spec.js
│ └── support/
│   └── jasmine.mjs
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

```

---

## 🧪 API Endpoints

| Method | Endpoint            | Description                                                              |
| ------ | ------------------- | ------------------------------------------------------------------------ |
| POST   | `/api/dependencies` | Accepts `repoUrl` and returns a list of dependencies and devDependencies |
| POST   | `/api/outdated`     | Accepts a dependency list and returns outdated status from npm registry  |

---

## 🖥️ How to Run Locally

## 1️. Install Dependencies

```bash
npm install
```

## 2️. Create a GitHub Token

To fetch `package.json` files from public GitHub repositories using the GitHub API, you’ll need a personal access token.

### Steps:

1. Go to [GitHub Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it a name and select the `public_repo` scope
4. Click **Generate token**
5. **Copy the token** — you won’t be able to see it again!

## 3️. Create a `.env` File

Create a `.env` file in the root directory of your project:

```env
GITHUB_TOKEN=your_github_token_here
PORT=3000
```

Replace `your_github_token_here` with the token you generated in the previous step.

## 4️. Switch to localhost
Update line 68 and 88 of `./public/app.js` to:
```JavaScript
const response = await fetch("http://localhost:3000/api/...", { ... });
```
replace `...` with the actual code. You are only adding localhost and port.

## 5️. Start the Server

```bash
npm run dev
```

## 6️⃣. Open in Your Browser

Navigate to:

```
http://localhost:3000
```

## ✅ Running Tests

This project uses Jasmine for unit testing the dependency-check logic.

To run the tests:

```bash
npm test
```

## ✍️ Author

**Sulaiman Ndlovu**

- [GitHub](https://github.com/sulaiman001221)
- [Portfolio](https://sulaiman001221.github.io/portfolio/)

---

## 💡 Future Improvements

- [ ] ⚡ Improve performance for large repos
- [ ] 🧠 Add support for Python (requirements.txt) and other languages
- [ ] 🔐 Support private repos using GitHub OAuth
- [ ] 🛡️ Add vulnerability detection (e.g., Snyk API)
- [ ] 📄 Export report as PDF
- [ ] ✅ Add frontend + server integration tests

---

## 📜 License

This project is licensed under the [MIT License]([MIT License](https://github.com/sulaiman001221/github-dependency-checker/blob/main/LICENSE)
).
