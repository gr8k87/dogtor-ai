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

r.post("/results", async (req, res) => {
  const { symptoms, imageUrl } = req.body || {};
  console.log("🔍 Results request received:", { symptoms, imageUrl });

  try {
    // Generate 3 separate prompts for the 3 cards
    const prompt = {
      role: "system",
      content: `
    You are a veterinary diagnostic assistant.

    Your task:
    - Analyze the provided dog photo (if present) and symptom notes (if provided).
    - Return ONLY valid JSON. Do not include any extra text, explanations, or markdown.

    If analysis is possible:
    Return the following structure:
    {
      "diagnosis": {
        "title": "Diagnosis",
        "likely_condition": "...",
        "other_possibilities": [
          { "name": "...", "likelihood": "high/medium/low" }
        ],
        "urgency": {
          "badge": "🟢 | 🟡 | 🔴",
          "level": "Low | Moderate | High",
          "note": "short explanation"
        }
      },
      "care": {
        "title": "General Care Tips",
        "tips": [
          { "icon": "🧼", "text": "Tip 1" },
          { "icon": "🥩", "text": "Tip 2" }
        ],
        "disclaimer": "This information is for educational purposes only and not a substitute for professional veterinary advice."
      },
      "costs": {
        "title": "Vet Procedures & Costs",
        "disclaimer": "Prices are typical for GTA, Ontario clinics. Costs may vary.",
        "steps": [
          { "icon": "💉", "name": "Procedure", "likelihood": "high/medium/low", "desc": "short description", "cost": "$100–$300 CAD" }
        ]
      }
    }

    If you are unable to analyze the image for ANY reason (e.g., poor quality, unsupported format, content restrictions, missing info):
    Return the following JSON instead:
    {
      "error": {
        "reason": "short explanation of why analysis could not be done",
        "suggestions": [
          "Actionable step 1",
          "Actionable step 2"
        ]
      }
    }
    `,
    };

    const userPrompt = imageUrl
      ? `Analyze this pet image for health concerns. Symptoms: ${symptoms}`
      : `Pet health analysis based on symptoms: ${symptoms}`;

    // Call OpenAI for each card
    const cards = {};

    for (let i = 0; i < prompts.length; i++) {
      let messages = [prompts[i]];

      if (imageUrl && i === 0) {
        // Only add image to first prompt
        const imagePath = path.join(__dirname, "..", imageUrl);

        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);
          const base64Image = imageBuffer.toString("base64");
          const mimeType = imageUrl.toLowerCase().includes(".png")
            ? "image/png"
            : "image/jpeg";

          messages.push({
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64Image}` },
              },
            ],
          });
        } else {
          messages.push({ role: "user", content: userPrompt });
        }
      } else {
        messages.push({ role: "user", content: userPrompt });
      }

      const completion = await client.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.3,
        max_tokens: 500,
      });

      let rawContent = completion.choices[0].message.content.trim();
      if (rawContent.startsWith("```")) {
        rawContent = rawContent
          .replace(/```(json)?\n?/, "")
          .replace(/\n?```$/, "");
      }

      const parsed = JSON.parse(rawContent);
      Object.assign(cards, parsed);
    }

    // Save to history
    supabase
      .from("history")
      .insert([
        {
          prompt: symptoms || "Image analysis",
          response: JSON.stringify(cards),
          created_at: new Date().toISOString(),
        },
      ])
      .then(() => console.log("✅ Saved to history"))
      .catch((err) => console.error("❌ Failed to save to history:", err));

    res.json({ cards });
  } catch (err) {
    console.error("❌ Results error:", err.message, err);
    res.status(500).json({ error: "AI analysis failed: " + err.message });
  }
});

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
