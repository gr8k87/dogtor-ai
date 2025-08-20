import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import diagnose from "./routes/diagnose.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory:", uploadsDir);
}

// --- Multer storage setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// health + api
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/diagnose", diagnose);

// --- Upload route ---
app.post("/api/upload", upload.single("image"), (req, res) => {
  console.log("📤 Upload request received");
  if (!req.file) {
    console.log("❌ No file in upload request");
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  console.log("✅ File uploaded successfully:", {
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    path: req.file.path,
    imageUrl: imageUrl,
  });

  res.json({ imageUrl });
});

// --- Serve uploaded files ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// serve client build
app.use(express.static(path.join(__dirname, "static")));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "static", "index.html")),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
