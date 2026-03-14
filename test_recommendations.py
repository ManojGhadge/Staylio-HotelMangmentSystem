#!/usr/bin/env python3
"""
Test script for the hotel recommendation system
"""

import requests
import json

# Configuration
FLASK_URL = "http://localhost:5000"
SPRING_BOOT_URL = "http://localhost:8080/api"

def test_flask_recommendations():
    """Test Flask AI service recommendations endpoint"""
    print("Testing Flask AI service...")
    
    # Test data
    test_data = {
        "userId": 1,
        "city": "Mumbai",
        "limit": 6
    }
    
    try:
        response = requests.post(f"{FLASK_URL}/recommendations", json=test_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing Flask service: {e}")
        return False

def test_spring_boot_recommendations():
    """Test Spring Boot recommendations endpoint"""
    print("\nTesting Spring Boot service...")
    
    # Test data
    test_data = {
        "userId": 1,
        "city": "Mumbai",
        "limit": 6
    }
    
    try:
        response = requests.post(f"{SPRING_BOOT_URL}/hotels/recommendations", json=test_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing Spring Boot service: {e}")
        return False

def main():
    print("🧪 Testing Hotel Recommendation System")
    print("=" * 50)
    
    flask_success = test_flask_recommendations()
    spring_boot_success = test_spring_boot_recommendations()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"Flask AI Service: {'✅ PASS' if flask_success else '❌ FAIL'}")
    print(f"Spring Boot Service: {'✅ PASS' if spring_boot_success else '❌ FAIL'}")
    
    if flask_success and spring_boot_success:
        print("\n🎉 All tests passed! Recommendation system is working.")
    else:
        print("\n⚠️  Some tests failed. Check the services are running:")
        print("   - Flask AI service: python app.py (port 5000)")
        print("   - Spring Boot service: mvn spring-boot:run (port 8080)")

if __name__ == "__main__":
    main()