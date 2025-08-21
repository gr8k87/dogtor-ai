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
  const timingStart = Date.now();
  const timings = {};
  
  console.log("🔍 Results request received:", { symptoms, imageUrl });
  console.log("⏱️ Request started at:", new Date(timingStart).toISOString());

  try {
    // Generate 3 separate prompts for the 3 cards
    const prompt = {
      role: "system",
      content: `
    You are a veterinary diagnostic assistant.

    Analyze the provided photo and notes.

    - If you can analyze: return the structured JSON object with diagnosis, care, and costs.
    - If you cannot analyze (due to content policy, low quality, unsupported format, safety restrictions, or missing data), 
      return a JSON object like this:
      {
        "error": {
          "reason": "Explain why analysis could not be done",
          "suggestions": ["Actionable fix 1", "Actionable fix 2"]
        }
      }

    Return ONLY JSON. Do not include extra text or markdown.

    If analysis is possible, return this structure:
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
    `,
    };

    const userPrompt = imageUrl
      ? `Analyze this pet image for health concerns. Symptoms: ${symptoms}`
      : `Pet health analysis based on symptoms: ${symptoms}`;

    // Call OpenAI
    const cards = {};
    let messages = [prompt];

      if (imageUrl) {
      const fileReadStart = Date.now();
      const imagePath = path.join(__dirname, "..", imageUrl);

      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString("base64");
        const fileReadEnd = Date.now();
        timings.fileRead = fileReadEnd - fileReadStart;
        console.log("⏱️ File read completed:", timings.fileRead + "ms");
        
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

    const openaiStart = Date.now();
    console.log("⏱️ OpenAI API call started at:", new Date(openaiStart).toISOString());
    
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.3,
      max_tokens: 500,
    });

    const openaiEnd = Date.now();
    timings.openaiCall = openaiEnd - openaiStart;
    console.log("⏱️ OpenAI API call completed:", timings.openaiCall + "ms");

    const processingStart = Date.now();
    let rawContent = completion.choices[0].message.content.trim();
    if (rawContent.startsWith("```")) {
      rawContent = rawContent
        .replace(/```(json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(rawContent);
    const processingEnd = Date.now();
    timings.responseProcessing = processingEnd - processingStart;
    console.log("⏱️ Response processing completed:", timings.responseProcessing + "ms");
    
    // Check if AI returned an error response
    if (parsed.error) {
      console.log("🚫 AI refused analysis:", parsed.error.reason);
      return res.status(400).json({
        error: "Analysis not possible",
        details: {
          reason: parsed.error.reason,
          suggestions: parsed.error.suggestions || []
        }
      });
    }
    
    Object.assign(cards, parsed);

    // Calculate total time and log summary
    const totalTime = Date.now() - timingStart;
    timings.total = totalTime;
    
    console.log("⏱️ === TIMING SUMMARY ===");
    console.log("⏱️ File Read:", (timings.fileRead || 0) + "ms");
    console.log("⏱️ OpenAI API Call:", timings.openaiCall + "ms");
    console.log("⏱️ Response Processing:", timings.responseProcessing + "ms");
    console.log("⏱️ Total Request Time:", timings.total + "ms");
    console.log("⏱️ Request completed at:", new Date().toISOString());
    console.log("⏱️ ==================");

    // Save to history (non-blocking)
    const historyStart = Date.now();
    supabase
      .from("history")
      .insert([
        {
          prompt: symptoms || "Image analysis",
          response: JSON.stringify(cards),
          created_at: new Date().toISOString(),
        },
      ])
      .then(() => {
        const historyTime = Date.now() - historyStart;
        console.log("✅ Saved to history (" + historyTime + "ms)");
      })
      .catch((err) => console.error("❌ Failed to save to history:", err));

    res.json({ cards, timings });
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
