
import express from "express";

const router = express.Router();

// POST /api/diagnose/init - returns dynamic form schema
router.post("/init", (req, res) => {
  res.json({
    "visual_features": { "example": true },
    "suggested_questions": [
      { "id":"duration_days","type":"number","label":"How many days has this been happening?","min":0,"max":30,"step":1,"required":true },
      { "id":"diet_change","type":"select","label":"Recent diet change?","options":["Yes","No","Not sure"],"required":true },
      { "id":"energy","type":"radio","label":"Energy level","options":["Normal","Slightly low","Very low"],"required":true },
      { "id":"vomiting","type":"yesno","label":"Any vomiting?","required":true },
      { "id":"notes","type":"text","label":"Anything else to add?","placeholder":"Optional notes" }
    ]
  });
});

// POST /api/diagnose/triage - returns mock triage results
router.post("/triage", (req, res) => {
  const { imagePresent, answers } = req.body;
  
  res.json({
    "triage_summary":"Preliminary pre-vet guidance based on your inputs.",
    "possible_causes":["Mild GI upset (diet change)","Food intolerance","Early infection"],
    "recommended_actions":[
      "Ensure hydration (fresh water available)",
      "Revert to previous stable diet for 48 hours",
      "If symptoms persist >48h or worsen, contact a veterinarian"
    ],
    "urgency_level":"Moderate"
  });
});

export default router;
