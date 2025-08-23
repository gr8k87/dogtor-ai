import { Router } from "express";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const r = Router();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

// Create a new case and generate questions
r.post("/cases", async (req, res) => {
  const { symptoms, imageUrl } = req.body || {};
  console.log("📝 Case creation request:", { symptoms, imageUrl });

  try {
    // Create draft case in database
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .insert([{
        symptoms: symptoms || "general health check",
        image_url: imageUrl,
        status: "draft",
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (caseError) {
      console.error("❌ Case creation error:", caseError);
      return res.status(500).json({ error: "Failed to create case: " + caseError.message });
    }

    const caseId = caseData.id;
    console.log("✅ Case created with ID:", caseId);

    // Generate questions using existing logic
    const prompt = {
      role: "system",
      content: `
You are a veterinary AI assistant. Analyze the provided photo/symptoms and generate 3 targeted questions to gather more diagnostic information.

Return ONLY JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "type": "select|radio|yesno|text|number",
      "label": "Question text here?",
      "options": ["option1", "option2"] // only for select/radio types
      "required": true
    }
  ]
}

Question types:
- "select": dropdown with options array
- "radio": radio buttons with options array  
- "yesno": yes/no buttons
- "text": text input
- "number": number input

Make questions specific to the likely condition you see. Focus on symptoms, duration, behavior changes, eating/drinking habits, etc.
      `
    };

    let messages = [prompt];
    const userPrompt = imageUrl
      ? `Generate 3 diagnostic questions based on this pet image. Symptoms noted: ${symptoms || "none provided"}`
      : `Generate 3 diagnostic questions based on these symptoms: ${symptoms || "general health check"}`;

    if (imageUrl) {
      const imagePath = path.join(__dirname, "..", imageUrl);
      if (fs.existsSync(imagePath)) {
        let imageBuffer = fs.readFileSync(imagePath);

        // Optimize image
        imageBuffer = await sharp(imageBuffer)
          .resize(1024, 1024, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toBuffer();

        const base64Image = imageBuffer.toString("base64");
        const mimeType = "image/jpeg";

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

    try {
      // Use Gemini for questions generation
      const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const systemPrompt = `You are a veterinary AI assistant. Analyze the provided photo/symptoms and generate 3 targeted questions to gather more diagnostic information.

CRITICAL: Return ONLY JSON with primitive string values. NO HTML, JSX, React syntax, or markup elements.
- All property values MUST be plain text strings
- Do NOT use angle brackets < > in any values
- Do NOT use React-like syntax or HTML tags
- Format all text as simple readable strings without any tags

Return ONLY JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "type": "select|radio|yesno",
      "label": "Question text here?",
      "options": ["option1", "option2", "option3"],
      "required": true
    }
  ]
}

Question types (ONLY use these):
- "select": dropdown with 3-5 options for single choice (breeds, age ranges, medications)
- "radio": radio buttons with 2-4 options for single choice (severity levels, frequency, yes/no variations)  
- "yesno": simple yes/no questions (automatically creates Yes/No options)

IMPORTANT RULES:
- Never use "text" or "number" types
- Always provide an "options" array for "select" and "radio" types
- Convert duration questions to ranges like "Less than 24 hours", "1-3 days", "1-2 weeks", "More than 2 weeks"
- Convert severity to "Mild", "Moderate", "Severe"
- Convert frequency to "Never", "Rarely", "Sometimes", "Often", "Always"
- Make all questions clickable/selectable by the user

Make questions specific to the likely condition you see. Focus on symptoms, duration, behavior changes, eating/drinking habits, etc.`;

      let result;

      if (imageUrl) {
        const imagePath = path.join(__dirname, "..", imageUrl);
        if (fs.existsSync(imagePath)) {
          let imageBuffer = fs.readFileSync(imagePath);
          
          // Optimize image for Gemini
          imageBuffer = await sharp(imageBuffer)
            .resize(1024, 1024, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toBuffer();

          const imageParts = [{
            inlineData: {
              data: imageBuffer.toString("base64"),
              mimeType: "image/jpeg"
            }
          }];

          const promptWithImage = `${systemPrompt}

Generate 3 diagnostic questions based on this pet image. Symptoms noted: ${symptoms || "none provided"}`;

          result = await model.generateContent([promptWithImage, ...imageParts]);
        } else {
          const textPrompt = `${systemPrompt}

Generate 3 diagnostic questions based on these symptoms: ${symptoms || "general health check"}`;
          result = await model.generateContent(textPrompt);
        }
      } else {
        const textPrompt = `${systemPrompt}

Generate 3 diagnostic questions based on these symptoms: ${symptoms || "general health check"}`;
        result = await model.generateContent(textPrompt);
      }

      let rawContent = result.response.text().trim();
      if (rawContent.startsWith("```")) {
        rawContent = rawContent
          .replace(/```(json)?\n?/, "")
          .replace(/\n?```$/, "");
      }

      const parsed = JSON.parse(rawContent);
      
      // Validate questions response to ensure no React elements
      function validateQuestions(questions) {
        if (!Array.isArray(questions)) return [];
        
        return questions.map(q => ({
          id: String(q.id || ''),
          type: String(q.type || 'yesno'),
          label: String(q.label || ''),
          options: Array.isArray(q.options) ? q.options.map(opt => String(opt)) : [],
          required: Boolean(q.required)
        }));
      }
      
      const validatedQuestions = validateQuestions(parsed.questions);

      // Store questions in case
      const { error: updateError } = await supabase
        .from("cases")
        .update({ questions: validatedQuestions })
        .eq("id", caseId);

      if (updateError) {
        console.error("❌ Questions storage error:", updateError);
      }

      console.log("✅ Questions generated and stored for case:", caseId);
      res.json({ caseId, questions: validatedQuestions });

    } catch (aiError) {
      console.error("❌ AI Questions generation error:", aiError.message);

      // Store error in case
      const { error: updateError } = await supabase
        .from("cases")
        .update({ 
          error_message: aiError.message,
          status: "error" 
        })
        .eq("id", caseId);

      // Still return success with caseId so frontend can redirect
      res.json({ 
        caseId, 
        questions: [],
        warning: "Questions generation failed, but case created"
      });
    }

  } catch (err) {
    console.error("❌ Case creation error:", err.message);
    res.status(500).json({ 
      error: "Failed to create case: " + err.message
    });
  }
});

// Get questions for a case
r.get("/questions/:caseId", async (req, res) => {
  const { caseId } = req.params;
  console.log("❓ Questions fetch request for case:", caseId);

  try {
    const { data: caseData, error } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .single();

    if (error) {
      console.error("❌ Case fetch error:", error);
      return res.status(404).json({ error: "Case not found: " + error.message });
    }

    if (!caseData) {
      console.error("❌ No case data returned for ID:", caseId);
      return res.status(404).json({ error: "Case not found" });
    }

    console.log("📋 Case data retrieved:", {
      id: caseData.id,
      hasQuestions: !!caseData.questions,
      questionsCount: caseData.questions?.length || 0,
      status: caseData.status
    });

    const questions = caseData.questions || [];
    console.log("✅ Returning questions:", questions);
    
    res.json({ 
      questions,
      caseStatus: caseData.status,
      debug: {
        caseId: caseData.id,
        questionsFound: questions.length > 0
      }
    });
  } catch (err) {
    console.error("❌ Questions fetch error:", err);
    res.status(500).json({ error: "Failed to fetch questions: " + err.message });
  }
});

r.post("/questions", async (req, res) => {
  const { symptoms, imageUrl } = req.body || {};
  console.log("❓ Questions request received:", { symptoms, imageUrl });

  try {
    const prompt = {
      role: "system",
      content: `
        Generate 3-5 follow-up questions based on the symptoms: ${symptoms}. 
        
        CRITICAL: Return ONLY JSON with primitive string values. NO HTML, JSX, React syntax, or markup elements.
        - All property values MUST be plain text strings
        - Do NOT use angle brackets < > in any values
        - Do NOT use React-like syntax or HTML tags
        - Format all text as simple readable strings without any tags
        
        Return ONLY a JSON array of question objects with this exact structure:
        [
          {
            "id": "question_1", 
            "type": "radio",
            "question": "Question text?",
            "options": ["Option 1", "Option 2", "Option 3"],
            "required": true
          }
        ]

        Question types to use:
        - "radio": single choice (use for yes/no, severity levels, duration, frequency)
        - "checkbox": multiple choice (use for multiple symptoms selection)  
        - "dropdown": single choice from longer lists (use for breeds, age ranges, medications)

        Do NOT include "text" input questions. Only use "radio", "checkbox", or "dropdown" types.
        Ensure all questions have the "options" array populated with relevant choices.
      `
    };

    let messages = [prompt];
    const userPrompt = imageUrl
      ? `Generate 3 diagnostic questions based on this pet image. Symptoms noted: ${symptoms || "none provided"}`
      : `Generate 3 diagnostic questions based on these symptoms: ${symptoms || "general health check"}`;

    if (imageUrl) {
      const imagePath = path.join(__dirname, "..", imageUrl);
      if (fs.existsSync(imagePath)) {
        let imageBuffer = fs.readFileSync(imagePath);

        // Optimize image
        imageBuffer = await sharp(imageBuffer)
          .resize(1024, 1024, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toBuffer();

        const base64Image = imageBuffer.toString("base64");
        const mimeType = "image/jpeg";

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

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.3,
      max_tokens: 800,
    });

    let rawContent = completion.choices[0].message.content.trim();
    if (rawContent.startsWith("```")) {
      rawContent = rawContent
        .replace(/```(json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(rawContent);
    
    // Validate questions response to ensure no React elements
    function validateQuestions(questions) {
      if (!Array.isArray(questions)) return [];
      
      return questions.map(q => ({
        id: String(q.id || ''),
        type: String(q.type || 'radio'),
        question: String(q.question || ''),
        options: Array.isArray(q.options) ? q.options.map(opt => String(opt)) : [],
        required: Boolean(q.required)
      }));
    }
    
    const validatedQuestions = validateQuestions(parsed);
    console.log("✅ Generated questions:", validatedQuestions);

    res.json(validatedQuestions);
  } catch (err) {
    console.error("❌ Questions generation error:", err.message);
    res.status(500).json({ 
      error: "Failed to generate questions: " + err.message,
      details: err.message 
    });
  }
});

r.post("/results", async (req, res) => {
  const { caseId, answers, symptoms, imageUrl } = req.body || {};
  const timingStart = Date.now();
  const timings = {};

  console.log("🔍 Results request received:", { caseId, answers, symptoms, imageUrl });
  console.log("⏱️ Request started at:", new Date(timingStart).toISOString());

  try {
    let caseData = null;
    let finalSymptoms = symptoms;
    let finalImageUrl = imageUrl;

    // If caseId provided, get case data
    if (caseId) {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (error) {
        console.error("❌ Case fetch error:", error);
        return res.status(404).json({ error: "Case not found" });
      }

      caseData = data;
      finalSymptoms = caseData.symptoms;
      finalImageUrl = caseData.image_url;

      // Update case with answers if provided
      if (answers && Object.keys(answers).length > 0) {
        await supabase
          .from("cases")
          .update({ answers })
          .eq("id", caseId);
      }
    }

    // Generate 3 separate prompts for the 3 cards
    const prompt = {
      role: "system",
      content: `
    You are a veterinary diagnostic assistant.

    Analyze the provided photo and notes.

    CRITICAL: Return ONLY JSON with primitive string values. NO HTML, JSX, React syntax, or markup elements.
    - All property values MUST be plain text strings
    - Do NOT use angle brackets < > in any values
    - Do NOT use React-like syntax or HTML tags
    - Do NOT include any formatting markup in string values
    - Format all text as simple readable strings without any tags

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

    let userPrompt = finalImageUrl
      ? `Analyze this pet image for health concerns. Symptoms: ${finalSymptoms || "none provided"}`
      : `Pet health analysis based on symptoms: ${finalSymptoms || "none provided"}`;

    if (answers && Object.keys(answers).length > 0) {
      const answerText = Object.entries(answers)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      userPrompt += `. Additional information from follow-up questions: ${answerText}`;
    }

    // Call OpenAI
    const cards = {};
    let messages = [prompt];

      if (finalImageUrl) {
      const fileReadStart = Date.now();
      const imagePath = path.join(__dirname, "..", finalImageUrl);

      if (fs.existsSync(imagePath)) {
        let imageBuffer = fs.readFileSync(imagePath);

        // Optimize image: convert to JPEG and resize to max 1024x1024
        const optimizeStart = Date.now();
        console.log("🖼️ Optimizing image...");

        imageBuffer = await sharp(imageBuffer)
          .resize(1024, 1024, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toBuffer();

        const optimizeEnd = Date.now();
        timings.imageOptimization = optimizeEnd - optimizeStart;
        console.log("⏱️ Image optimization completed:", timings.imageOptimization + "ms");

        const base64Image = imageBuffer.toString("base64");
        const fileReadEnd = Date.now();
        timings.fileRead = fileReadEnd - fileReadStart;
        console.log("⏱️ File read completed:", timings.fileRead + "ms");

        const mimeType = "image/jpeg"; // Always JPEG after optimization

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

    const completion = await openaiClient.chat.completions.create({
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
    
    // Server-side validation to ensure all values are primitives
    function validateAndCleanResponse(obj) {
      if (obj === null || obj === undefined) return obj;
      
      if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
        return String(obj);
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => validateAndCleanResponse(item));
      }
      
      if (typeof obj === 'object') {
        // Check for React element-like objects
        if (obj.$$typeof || obj.type || (obj.props && typeof obj.props === 'object')) {
          console.warn("🚨 Found React element-like object, converting to string");
          return "[converted-react-element]";
        }
        
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
          cleaned[key] = validateAndCleanResponse(value);
        }
        return cleaned;
      }
      
      return String(obj);
    }
    
    const cleanedParsed = validateAndCleanResponse(parsed);
    
    const processingEnd = Date.now();
    timings.responseProcessing = processingEnd - processingStart;
    console.log("⏱️ Response processing completed:", timings.responseProcessing + "ms");

    // Check if AI returned an error response
    if (cleanedParsed.error) {
      console.log("🚫 AI refused analysis:", cleanedParsed.error.reason);
      return res.status(400).json({
        error: "Analysis not possible",
        details: {
          reason: cleanedParsed.error.reason,
          suggestions: cleanedParsed.error.suggestions || []
        }
      });
    }

    Object.assign(cards, cleanedParsed);

    // Calculate total time and log summary
    const totalTime = Date.now() - timingStart;
    timings.total = totalTime;

    console.log("⏱️ === TIMING SUMMARY ===");
    console.log("⏱️ File Read:", (timings.fileRead || 0) + "ms");
    console.log("⏱️ Image Optimization:", (timings.imageOptimization || 0) + "ms");
    console.log("⏱️ OpenAI API Call:", timings.openaiCall + "ms");
    console.log("⏱️ Response Processing:", timings.responseProcessing + "ms");
    console.log("⏱️ Total Request Time:", timings.total + "ms");
    console.log("⏱️ Request completed at:", new Date().toISOString());
    console.log("⏱️ ==================");

    // Update case status to completed if caseId provided
    if (caseId) {
      await supabase
        .from("cases")
        .update({ 
          status: "completed",
          diagnosis: cards,
          completed_at: new Date().toISOString()
        })
        .eq("id", caseId);
    }

    // Save to history (non-blocking)
    const historyStart = Date.now();
    supabase
      .from("history")
      .insert([
        {
          prompt: finalSymptoms || "Image analysis",
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

CRITICAL: Return ONLY JSON with primitive string values. NO HTML, JSX, React syntax, or markup elements.
- All property values MUST be plain text strings
- Do NOT use angle brackets < > in any values
- Do NOT use React-like syntax or HTML tags
- Format all text as simple readable strings without any tags

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
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
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