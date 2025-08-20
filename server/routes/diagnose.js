import { Router } from "express";
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const r = Router();

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

  try {
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

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.json(parsed);
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "AI triage failed" });
  }
});

export default r;
