import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import diagnose from "./routes/diagnose.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// health + api
app.get("/health", (_req,res)=>res.json({ ok:true }));
app.use("/api/diagnose", diagnose);

// serve client build
app.use(express.static(path.join(__dirname, "static")));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "static", "index.html"))
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
