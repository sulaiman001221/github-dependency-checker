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

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "../../public")));

// API routes
app.use("/api", dependencyRoutes);

// Fallback route (optional, for SPA behavior)
// app.get((req, res) => {
//   res.sendFile(path.join(__dirname, "../../public/index.html"));
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

