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

// 🔹 Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

r.post("/triage", async (req, res) => {
  const { notes, imageUrl } = req.body || {};

  console.log("🔍 Triage request received:", { notes, imageUrl });

  try {
    console.log("🤖 Calling OpenAI API with vision...");
    
    let messages = [
      {
        role: "system",
        content: "You are an expert veterinary triage assistant. Analyze the uploaded pet image as your primary diagnostic tool, supplemented by any provided notes. Focus on visible symptoms, body language, and physical appearance. Always reply in JSON with fields: triage_summary, possible_causes, recommended_actions, urgency_level."
      }
    ];

    // If image is provided, read and encode it
    if (imageUrl) {
      const imagePath = path.join(__dirname, "..", imageUrl);
      console.log("📸 Reading image from:", imagePath);
      
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = imageUrl.toLowerCase().includes('.png') ? 'image/png' : 'image/jpeg';
        
        messages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze this pet image for any visible health concerns or symptoms. ${notes ? `Additional notes from owner: ${notes}` : 'No additional notes provided.'}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        });
      } else {
        console.error("❌ Image file not found:", imagePath);
        return res.status(400).json({ error: "Image file not found" });
      }
    } else {
      // No image provided, use text only
      messages.push({
        role: "user",
        content: `Pet health analysis based on owner notes: ${notes || 'No notes provided'}`
      });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",  // Use vision-capable model
      messages: messages,
      temperature: 0.3,
      max_tokens: 1000
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

    // Save to history in Supabase
    try {
      await supabase.from('history').insert([
        {
          prompt: notes || 'Image analysis',
          response: JSON.stringify(parsed),
          created_at: new Date().toISOString()
        }
      ]);
      console.log("✅ Saved to history");
    } catch (historyErr) {
      console.error("❌ Failed to save to history:", historyErr);
      // Don't fail the main request if history save fails
    }

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