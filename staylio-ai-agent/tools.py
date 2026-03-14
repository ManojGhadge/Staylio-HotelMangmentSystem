import requests
import os

SPRING_BOOT_URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8080")

def search_hotels(city=None, budget=None, rating=None, guests=None, property_type=None):
    params = {}
    if city: params['city'] = city
    if budget: params['maxPrice'] = budget
    if rating: params['minRating'] = rating
    if guests: params['guests'] = guests
    if property_type: params['propertyType'] = property_type
    
    try:
        response = requests.get(f"{SPRING_BOOT_URL}/api/chatbot/search-hotels", params=params)
        if response.status_code == 200:
            return response.json()
        return []
    except Exception as e:
        print(f"Error calling backend: {e}")
        return []
