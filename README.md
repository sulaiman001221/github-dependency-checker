# 📦 GitHub Repo Dependency Checker

A web tool that checks for outdated dependencies in any public GitHub repository. Just paste a GitHub repo URL, and instantly see which `npm` packages are up-to-date, outdated, or dangerously behind.

---

## 🚀 Live Demo

👉 [Live App](https://your-deployed-app-link.com) <!-- Replace with actual link when deployed -->

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
- ✅ Built using modern JavaScript

---

## 🖼️ Screenshots

<!-- Add screenshots here when ready -->
![Screenshot](./screenshot1.png)

---

## ⚙️ How It Works

1. User enters a GitHub repository URL (e.g. `https://github.com/user/project-name`)
2. The app uses GitHub's REST API to fetch the `package.json` file
3. The dependencies and devDependencies are extracted
4. Each package is checked against the npm registry for the latest version
5. Results are displayed in a table, with version status indicators

---

## 🛠 Tech Stack

| Area        | Tech                      |
|-------------|---------------------------|
| Frontend    | HTML, CSS, JavaScript     |
| API         | GitHub REST API, npm Registry |
| Versioning  | Git, GitHub               |

---

## 📁 Project Structure
```
├── index.html
├── style.css
├── app.js
└── README.md
```
> Replace with your actual structure if different.

---

## ✍️ Author

**Sulaiman Ndlovu**  
- [GitHub](https://github.com/sulaiman001221)  
- [Portfolio](https://your-portfolio-link.com) <!-- Replace with your actual portfolio -->

---

## 💡 Future Improvements

- [ ] Support for private repos using GitHub OAuth
- [ ] Vulnerability detection via Snyk API
- [ ] Export report as PDF
- [ ] Support for `yarn.lock` or `pnpm-lock.yaml`

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
