// server/index.ts
import express, { Application, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import diagnoseRoutes from "./routes/diagnose.js"; // still .js since that file is JS

// ✅ Initialize express app
const app: Application = express();
app.use(express.json());

// ✅ Mount diagnose routes
app.use("/api/diagnose", diagnoseRoutes);

// ✅ Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("❌ Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ✅ History routes
app.post("/api/history/save", async (req: Request, res: Response) => {
  const { prompt, response, userId = "demo-user" } = req.body;

  const { data, error } = await supabase
    .from("histories")
    .insert([{ prompt, response, user_id: userId }]);

  if (error) {
    console.error("❌ History save failed:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true, data });
});

app.get("/api/history/list", async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("histories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ History list failed:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
