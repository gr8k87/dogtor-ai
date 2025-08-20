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

// Initialize Supabase client
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

// History API endpoints
app.get("/api/history/list", async (_req, res) => {
  try {
    console.log("📋 Fetching history from Supabase...");
    const { data, error } = await supabase
      .from("history")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase history fetch error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("✅ Retrieved", data?.length || 0, "history entries");
    res.json(data || []);
  } catch (err) {
    console.error("❌ History list error:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

app.post("/api/history/save", async (req, res) => {
  try {
    const { prompt, response, userId = "demo-user" } = req.body;
    
    const { data, error } = await supabase
      .from("history")
      .insert([{ 
        prompt, 
        response, 
        user_id: userId,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error("❌ Supabase history save error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("✅ Saved to history via save endpoint");
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ History save error:", err);
    res.status(500).json({ error: "Failed to save history" });
  }
});

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
app.use(express.static(path.join(__dirname, "..", "client", "build")));
app.get("*", (_req, res) =>
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html")),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
