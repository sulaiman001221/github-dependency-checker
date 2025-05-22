import express from "express";
import {
  checkDependencies,
  checkOutdatedPackages,
} from "../../github-dependency-checker.js";

const router = express.Router();

router.post("/dependencies", async (req, res) => {
  try {
    const { repoUrl } = req.body;
    const data = await checkDependencies(repoUrl);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/outdated", async (req, res) => {
  try {
    const { dependencies } = req.body;
    const result = await checkOutdatedPackages(dependencies);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
