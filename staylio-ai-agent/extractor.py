import os
from groq import Groq
import json

# Initialize Groq client
# Ensure GROQ_API_KEY is set in your environment
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

SYSTEM_PROMPT = """
You are the first layer of the StayLio Hotel Recommendation Assistant.
Your job is to specificly EXTRACT search parameters from the user's natural language query.

# DOMAIN GUARDRAILS
1. If the user asks about ANYTHING other than hotels, booking stays, prices for stays, or StayLio (e.g., "joke", "code", "math", "general knowledge", "flights", "tourism", "sightseeing"), you MUST return "is_related": false.
2. If the user asks about hotels, booking, prices, or recommendations, return "is_related": true.

# EXTRACTION RULES
Extract the following fields from the user's message. Use null if not specified.
- city: string
- state: string
- country: string
- max_budget: number (price per night)
- min_rating: number (1-5)
- guests: number
- property_type: string (e.g. "Hotel", "Resort", "Apartment")
- preferences: list of strings (e.g. "cheap", "luxury", "pool", "wifi", "family")

# OUTPUT FORMAT (JSON ONLY)
{
  "is_related": boolean,
  "reply_text": string (only if is_related is false),
  "city": string | null,
  "state": string | null,
  "country": string | null,
  "max_budget": number | null,
  "min_rating": number | null,
  "guests": number | null,
  "property_type": string | null,
  "preferences": []
}
"""

def extract_intent(user_message):
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        content = completion.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Error in extraction: {e}")
        # Default fallback
        return {
            "is_related": True, 
            "city": None, 
            "state": None, 
            "country": None, 
            "max_budget": None, 
            "min_rating": None,
            "guests": None, 
            "property_type": None, 
            "preferences": []
        }
