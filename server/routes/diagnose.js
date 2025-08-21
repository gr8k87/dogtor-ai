import { Router } from "express";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const r = Router();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

r.post("/triage", async (req, res) => {
  const { notes, imageUrl } = req.body || {};
  console.log("🔍 Diagnose request received:", { notes, imageUrl });

  try {
    let messages = [
      {
        role: "system",
        content: `
You are a veterinary triage assistant. 
Analyze the pet photo (primary) and owner notes (secondary). 
Return ONLY valid JSON structured as:

{
  "card1": {
    "title": "Diagnosis",
    "triage_summary": "...",
    "possible_causes": ["...", "..."],
    "urgency_level": "🟢 Low | 🟡 Moderate | 🔴 High"
  },
  "card2": {
    "title": "General Care Tips",
    "recommendations": ["...", "..."],
    "disclaimer": "This information is for educational purposes only and not a substitute for professional veterinary advice."
  },
  "card3": {
    "title": "Vet Procedures & Costs",
    "procedures": [
      { "name": "...", "when_needed": "...", "description": "...", "typical_cost_cad": "..." }
    ]
  }
}
        `,
      },
    ];

    // Handle image
    if (imageUrl) {
      const imagePath = path.join(__dirname, "..", imageUrl);
      console.log("📸 Reading image from:", imagePath);

      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString("base64");
        const mimeType = imageUrl.toLowerCase().includes(".png")
          ? "image/png"
          : "image/jpeg";

        messages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this pet image for health concerns. ${
                notes ? `Owner notes: ${notes}` : ""
              }`,
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
          ],
        });
      } else {
        return res.status(400).json({ error: "Image file not found" });
      }
    } else {
      messages.push({
        role: "user",
        content: `Pet health analysis based only on notes: ${notes || "No notes provided"}`,
      });
    }

    // Call OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    });

    let rawContent = completion.choices[0].message.content.trim();
    console.log("📝 Raw AI response:", rawContent);

    // Clean markdown wrappers if present
    if (rawContent.startsWith("```")) {
      rawContent = rawContent
        .replace(/```(json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(rawContent);
    console.log("✅ Parsed AI JSON:", parsed);

    // Save to history (non-blocking)
    supabase
      .from("history")
      .insert([
        {
          prompt: notes || "Image analysis",
          response: JSON.stringify(parsed),
          created_at: new Date().toISOString(),
        },
      ])
      .then(() => console.log("✅ Saved to history"))
      .catch((err) => console.error("❌ Failed to save to history:", err));

    res.json(parsed);
  } catch (err) {
    console.error("❌ Diagnose error:", err.message, err);
    res.status(500).json({ error: "AI triage failed: " + err.message });
  }
});

export default r;
