from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv

load_dotenv('config.env')

from extractor import extract_intent
from sql_agent import run_sql_agent
from recommender import format_search_results
from knn_recommender import get_recommendations_for_user

app = Flask(__name__)

@app.route('/agent/query', methods=['POST'])
def query():
    data = request.json
    user_message = data.get('message', '')
    user_id = data.get('userId')
    
    print(f"Received query: {user_message}")

    # 1. Extract Intent
    # We still use this for guardrails, and potentially to fallback if purely chat (though user didn't request chat only)
    extraction = extract_intent(user_message)
    print(f"Extraction: {extraction}")
    
    # 2. Guardrails
    if not extraction.get('is_related', True):
        return jsonify({
            "answer": extraction.get('reply_text', "I can only assist with StayLio hotel bookings, and finding the perfect stay for you 🏨"),
            "suggestedHotels": []
        })

    # 3. Dynamic SQL Search
    # The user wants "top 5/10 hotels", "specific location", "particular position". 
    # The SQL Agent handles this best by generating custom SQL.
    
    agent_result = run_sql_agent(user_message)
    print(f"Agent Result keys: {agent_result.keys()}")
    
    suggested_hotels = []
    reply_text = ""

    if "error" in agent_result:
        # If SQL generation failed or safety check failed
        print(f"SQL Agent Error: {agent_result['error']}")
        reply_text = "I'm having trouble searching the database right now."
        if "can only perform search" in agent_result['error']:
            reply_text = "I can only search for hotels, please ask me about hotels!"
            
    else:
        # Success
        hotels = agent_result.get('hotels', [])
        
        if hotels:
            suggested_hotels = hotels
            # Generate a nice summary
            reply_text = format_search_results(user_message, hotels)
        else:
            # No results found
            reply_text = "I couldn't find any hotels matching your exact criteria using my database."

    return jsonify({
        "answer": reply_text,
        "suggestedHotels": suggested_hotels
    })

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    """Get personalized hotel recommendations for a user"""
    data = request.json
    user_id = data.get('userId')
    city = data.get('city')  # Optional city filter
    limit = data.get('limit', 6)  # Default 6 recommendations
    
    if not user_id:
        return jsonify({
            "error": "User ID is required"
        }), 400
    
    try:
        # Get recommendations using KNN hybrid approach
        recommended_hotel_ids = get_recommendations_for_user(user_id, city, limit)
        
        if not recommended_hotel_ids:
            return jsonify({
                "recommendations": [],
                "message": "No recommendations available. Try booking and reviewing hotels to get personalized suggestions!"
            })
        
        return jsonify({
            "recommendations": recommended_hotel_ids,
            "city": city,
            "message": f"Found {len(recommended_hotel_ids)} personalized recommendations" + (f" in {city}" if city else "")
        })
        
    except Exception as e:
        print(f"Error getting recommendations: {str(e)}")
        return jsonify({
            "error": "Failed to get recommendations",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
