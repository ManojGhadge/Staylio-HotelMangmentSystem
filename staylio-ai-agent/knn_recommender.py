import mysql.connector
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import os
from dotenv import load_dotenv

load_dotenv('config.env')

class KNNHotelRecommender:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', 'Mano@2005'),
            'database': os.getenv('DB_NAME', 'staylio_database2')
        }
    
    def get_db_connection(self):
        """Get database connection"""
        return mysql.connector.connect(**self.db_config)
    
    def get_user_hotel_matrix(self):
        """Build user-hotel rating matrix from reviews table"""
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Get all reviews with user_id, hotel_id, and rating
            query = """
            SELECT user_id, hotel_id, rating 
            FROM reviews 
            WHERE rating IS NOT NULL AND rating > 0
            """
            cursor.execute(query)
            reviews = cursor.fetchall()
            
            if not reviews:
                return None, None, None
            
            # Create user-hotel matrix
            user_ids = list(set([r[0] for r in reviews]))
            hotel_ids = list(set([r[1] for r in reviews]))
            
            # Create matrix (users x hotels)
            matrix = np.zeros((len(user_ids), len(hotel_ids)))
            user_id_to_idx = {uid: idx for idx, uid in enumerate(user_ids)}
            hotel_id_to_idx = {hid: idx for idx, hid in enumerate(hotel_ids)}
            
            # Fill matrix with ratings
            for user_id, hotel_id, rating in reviews:
                user_idx = user_id_to_idx[user_id]
                hotel_idx = hotel_id_to_idx[hotel_id]
                matrix[user_idx][hotel_idx] = rating
            
            return matrix, user_id_to_idx, hotel_id_to_idx
            
        finally:
            cursor.close()
            conn.close()
    
    def get_hotel_features(self, hotel_ids):
        """Get hotel features for content-based filtering"""
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            if not hotel_ids:
                return {}
            
            # Get hotel features - using correct column names from Hotel model
            placeholders = ','.join(['%s'] * len(hotel_ids))
            query = f"""
            SELECT id, city, price_per_night, rating, amenities, property_type
            FROM hotels 
            WHERE id IN ({placeholders})
            """
            cursor.execute(query, hotel_ids)
            hotels = cursor.fetchall()
            
            hotel_features = {}
            for hotel in hotels:
                hotel_id, city, price, rating, amenities, property_type = hotel
                hotel_features[hotel_id] = {
                    'city': city or '',
                    'price': float(price) if price else 0.0,
                    'rating': float(rating) if rating else 0.0,
                    'amenities': amenities or '',
                    'property_type': property_type or ''
                }
            
            return hotel_features
            
        finally:
            cursor.close()
            conn.close()
    
    def get_user_reviewed_hotels(self, user_id):
        """Get hotels already reviewed by user"""
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            query = "SELECT hotel_id FROM reviews WHERE user_id = %s"
            cursor.execute(query, (user_id,))
            reviewed_hotels = [row[0] for row in cursor.fetchall()]
            return reviewed_hotels
            
        finally:
            cursor.close()
            conn.close()
    
    def collaborative_filtering_recommendations(self, user_id, k=3):
        """Get recommendations using collaborative filtering"""
        matrix, user_id_to_idx, hotel_id_to_idx = self.get_user_hotel_matrix()
        
        if matrix is None or user_id not in user_id_to_idx:
            return []
        
        user_idx = user_id_to_idx[user_id]
        user_ratings = matrix[user_idx]
        
        # Find similar users using cosine similarity
        user_similarities = cosine_similarity([user_ratings], matrix)[0]
        
        # Get top k similar users (excluding self)
        similar_user_indices = np.argsort(user_similarities)[::-1][1:k+1]
        
        # Get hotel recommendations from similar users
        recommended_hotels = []
        hotel_scores = {}
        
        for similar_user_idx in similar_user_indices:
            similarity_score = user_similarities[similar_user_idx]
            similar_user_ratings = matrix[similar_user_idx]
            
            # Find hotels rated highly by similar user but not rated by current user
            for hotel_idx, rating in enumerate(similar_user_ratings):
                if rating > 3 and user_ratings[hotel_idx] == 0:  # Not rated by current user
                    hotel_id = list(hotel_id_to_idx.keys())[list(hotel_id_to_idx.values()).index(hotel_idx)]
                    
                    if hotel_id not in hotel_scores:
                        hotel_scores[hotel_id] = 0
                    hotel_scores[hotel_id] += similarity_score * rating
        
        # Sort by score and return top recommendations
        sorted_hotels = sorted(hotel_scores.items(), key=lambda x: x[1], reverse=True)
        recommended_hotels = [hotel_id for hotel_id, score in sorted_hotels[:10]]
        
        return recommended_hotels
    
    def content_based_recommendations(self, user_id, city_filter=None):
        """Get recommendations using content-based filtering"""
        conn = self.get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Get user's rating history to understand preferences - using correct column names
            query = """
            SELECT h.id, h.city, h.price_per_night, h.rating, h.amenities, h.property_type, r.rating as user_rating
            FROM reviews r
            JOIN hotels h ON r.hotel_id = h.id
            WHERE r.user_id = %s AND r.rating >= 4
            """
            cursor.execute(query, (user_id,))
            liked_hotels = cursor.fetchall()
            
            if not liked_hotels:
                return []
            
            # Calculate user preferences
            avg_price = np.mean([float(h[2]) if h[2] else 0 for h in liked_hotels])
            preferred_amenities = set()
            preferred_types = set()
            
            for hotel in liked_hotels:
                if hotel[4]:  # amenities
                    preferred_amenities.update(hotel[4].split(','))
                if hotel[5]:  # property_type
                    preferred_types.add(hotel[5])
            
            # Get candidate hotels (not reviewed by user)
            reviewed_hotels = self.get_user_reviewed_hotels(user_id)
            reviewed_placeholders = ','.join(['%s'] * len(reviewed_hotels)) if reviewed_hotels else 'NULL'
            
            city_condition = ""
            params = []
            if city_filter:
                city_condition = "AND city = %s"
                params.append(city_filter)
            
            if reviewed_hotels:
                query = f"""
                SELECT id, city, price_per_night, rating, amenities, property_type
                FROM hotels 
                WHERE id NOT IN ({reviewed_placeholders}) {city_condition}
                AND is_active = 1
                """
                params = reviewed_hotels + params
            else:
                query = f"""
                SELECT id, city, price_per_night, rating, amenities, property_type
                FROM hotels 
                WHERE 1=1 {city_condition}
                AND is_active = 1
                """
            
            cursor.execute(query, params)
            candidate_hotels = cursor.fetchall()
            
            # Score hotels based on similarity to user preferences
            hotel_scores = []
            for hotel in candidate_hotels:
                hotel_id, city, price, rating, amenities, property_type = hotel
                score = 0
                
                # Price similarity (closer to user's average preferred price)
                if price and avg_price > 0:
                    price_diff = abs(float(price) - avg_price) / avg_price
                    price_score = max(0, 1 - price_diff)  # Higher score for closer prices
                    score += price_score * 0.3
                
                # Rating boost
                if rating:
                    score += float(rating) * 0.3
                
                # Amenities similarity
                if amenities and preferred_amenities:
                    hotel_amenities = set(amenities.split(','))
                    amenity_overlap = len(preferred_amenities.intersection(hotel_amenities))
                    amenity_score = amenity_overlap / len(preferred_amenities)
                    score += amenity_score * 0.2
                
                # Property type preference
                if property_type in preferred_types:
                    score += 0.2
                
                hotel_scores.append((hotel_id, score))
            
            # Sort by score and return top recommendations
            hotel_scores.sort(key=lambda x: x[1], reverse=True)
            return [hotel_id for hotel_id, score in hotel_scores[:10]]
            
        finally:
            cursor.close()
            conn.close()
    
    def get_hybrid_recommendations(self, user_id, city_filter=None, limit=6):
        """Get hybrid recommendations combining collaborative and content-based filtering"""
        
        # Get collaborative filtering recommendations
        cf_recommendations = self.collaborative_filtering_recommendations(user_id)
        
        # Get content-based recommendations
        cb_recommendations = self.content_based_recommendations(user_id, city_filter)
        
        # Combine recommendations (give more weight to collaborative filtering)
        hybrid_scores = {}
        
        # Collaborative filtering recommendations (higher weight)
        for i, hotel_id in enumerate(cf_recommendations):
            hybrid_scores[hotel_id] = hybrid_scores.get(hotel_id, 0) + (len(cf_recommendations) - i) * 0.7
        
        # Content-based recommendations (lower weight)
        for i, hotel_id in enumerate(cb_recommendations):
            hybrid_scores[hotel_id] = hybrid_scores.get(hotel_id, 0) + (len(cb_recommendations) - i) * 0.3
        
        # Sort by combined score
        sorted_recommendations = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Filter by city if specified
        if city_filter:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            try:
                hotel_ids = [hotel_id for hotel_id, score in sorted_recommendations]
                if hotel_ids:
                    placeholders = ','.join(['%s'] * len(hotel_ids))
                    query = f"SELECT id FROM hotels WHERE id IN ({placeholders}) AND city = %s"
                    cursor.execute(query, hotel_ids + [city_filter])
                    city_hotels = [row[0] for row in cursor.fetchall()]
                    sorted_recommendations = [(hid, score) for hid, score in sorted_recommendations if hid in city_hotels]
            finally:
                cursor.close()
                conn.close()
        
        # Return top recommendations
        return [hotel_id for hotel_id, score in sorted_recommendations[:limit]]

def get_recommendations_for_user(user_id, city=None, limit=6):
    """Main function to get recommendations for a user"""
    recommender = KNNHotelRecommender()
    return recommender.get_hybrid_recommendations(user_id, city, limit)