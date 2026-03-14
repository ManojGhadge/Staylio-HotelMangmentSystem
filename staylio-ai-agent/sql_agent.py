import os
import mysql.connector
from groq import Groq
import json

# Database Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Mano@2005',
    'database': 'staylio_database2'
}

# Hotels Table Schema
SCHEMA_DESCRIPTION = """
Table: hotels
Columns:
id int PK 
city varchar(255) 
name varchar(255) 
description text 
address varchar(255) 
latitude double 
longitude double 
review_score double 
review_score_word varchar(50) 
review_count int 
ranking_position int 
property_class int 
accurate_property_class int 
ufi varchar(50) 
country_code varchar(10) 
is_preferred tinyint(1) 
is_travel_sustainable tinyint(1) 
price_value double 
currency varchar(10) 
main_photo_url text 
all_photo_urls text 
amenities text 
available_rooms int 
bathrooms int 
bedrooms int 
cancellation_policy text 
check_in_time varchar(255) 
check_out_time varchar(255) 
country varchar(255) 
created_at datetime(6) 
host_id bigint 
hotel_owner_id bigint 
house_rules text 
is_active bit(1) 
is_featured bit(1) 
max_guests int 
price_per_night decimal(10,2) 
property_type varchar(255) 
rating double 
room_types text 
state varchar(255) 
total_rooms int 
updated_at datetime(6) 
zip_code varchar(255)
"""

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def generate_sql_query(user_query):
    """
    Generates a SQL query based on the user's natural language request.
    """
    system_prompt = f"""You are a SQL expert for a hotel booking system.
    You have access to the following table schema:
    {SCHEMA_DESCRIPTION}
    
    Rules:
    1. Generate a valid MySQL query to answer the user's question.
    2. ONLY return the SQL query. No markdown, no explanation.
    3. If the user asks for 'top' hotels, use 'ranking_position' column (lower is better) to order them, unless specified otherwise (like 'best rated' which implies 'rating' or 'review_score').
    4. If reviewing 'top 5' or similar, use LIMIT.
    5. Filter by city if mentioned.
    7. Ensure constraints: naming must be exact.
    8. Handle case sensitivity for strings like city (e.g. use LIKE or lower()).
    9. For rating, likely use `review_score` as it's more populated. Select both or use COALESCE.
    10. For price, use `price_per_night`.

    Example:
    User: "Show me top 5 hotels in Pune"
    SQL: SELECT id, name, city, price_per_night, review_score as rating, main_photo_url FROM hotels WHERE LOWER(city) LIKE '%pune%' ORDER BY ranking_position ASC LIMIT 5;
    """
    
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_query}
        ],
        model="llama-3.1-8b-instant",
        temperature=0.1,
    )
    
    sql_query = response.choices[0].message.content.strip()
    # Clean up if the model adds markdown
    if sql_query.startswith("```sql"):
        sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
    elif sql_query.startswith("```"):
        sql_query = sql_query.replace("```", "").strip()
        
    return sql_query

def execute_query(sql_query):
    """
    Executes the SQL query and returns the results.
    """
    connection = None
    cursor = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True) # Return results as dictionaries
        
        print(f"Executing SQL: {sql_query}")
        cursor.execute(sql_query)
        results = cursor.fetchall()
        
        return results
        
    except mysql.connector.Error as e:
        print(f"Database Error: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def process_results(results):
    """
    Formats the database results into a user-friendly response or list of hotels.
    This mimics the structure expected by the frontend.
    """
    if not results:
        return []
    
    # Map DB columns to frontend expected keys if necessary
    # Frontend expects: id, name, city, pricePerNight, rating, imageUrls
    mapped_results = []
    for row in results:
        # Prepare imageUrls list from main_photo_url or all_photo_urls
        image_urls = []
        if row.get('main_photo_url'):
            image_urls.append(row.get('main_photo_url'))
            
        hotel = {
            "id": row.get('id'),
            "name": row.get('name'),
            "city": row.get('city'),
            "description": row.get('description'),
            "pricePerNight": float(row.get('price_per_night')) if row.get('price_per_night') else 0,
            "rating": row.get('rating') or row.get('review_score'),
            "imageUrls": image_urls,
            # imageUrl removed to avoid breaking strict DTO mapping in Java
            # preserve other fields just in case, converting to camelCase would be ideal but these are the critical ones
        }
        mapped_results.append(hotel)
        
    return mapped_results

def run_sql_agent(user_message):
    try:
        sql = generate_sql_query(user_message)
        print(f"Generated SQL: {sql}")
        
        # Security check: basic strict read-only enforcement
        if not sql.lower().startswith("select"):
             return {"error": "I can only perform search queries (SELECT)."}

        results = execute_query(sql)
        
        if results is None: 
             return {"error": "There was an error executing the search in our database."}
             
        processed_hotels = process_results(results)
        return {
            "sql": sql,
            "hotels": processed_hotels
        }
        
    except Exception as e:
        print(f"Agent Error: {e}")
        return {"error": str(e)}
