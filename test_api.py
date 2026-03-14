import requests
import json

# Test different users
test_cases = [
    {"userId": 1, "city": "mumbai", "limit": 3},
    {"userId": 2, "city": "mumbai", "limit": 3},
    {"userId": 1, "limit": 5},  # No city filter
    {"userId": 999, "city": "mumbai", "limit": 3},  # Non-existent user
]

print("🧪 Testing Flask Recommendation API")
print("=" * 50)

for i, test_case in enumerate(test_cases, 1):
    print(f"\n📋 Test Case {i}: {test_case}")
    
    try:
        response = requests.post("http://localhost:5000/recommendations", json=test_case)
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
    except Exception as e:
        print(f"Error: {e}")

print("\n" + "=" * 50)
print("✅ API Testing Complete!")