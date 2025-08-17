import json
import logging
import os
import asyncio
from typing import Dict, Any, Optional
import aiohttp
from google import genai
from google.genai import types
from openai import OpenAI
from models import Observations, Question, GeminiResponse, TriageSummary

logger = logging.getLogger(__name__)

# Initialize AI clients
# the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
# do not change this unless explicitly requested by the user
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class AIService:
    def __init__(self):
        self.gemini_timeout = 12
        self.openai_timeout = 12
        self.max_retries = 1

    async def analyze_image_with_gemini(self, image_url: str) -> Dict[str, Any]:
        """
        Analyze dog stool image using Gemini Vision
        Returns observations and follow-up questions
        """
        try:
            # Download image for processing
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to download image: {response.status}")
                    image_bytes = await response.read()

            # Prepare prompt for Gemini
            system_prompt = """
            You are a veterinary AI assistant analyzing dog stool images. 
            Analyze the image and extract structured observations, then generate relevant follow-up questions.
            
            Respond with JSON in this exact format:
            {
              "observations": {
                "consistency": "loose|formed|hard|watery|unknown",
                "color": "brown|yellow|green|black|red|tan|unknown", 
                "mucus": true|false,
                "blood": "none|specks|streaks|visible",
                "foreign_material": "none|grass|plastic|undigested_food|unknown",
                "notes": "detailed description of what you observe"
              },
              "questions": [
                {"id":"duration","type":"number","label":"How many days has this been occurring?","required":true},
                {"id":"diet_change","type":"select","label":"Any recent diet changes?","options":["No","Yes (new brand)","Yes (new protein)"],"required":false},
                {"id":"vomiting","type":"select","label":"Has your dog been vomiting?","options":["No","Once","Multiple times"],"required":false},
                {"id":"energy","type":"select","label":"How is your dog's energy level?","options":["Normal","Slightly low","Low"],"required":false},
                {"id":"deworming_recent","type":"select","label":"When was the last deworming?","options":["No","Within 3 months","> 3 months ago"],"required":false}
              ]
            }
            
            Be precise and professional. If you cannot clearly identify something, use "unknown" and note limitations in the notes field.
            """

            # Call Gemini with timeout and retry
            for attempt in range(self.max_retries + 1):
                try:
                    response = await asyncio.wait_for(
                        asyncio.to_thread(
                            gemini_client.models.generate_content,
                            model="gemini-2.5-pro",
                            contents=[
                                types.Part.from_bytes(
                                    data=image_bytes,
                                    mime_type="image/jpeg",
                                ),
                                system_prompt
                            ],
                            config=types.GenerateContentConfig(
                                response_mime_type="application/json",
                                response_schema=GeminiResponse,
                            )
                        ),
                        timeout=self.gemini_timeout
                    )
                    
                    if response.text:
                        result = json.loads(response.text)
                        logger.info(f"Gemini analysis successful on attempt {attempt + 1}")
                        return result
                    
                except (asyncio.TimeoutError, Exception) as e:
                    logger.warning(f"Gemini attempt {attempt + 1} failed: {e}")
                    if attempt < self.max_retries:
                        await asyncio.sleep(2 ** attempt)  # exponential backoff
                    continue

            # Fallback response if all attempts fail
            logger.error("Gemini analysis failed, using fallback")
            return self._get_fallback_gemini_response()

        except Exception as e:
            logger.error(f"Gemini service error: {e}")
            return self._get_fallback_gemini_response()

    async def generate_triage_with_openai(self, observations: Dict, user_answers: Dict) -> Dict[str, Any]:
        """
        Generate triage summary using OpenAI based on observations and user answers
        """
        try:
            # Prepare prompt for OpenAI
            prompt = f"""
            You are a veterinary AI assistant providing informational triage for dog health issues.
            
            IMPORTANT GUIDELINES:
            - Never provide definitive diagnoses
            - Always recommend veterinary consultation for serious symptoms
            - Be empathetic and supportive
            - Include conservative "seek vet if" thresholds
            
            Based on the following observations and owner answers, provide a triage assessment:
            
            OBSERVATIONS: {json.dumps(observations)}
            OWNER ANSWERS: {json.dumps(user_answers)}
            
            Respond with JSON in this exact format:
            {{
              "triage_summary": "Empathetic 1-2 sentence recap of the situation",
              "possible_causes": ["cause1", "cause2", "cause3"],
              "recommended_actions": ["action1", "action2", "action3"],
              "urgency_level": "Low|Moderate|High"
            }}
            
            Include monitoring advice and clear veterinary consultation triggers.
            """

            # Call OpenAI with timeout and retry
            for attempt in range(self.max_retries + 1):
                try:
                    response = await asyncio.wait_for(
                        asyncio.to_thread(
                            openai_client.chat.completions.create,
                            model="gpt-4o",
                            messages=[
                                {
                                    "role": "system", 
                                    "content": "You are a helpful veterinary AI assistant. Always recommend professional veterinary care and never provide definitive medical diagnoses."
                                },
                                {"role": "user", "content": prompt}
                            ],
                            response_format={"type": "json_object"},
                            temperature=0.3
                        ),
                        timeout=self.openai_timeout
                    )
                    
                    if response.choices and response.choices[0].message.content:
                        result = json.loads(response.choices[0].message.content)
                        logger.info(f"OpenAI triage successful on attempt {attempt + 1}")
                        return result
                    
                except (asyncio.TimeoutError, Exception) as e:
                    logger.warning(f"OpenAI attempt {attempt + 1} failed: {e}")
                    if attempt < self.max_retries:
                        await asyncio.sleep(2 ** attempt)  # exponential backoff
                    continue

            # Fallback response if all attempts fail
            logger.error("OpenAI triage failed, using fallback")
            return self._get_fallback_triage_response()

        except Exception as e:
            logger.error(f"OpenAI service error: {e}")
            return self._get_fallback_triage_response()

    def _get_fallback_gemini_response(self) -> Dict[str, Any]:
        """Fallback response when Gemini fails"""
        return {
            "observations": {
                "consistency": "unknown",
                "color": "unknown", 
                "mucus": False,
                "blood": "none",
                "foreign_material": "unknown",
                "notes": "Vision unavailable; using defaults."
            },
            "questions": [
                {"id": "duration", "type": "number", "label": "How many days has this been occurring?", "required": True},
                {"id": "diet_change", "type": "select", "label": "Any recent diet changes?", "options": ["No", "Yes (new brand)", "Yes (new protein)"], "required": False},
                {"id": "vomiting", "type": "select", "label": "Has your dog been vomiting?", "options": ["No", "Once", "Multiple times"], "required": False},
                {"id": "energy", "type": "select", "label": "How is your dog's energy level?", "options": ["Normal", "Slightly low", "Low"], "required": False},
                {"id": "deworming_recent", "type": "select", "label": "When was the last deworming?", "options": ["No", "Within 3 months", "> 3 months ago"], "required": False}
            ]
        }

    def _get_fallback_triage_response(self) -> Dict[str, Any]:
        """Fallback response when OpenAI fails"""
        return {
            "triage_summary": "We couldn't complete AI triage right now. Please monitor your dog's hydration and contact a veterinarian if symptoms persist >48 hours or worsen.",
            "possible_causes": ["Unable to determine at this time"],
            "recommended_actions": [
                "Monitor your dog's hydration and appetite",
                "Contact a veterinarian if symptoms persist beyond 48 hours",
                "Seek immediate veterinary care if symptoms worsen"
            ],
            "urgency_level": "Moderate",
            "meta": {"error": True}
        }

# Create singleton instance
ai_service = AIService()
