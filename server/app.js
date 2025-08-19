import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import diagnose from "./routes/diagnose.js";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ storage });
const app = express();

app.use(express.json());

// Storage config: save files in ./uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// health + api
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/diagnose", diagnose);

// serve client build
app.use(express.static(path.join(__dirname, "static")));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "static", "index.html")),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  // Return a relative URL so frontend can display later
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
