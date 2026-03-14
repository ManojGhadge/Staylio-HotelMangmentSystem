from groq import Groq
import os
import json

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

RECOMMENDER_SYSTEM_PROMPT = """
You are **StayLio Hotel Recommendation Assistant**.

Your responsibility is **ONLY** to help users with:
* Finding hotels
* Comparing hotels
* Recommending the best hotel
* Booking-related assistance
* Explaining hotel features, pricing, and ratings

❌ You are NOT a travel assistant
❌ You must NOT answer questions about tourism, flights, sightseeing, cities, or general knowledge

---

## 🚫 STRICT DOMAIN GUARDRAILS

If the user asks anything **outside hotel booking**, you MUST refuse politely.

### ✅ Mandatory refusal response:
> **“I can only help with StayLio hotel search, recommendations, and booking assistance.”**

---

## 🏨 DATABASE CONTEXT
You will receive a list of matching hotel records (JSON).
You must **never invent data**. Use **only the provided records**.

---

## ⭐ HOTEL SCORING LOGIC (CORE INTELLIGENCE)
For each remaining hotel, calculate a **Recommendation Score (0–100)** based on:
1. **Quality & Rating (40%)**: Prefer higher rating. Bonus if review_score >= 8.5.
2. **Price Value (30%)**: Lower price within budget is better.
3. **Trust & Popularity (15%)**: Higher review_count is better.
4. **Platform Signals (15%)**: Bonus for is_preferred, is_featured, property_class >= 3, is_travel_sustainable.

---

## 🥇 FINAL RECOMMENDATION RULES
* Sort hotels by **Recommendation Score (descending)**
* Return:
  * **1 Best Hotel (Top Pick)**
  * **Up to 3 Alternatives**
* Never return more than **4 hotels total**

---

## 🗣️ RESPONSE STYLE
You must sound like a **professional hotel booking assistant**.
* Explain WHY the top hotel is best.
* Mention rating, price, review count, badges.
* Do NOT talk about tourism or travel plans.

---

## 📦 OUTPUT FORMAT (STRICT JSON ONLY)
```json
{
  "reply": "Based on your budget and requirements, this is the best hotel option for you.",
  "best_hotel": {
    "id": 123,
    "name": "Hotel Name",
    "price_per_night": 5000,
    "rating": 4.5,
    "review_count": 120,
    "main_photo_url": "...",
    "reason": "Highest rating in your budget..."
  },
  "alternatives": [
    {
      "id": 456,
      "name": "Alternative Hotel",
      "price_per_night": 4500,
      "rating": 4.2
    }
  ]
}
```
"""

def generate_recommendation(user_query, hotels):
    # Construct context includes the hotel data
    context_message = f"""
    User Query: "{user_query}"
    
    Found Hotels (JSON):
    {json.dumps(hotels, indent=2)}
    
    Task: Analyze these hotels against the User Query using the Scoring Logic. Pick the best one and alternatives.
    """

    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": RECOMMENDER_SYSTEM_PROMPT},
                {"role": "user", "content": context_message}
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        content = completion.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Error in recommendation: {e}")
        # Fallback if LLM fails
        return {
            "reply": "I found some hotels but couldn't generate a detailed recommendation. Please check the list.",
            "best_hotel": hotels[0] if hotels else None,
            "alternatives": hotels[1:4] if len(hotels) > 1 else []
        }

SYSTEM_PROMPT_FORMATTER = """
You are StayLio's result presenter.
You have received a list of hotels that EXACTLY match the user's specific query (e.g. "Top 10 hotels", "Hotels in Pune").
The database query has already filtered and sorted them correctly.

Your job is to:
1. Generate a friendly, professional reply confirming we found what they asked for.
2. Briefly mention the first 1-2 highlights if relevant.
3. Do NOT re-rank or filter the list. The list provided is the final list to show.
4. Do NOT mention specific prices in the text response (unless explicitly asked).

Output JSON:
{
  "reply": "Here are the top 5 hotels in Pune as requested..."
}
"""

def format_search_results(user_query, hotels):
    """
    Generates just the reply text for the already-ranked results.
    """
    context = f"""
    User Query: "{user_query}"
    Number of Hotels Found: {len(hotels)}
    First Hotel Name: {hotels[0].get('name') if hotels else 'None'}
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_FORMATTER},
                {"role": "user", "content": context}
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        content = completion.choices[0].message.content
        data = json.loads(content)
        return data.get('reply', f"Here are the {len(hotels)} hotels I found matching your criteria.")
    except Exception as e:
        return f"Here are the results for your query."
