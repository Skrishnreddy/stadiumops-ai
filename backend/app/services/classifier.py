import re
from typing import Dict, Any, List

class RuleBasedClassifier:
    CATEGORIES = {
        "Crowd congestion": {
            "keywords": [r"crowd", r"congestion", r"pushing", r"gate\s+congestion", r"turnstile", r"bottleneck", r"stampede", r"crush"],
            "severity": "Critical",
            "priority": "P1",
            "responsible_team": "Crowd Safety & Stewards Team",
            "immediate_actions": [
                "Halt entry gate flow immediately",
                "Deploy secondary steward lines to distribute crowd density",
                "Open emergency bypass gates in the affected zone",
                "Broadcast audio announcements directing fans to alternative zones"
            ],
            "reasoning": "Detected crowd flow markers in location or description, indicating potential physical congestion or gate pressure."
        },
        "Medical emergency": {
            "keywords": [r"medical", r"injured", r"hurt", r"heart", r"chest", r"breathing", r"unconscious", r"collapsed", r"fainted", r"blood", r"ambulance", r"fall", r"fallen"],
            "severity": "Critical",
            "priority": "P1",
            "responsible_team": "Stadium First Aid & Medical Dispatch",
            "immediate_actions": [
                "Dispatch immediate response medic team to the designated section",
                "Clear visual and physical pathways for first responders",
                "Prepare stadium ambulance bay for potential transport",
                "Deploy stewards to shield the patient's privacy from public view"
            ],
            "reasoning": "Detected injury, medical symptoms, or request for health assistance keywords."
        },
        "Fire or smoke": {
            "keywords": [r"fire", r"smoke", r"burning", r"flame", r"spark", r"explosion", r"extinguisher"],
            "severity": "Critical",
            "priority": "P1",
            "responsible_team": "Stadium Fire & Rescue Marshall Service",
            "immediate_actions": [
                "Isolate and evacuate the immediate seating blocks and rows",
                "Dispatch nearest fire marshals with heavy duty extinguishers",
                "Trigger automated alarms and notify municipal fire services",
                "Shut down ventilation systems in the affected zone to suppress smoke flow"
            ],
            "reasoning": "Identified fire, smoke, or ignition keywords suggesting localized threat of combustion."
        },
        "Suspicious package": {
            "keywords": [r"package", r"bag", r"unattended", r"backpack", r"suspicious", r"bomb", r"explosive", r"luggage"],
            "severity": "Critical",
            "priority": "P1",
            "responsible_team": "Stadium Security & Police Bomb Squad",
            "immediate_actions": [
                "Establish a strict 100-meter safety perimeter around the item",
                "Instruct all personnel: Do NOT touch, move, or open the item",
                "Dispatch security supervisors to visually assess the package and secure CCTV tracking",
                "Initiate silent notification of local law enforcement bomb disposal unit"
            ],
            "reasoning": "Keywords signal unattended luggage or potential security threats requiring explosive ordnance disposal assessment."
        },
        "Lost child": {
            "keywords": [r"lost", r"child", r"missing", r"boy", r"girl", r"kid", r"parent", r"separated"],
            "severity": "Medium",
            "priority": "P3",
            "responsible_team": "Stadium Guest Services & Safety Personnel",
            "immediate_actions": [
                "Log detailed physical description of the child (clothing, age, gender)",
                "Notify all perimeter exit gate staff to monitor departures",
                "Assign Guest Services officer to remain at the reported separation point",
                "Draft internal operations radio alert for safety stewards"
            ],
            "reasoning": "Mentions of missing or separated children, requiring guest relations and perimeter lock checks."
        },
        "Power failure": {
            "keywords": [r"power", r"electricity", r"dark", r"outage", r"blackout", r"lights", r"generator"],
            "severity": "High",
            "priority": "P2",
            "responsible_team": "Stadium Facilities & Electrical Engineering",
            "immediate_actions": [
                "Verify status of auxiliary emergency backup generators",
                "Deploy safety stewards equipped with torches to stairwells and exits",
                "Command Center to check emergency lighting operations in affected zones",
                "Instruct announcers to issue reassurance broadcasts to prevent panic"
            ],
            "reasoning": "Electrical power or lighting system outages identified."
        },
        "Network failure": {
            "keywords": [r"wifi", r"network", r"internet", r"offline", r"connection", r"router", r"lan", r"server"],
            "severity": "Medium",
            "priority": "P3",
            "responsible_team": "Stadium IT Infrastructure Operations",
            "immediate_actions": [
                "Verify gateway routers and localized fiber switches in the affected zone",
                "Enable secondary LTE/Satellite emergency backhaul protocols",
                "Notify stadium ticketing and operations staff to prepare offline protocols",
                "Engage vendor SLA support for localized network diagnostics"
            ],
            "reasoning": "IT or digital communication system network failures detected."
        },
        "Access-control failure": {
            "keywords": [r"turnstile", r"ticket", r"scanner", r"access control", r"barcode", r"rfid", r"blocked"],
            "severity": "High",
            "priority": "P2",
            "responsible_team": "Access Control Operations & Tech Support",
            "immediate_actions": [
                "Switch affected gates to manual visual ticket inspection",
                "Deploy additional security stewards to handle crowd backup at turnstiles",
                "Check server connectivity for the RFID/Barcode database systems",
                "Re-route incoming spectators to functioning adjacent gates"
            ],
            "reasoning": "Issues with ticket scanners or entry gates causing potential access blockages."
        },
        "Severe weather": {
            "keywords": [r"rain", r"storm", r"lightning", r"weather", r"wind", r"heat", r"hail", r"thunder"],
            "severity": "Medium",
            "priority": "P3",
            "responsible_team": "Event Management & Meteorological Liaison",
            "immediate_actions": [
                "Instruct spectators in uncovered seating bowls to seek shelter in concourses",
                "Secure loose stadium elements, advertising banners, and field equipment",
                "Monitor regional weather radar feeds for lightning proximity",
                "Liaise with tournament coordinators regarding potential play suspension"
            ],
            "reasoning": "Meteorological issues posing danger to fans, players, or equipment."
        }
    }

    @classmethod
    def classify(cls, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        
        # Search for keyword matches
        matched_category = None
        highest_match_count = 0
        
        for category, config in cls.CATEGORIES.items():
            matches = 0
            for kw in config["keywords"]:
                if re.search(kw, text_lower):
                    matches += 1
            if matches > highest_match_count:
                highest_match_count = matches
                matched_category = category
                
        if matched_category:
            cfg = cls.CATEGORIES[matched_category]
            return {
                "category": matched_category,
                "severity": cfg["severity"],
                "priority": cfg["priority"],
                "confidence": 0.85 if highest_match_count > 1 else 0.70,
                "responsible_team": cfg["responsible_team"],
                "immediate_actions": cfg["immediate_actions"],
                "reasoning_summary": f"Rule-based match: '{matched_category}' keywords matched {highest_match_count} time(s). {cfg['reasoning']}"
            }
        
        # Default fallback
        return {
            "category": "General operations",
            "severity": "Low",
            "priority": "P4",
            "confidence": 0.50,
            "responsible_team": "Stadium Facilities & Operations General Support",
            "immediate_actions": [
                "Dispatch standard patrol stewards to evaluate situation",
                "Log the details in the daily stadium activity report",
                "Monitor zone CCTV cameras for follow-up verification"
            ],
            "reasoning_summary": "No specific category keywords detected. Falling back to General operations safety protocol."
        }
