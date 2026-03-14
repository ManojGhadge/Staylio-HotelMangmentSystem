# 🏨 StayLio Hotel Recommendation System

## Overview

The StayLio recommendation system uses a **hybrid approach** combining collaborative filtering and content-based filtering to provide personalized hotel recommendations to users.

## 🏗️ Architecture

```
React Frontend (Port 3000)
├── Dashboard with "Recommended for You" section
├── City selector for location-specific recommendations
└── RecommendedHotels component

Spring Boot Backend (Port 8080)
├── /api/hotels/recommendations endpoint
└── Calls Flask AI service for ML processing

Flask AI Service (Port 5000)
├── /recommendations endpoint
├── KNN Collaborative Filtering
├── Content-Based Filtering
└── Hybrid recommendation logic
```

## 🧠 ML Algorithm Details

### 1. Collaborative Filtering (KNN)
- **Data Source**: `reviews` table (user_id, hotel_id, rating)
- **Method**: Cosine similarity between users
- **Logic**: 
  - Find users with similar rating patterns
  - Recommend hotels liked by similar users
  - Exclude hotels already reviewed by current user

### 2. Content-Based Filtering
- **Features**: Price, amenities, hotel type, rating
- **Logic**:
  - Analyze user's past high-rated hotels (rating ≥ 4)
  - Calculate preferences (avg price, preferred amenities, hotel types)
  - Score candidate hotels based on similarity to preferences

### 3. Hybrid Approach
- **Collaborative Filtering**: 70% weight
- **Content-Based Filtering**: 30% weight
- **City Filtering**: Applied after ML processing
- **Result**: Top 6 personalized recommendations

## 🚀 Setup Instructions

### 1. Flask AI Service Setup

```bash
cd StayLio/staylio-ai-agent

# Install dependencies
pip install -r requirements.txt

# Configure database connection in config.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=staylio_db

# Start Flask service
python app.py
```

### 2. Spring Boot Backend
The recommendation endpoint is already integrated. Just ensure the backend is running:

```bash
cd StayLio/staylio-backend
mvn spring-boot:run
```

### 3. React Frontend
The dashboard already includes the recommendation components:

```bash
cd StayLio/staylio
npm run dev
```

## 📊 Database Requirements

### Required Tables
- `users` (user_id, name, city)
- `hotels` (hotel_id, city, price_per_night, rating, amenities, hotel_type)
- `reviews` (review_id, user_id, hotel_id, rating)

### Sample Data for Testing
Ensure you have:
- At least 3-5 users with reviews
- 5-6 hotels in different cities
- Multiple reviews per user (rating 1-5)

## 🔧 API Endpoints

### Flask AI Service

#### POST /recommendations
```json
{
  "userId": 1,
  "city": "Mumbai",  // Optional
  "limit": 6         // Optional, default 6
}
```

**Response:**
```json
{
  "recommendations": [101, 102, 103],
  "city": "Mumbai",
  "message": "Found 3 personalized recommendations in Mumbai"
}
```

### Spring Boot Backend

#### POST /api/hotels/recommendations
```json
{
  "userId": 1,
  "city": "Mumbai",  // Optional
  "limit": 6         // Optional
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "id": 101,
      "name": "Hotel Paradise",
      "city": "Mumbai",
      "pricePerNight": 2500,
      "rating": 4.5,
      "amenities": "WiFi,Pool,Gym"
    }
  ],
  "city": "Mumbai",
  "message": "Found 1 personalized recommendations in Mumbai"
}
```

## 🎨 Frontend Components

### RecommendedHotels Component
- **Location**: `src/components/RecommendedHotels.jsx`
- **Props**: `userId`, `selectedCity`, `className`
- **Features**: Loading states, error handling, hotel cards

### CitySelector Component
- **Location**: `src/components/CitySelector.jsx`
- **Props**: `selectedCity`, `onCityChange`, `className`
- **Features**: Dropdown with all available cities

### Dashboard Integration
- **New Tab**: "Recommended for You"
- **City Filter**: Dropdown to filter by city
- **Overview Section**: Shows recommendations preview

## 🧪 Testing

### Manual Testing
1. **Create test data**: Add users, hotels, and reviews
2. **Start services**: Flask (5000), Spring Boot (8080), React (3000)
3. **Login as user**: Navigate to dashboard
4. **Check recommendations**: Should show personalized hotels

### Automated Testing
```bash
# Run test script
python test_recommendations.py
```

## 🔍 Troubleshooting

### Common Issues

1. **No recommendations showing**
   - Check if user has reviews in database
   - Verify Flask service is running on port 5000
   - Check database connection in Flask

2. **City filter not working**
   - Ensure hotels have city field populated
   - Check if selected city has hotels

3. **ML errors**
   - Install scikit-learn: `pip install scikit-learn`
   - Check if reviews table has sufficient data

### Debug Steps
1. Check Flask logs for ML processing errors
2. Verify database connectivity
3. Test API endpoints with Postman
4. Check browser console for frontend errors

## 📈 Performance Considerations

### Small Dataset Optimization
- **Direct DB processing**: No offline training required
- **Simple KNN**: Works well with 5-6 hotels
- **Efficient queries**: Optimized SQL for real-time processing

### Scalability Notes
For larger datasets (100+ hotels):
- Consider caching user similarity matrices
- Implement batch processing for recommendations
- Add Redis for recommendation caching

## 🔒 Security & Privacy

- **User data**: Only uses aggregated rating patterns
- **No PII**: Recommendations don't expose personal information
- **City filtering**: Ensures location privacy

## 🎯 Future Enhancements

1. **Advanced ML**:
   - Deep learning embeddings
   - Seasonal preferences
   - Real-time learning

2. **Business Logic**:
   - Boost newly added hotels
   - Consider booking history
   - Price sensitivity analysis

3. **UI/UX**:
   - Explanation for recommendations
   - "Not interested" feedback
   - Recommendation history

## 📝 Implementation Summary

✅ **Completed Features**:
- KNN collaborative filtering
- Content-based filtering  
- Hybrid recommendation system
- City-based filtering
- React dashboard integration
- Spring Boot API endpoints
- Flask ML service

✅ **Key Benefits**:
- Personalized recommendations
- Real-time processing
- City-specific filtering
- Scalable architecture
- User-friendly interface

The recommendation system is now fully integrated and ready for use! 🚀