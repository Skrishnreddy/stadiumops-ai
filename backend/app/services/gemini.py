import json
import logging
import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import google.generativeai as genai
from backend.app.core.config import settings
from backend.app.core.exceptions import PromptInjectionException
from backend.app.services.classifier import RuleBasedClassifier

logger = logging.getLogger("stadiumops")

class GeminiClassificationResult(BaseModel):
    category: str = Field(..., description="Matches stadium ops category")
    severity: str = Field(..., description="Low, Medium, High, or Critical")
    priority: str = Field(..., description="P1, P2, P3, or P4")
    responsible_team: str = Field(..., description="Specific stadium team assigned to handle this")
    immediate_actions: List[str] = Field(..., description="Immediate tactical steps to take (2-4 items)")
    public_communication_recommendation: str = Field(..., description="Draft warning/instructions for public broadcast boards")
    confidence: float = Field(..., description="Confidence score from 0.0 to 1.0")
    reasoning_summary: str = Field(..., description="Short 1-2 sentence explanation of classification decision, no chain of thought")

class GeminiService:
    @classmethod
    def check_prompt_injection(cls, text: str) -> None:
        """
        Scan text for common prompt injection patterns.
        """
        patterns = [
            r"ignore\s+(?:previous|all)\s+instructions",
            r"system\s+(?:override|bypass)",
            r"instead\s+of\s+doing\s+what\s+you\s+were\s+told",
            r"you\s+are\s+now\s+a\s+different\s+ai",
            r"forget\s+your\s+role",
            r"assistant\s+instructions\s+override",
            r"markdown\s+injection",
            r"inject\s+sql",
            r"DROP\s+TABLE",
            r"DELETE\s+FROM"
        ]
        text_lower = text.lower()
        for pattern in patterns:
            if re.search(pattern, text_lower):
                logger.warning(f"Potential prompt injection detected: matching pattern '{pattern}'")
                raise PromptInjectionException()

    @classmethod
    def classify_incident(cls, description: str, zone: str, gate: str) -> Dict[str, Any]:
        """
        Classifies an incident description. Falls back to RuleBasedClassifier if Gemini fails or is unconfigured.
        """
        # Step 1: Input check
        if not description or len(description.strip()) < 10:
            return RuleBasedClassifier.classify(description)

        # Step 2: Prompt injection protection
        try:
            cls.check_prompt_injection(description)
        except PromptInjectionException:
            # Re-raise to let the global or router error handler catch it
            raise

        # Step 3: Check if Gemini is configured
        if not settings.GEMINI_API_KEY:
            logger.info("GEMINI_API_KEY is not set. Falling back to Rule-Based Heuristic.")
            return RuleBasedClassifier.classify(description)

        try:
            # Configure API key
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash')

            # Build prompt
            prompt = f"""
You are a Stadium Operations Assistant for the FIFA World Cup 2026.
Classify the following stadium incident report.

Incident Report:
Description: {description}
Location: Zone: {zone}, Gate: {gate}

Respond strictly with a JSON object matching the following structure:
{{
  "category": "One of: Crowd congestion, Medical emergency, Fire or smoke, Suspicious package, Lost child, Power failure, Network failure, Access-control failure, Severe weather, General operations",
  "severity": "One of: Low, Medium, High, Critical",
  "priority": "One of: P1, P2, P3, P4",
  "responsible_team": "Name of the team responsible for managing the incident",
  "immediate_actions": ["Action item 1", "Action item 2", ...],
  "public_communication_recommendation": "Draft safety/status instruction message for public screens/PA announcements",
  "confidence": 0.95,
  "reasoning_summary": "Short 1-2 sentence explanation of classification decision, do not reveal chain of thought"
}}
"""
            # Call API with generation config requesting JSON and setting a timeout
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                ),
                request_options={"timeout": 4.0}  # 4 second timeout
            )
            
            # Parse & validate response using Pydantic
            data = json.loads(response.text)
            validated = GeminiClassificationResult(**data)
            
            return validated.model_dump()

        except Exception as e:
            logger.error(f"Gemini API invocation failed or returned invalid JSON. Error: {str(e)}. Falling back to Rule-Based Classifier.", exc_info=True)
            return RuleBasedClassifier.classify(description)

    @classmethod
    def generate_announcement(cls, incident_title: str, category: str, location: str, severity: str) -> Dict[str, str]:
        """
        Drafts a brief, professional emergency announcement in four languages.
        """
        if not settings.GEMINI_API_KEY:
            # Return basic static multilingual drafts if Gemini is unavailable
            return cls._generate_static_announcement(incident_title, category, location, severity)

        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash')

            prompt = f"""
You are a translation assistant for the FIFA World Cup 2026 stadium announcements.
Draft a brief, reassuring, and clear safety announcement for the stadium public address system.
Incident Details:
- Title: {incident_title}
- Category: {category}
- Location: {location}
- Severity: {severity}

Draft the announcement in exactly 4 languages:
1. English (EN)
2. Spanish (ES)
3. French (FR)
4. Arabic (AR)

Respond strictly with a JSON object:
{{
  "text_en": "Draft in English",
  "text_es": "Draft in Spanish",
  "text_fr": "Draft in French",
  "text_ar": "Draft in Arabic"
}}
"""
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                ),
                request_options={"timeout": 4.0}
            )

            data = json.loads(response.text)
            return {
                "text_en": data.get("text_en", ""),
                "text_es": data.get("text_es", ""),
                "text_fr": data.get("text_fr", ""),
                "text_ar": data.get("text_ar", "")
            }
        except Exception as e:
            logger.error(f"Failed to generate multilingual announcement via Gemini: {str(e)}. Using rule fallback.")
            return cls._generate_static_announcement(incident_title, category, location, severity)

    @classmethod
    def _generate_static_announcement(cls, incident_title: str, category: str, location: str, severity: str) -> Dict[str, str]:
        """
        Static fallback for multilingual announcements.
        """
        if severity in ["High", "Critical"]:
            en = f"Attention spectators: A safety response is active in {location}. Please follow steward directions and remain calm."
            es = f"Atención espectadores: Hay una respuesta de seguridad activa en {location}. Por favor siga las instrucciones del personal y mantenga la calma."
            fr = f"Attention spectateurs: Une intervention de sécurité est en cours à {location}. Veuillez suivre les instructions des agents et rester calme."
            ar = f"انتباه للجمهور: هناك استجابة أمنية نشطة في {location}. يرجى اتباع توجيهات مشرفي التنظيم والحفاظ على الهدوء."
        else:
            en = f"Notice: Operations team is resolving an issue at {location}. Thank you for your cooperation."
            es = f"Aviso: El equipo de operaciones está resolviendo un problema en {location}. Gracias por su cooperación."
            fr = f"Avis: L'équipe des opérations résout un problème à {location}. Merci de votre coopération."
            ar = f"تنبيه: فريق العمليات يعمل على حل مشكلة في {location}. نشكركم على حسن تعاونكم."

        return {
            "text_en": en,
            "text_es": es,
            "text_fr": fr,
            "text_ar": ar
        }
