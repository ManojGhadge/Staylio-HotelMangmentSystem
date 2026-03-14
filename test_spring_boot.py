import requests
import json

# Test Spring Boot recommendation endpoint
test_data = {
    "userId": 1,
    "city": "mumbai",
    "limit": 3
}

print("🧪 Testing Spring Boot Recommendation API")
print("=" * 50)

try:
    response = requests.post("http://localhost:8080/api/hotels/recommendations", json=test_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        # Check if we got hotel details
        if result.get('recommendations'):
            print(f"\n✅ Success! Got {len(result['recommendations'])} hotel recommendations")
            for hotel in result['recommendations']:
                print(f"  - {hotel['name']} in {hotel['city']} (₹{hotel['pricePerNight']})")
        else:
            print("⚠️  No recommendations returned")
    else:
        print(f"❌ Error: {response.text}")
        
except Exception as e:
    print(f"❌ Connection Error: {e}")
    print("Make sure Spring Boot is running on port 8080")

print("\n" + "=" * 50)