import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dependencyRoutes from "./routes/dependency.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../../public")));

app.use("/api", dependencyRoutes);

const PORT = process.env.PORT || 1000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

