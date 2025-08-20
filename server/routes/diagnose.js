import { Router } from "express";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const r = Router();

// 🔹 Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

r.post("/init", async (_req, res) => {
  res.json({
    visual_features: { example: true },
    suggested_questions: [
      {
        id: "duration_days",
        type: "number",
        label: "How many days has this been happening?",
        min: 0,
        max: 30,
        step: 1,
        required: true,
      },
      {
        id: "diet_change",
        type: "select",
        label: "Recent diet change?",
        options: ["Yes", "No", "Not sure"],
        required: true,
      },
      {
        id: "energy",
        type: "radio",
        label: "Energy level",
        options: ["Normal", "Slightly low", "Very low"],
        required: true,
      },
      { id: "vomiting", type: "yesno", label: "Any vomiting?", required: true },
      {
        id: "notes",
        type: "text",
        label: "Anything else to add?",
        placeholder: "Optional notes",
      },
    ],
  });
});

r.post("/triage", async (req, res) => {
  const { imagePresent, answers } = req.body || {};

  console.log("🔍 Triage request received:", { imagePresent, answers });

  try {
    console.log("🤖 Calling OpenAI API...");
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a veterinary triage assistant. Always reply in JSON with fields: triage_summary, possible_causes, recommended_actions, urgency_level.",
        },
        {
          role: "user",
          content: `Dog symptoms: ${JSON.stringify(
            answers,
          )}. Image uploaded: ${imagePresent ? "yes" : "no"}`,
        },
      ],
      temperature: 0.3,
    });

    console.log("✅ OpenAI API response received");
    const rawContent = completion.choices[0].message.content;
    console.log("📝 Raw AI response:", rawContent);

    // Clean the response by removing markdown code block formatting if present
    let cleanedContent = rawContent.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    cleanedContent = cleanedContent.trim();

    console.log("🧹 Cleaned content:", cleanedContent);

    const parsed = JSON.parse(cleanedContent);
    console.log("✅ Successfully parsed JSON:", parsed);
    res.json(parsed);
  } catch (err) {
    console.error("❌ AI error details:", err.message);
    console.error("❌ Full error:", err);

    if (err.code === "insufficient_quota") {
      res.status(500).json({ error: "OpenAI API quota exceeded" });
    } else if (err.code === "invalid_api_key") {
      res.status(500).json({ error: "Invalid OpenAI API key" });
    } else {
      res.status(500).json({ error: "AI triage failed: " + err.message });
    }
  }
});

export default r;