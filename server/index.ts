// Simple redirect to the actual app.js file for the minimal scaffold
import("./app.js");
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.post("/api/history/save", async (req, res) => {
  const { prompt, response, userId = "demo-user" } = req.body;

  const { data, error } = await supabase
    .from("histories")
    .insert([{ prompt, response, user_id: userId }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

app.get("/api/history/list", async (_req, res) => {
  const { data, error } = await supabase
    .from("histories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
