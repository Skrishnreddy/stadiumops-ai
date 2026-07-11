import json
import os
from typing import Dict, Any, List, Optional

class SOPService:
    _sops: List[Dict[str, Any]] = []

    @classmethod
    def load_sops(cls) -> None:
        """
        Load SOPs from the JSON file. Caches in memory for rapid retrieval.
        """
        if cls._sops:
            return

        # Determine path dynamically
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        sops_path = os.path.join(current_dir, "data", "sops.json")
        
        try:
            with open(sops_path, "r", encoding="utf-8") as f:
                cls._sops = json.load(f)
        except Exception as e:
            # Fallback static list in case of reading issues during testing
            cls._sops = [
                {
                    "category": "Medical emergency",
                    "title": "SOP-ME-01: Medical Emergencies & First Aid Protocol",
                    "matched_section": "Section 3.2: Stand Response",
                    "recommended_steps": [
                        "Confirm casualty location.",
                        "Dispatch medic team immediately.",
                        "Clear path for responders."
                    ],
                    "safety_warning": "Do not move casualties with neck/head injuries.",
                    "source_reference": "FIFA Smart Stadium Safety Code, Section 12.1"
                }
            ]

    @classmethod
    def retrieve_sop(cls, category: str, text: str) -> Dict[str, Any]:
        """
        Retrieves the most relevant SOP based on the incident's category and text.
        """
        cls.load_sops()

        text_lower = text.lower()

        # Rule 1: Direct category match (highest priority)
        for sop in cls._sops:
            if sop["category"].lower() == category.lower():
                return sop

        # Rule 2: Explicit evacuation request detected in text
        if "evacuate" in text_lower or "evacuation" in text_lower or "run out" in text_lower:
            for sop in cls._sops:
                if sop["category"] == "Evacuation":
                    return sop

        # Rule 3: Text match on keywords
        for sop in cls._sops:
            # Search keywords in SOP title or description
            title_words = sop["title"].lower().split()
            for word in title_words:
                if len(word) > 4 and word in text_lower:
                    return sop

        # Fallback to Medical Emergency SOP or first SOP in the list
        if cls._sops:
            return cls._sops[0]
            
        return {
            "category": "General operations",
            "title": "SOP-GEN-00: General Operations Protocol",
            "matched_section": "Section 1.1: General Response",
            "recommended_steps": [
                "Evaluate the scene.",
                "Deploy standard stadium steward patrol.",
                "Report details to the supervisor."
            ],
            "safety_warning": "Always follow standard safety procedures and do not take unnecessary risks.",
            "source_reference": "Stadium Operations Manual v1.0"
        }
