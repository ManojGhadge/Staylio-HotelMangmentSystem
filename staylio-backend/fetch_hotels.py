"""
Staylio Hotel Data Fetcher - Updated based on actual API structure
Fetches hotel data from Booking.com API and stores in MySQL database
"""

import requests
import mysql.connector
import time
from typing import List, Dict, Optional
from datetime import datetime

# Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'me@2005',
    'database': 'staylio_database'
}

API_CONFIG = {
    'base_url': 'https://booking-com15.p.rapidapi.com/api/v1',
    'headers': {
        'x-rapidapi-host': 'booking-com15.p.rapidapi.com',
        'x-rapidapi-key': '66cc5bb4a5msh4b83d1cb7ec09a8p13536cjsn8e64dd93e36b'
    }
}

CITY_DEST_MAP = {
    "pune": "-2108361",
    "mumbai": "-2092174",
    "nagpur": "-2105396",
    "delhi": "-2106102",
    "bangalore": "62800"
}

# Search parameters
CHECKIN_DATE = "2025-11-20"
CHECKOUT_DATE = "2025-11-25"
SLEEP_INTERVAL = 3.0  # Increased to avoid rate limits (adjust if needed)
MAX_RETRIES = 3


def connect_db() -> mysql.connector.MySQLConnection:
    """Establish database connection"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        print("✓ Database connected successfully")
        return conn
    except mysql.connector.Error as err:
        print(f"✗ Database connection failed: {err}")
        raise


def create_tables(conn: mysql.connector.MySQLConnection) -> None:
    """Create hotels and hotels_image tables"""
    cursor = conn.cursor()
    
    # Hotels table with all important fields
    hotels_table = """
    CREATE TABLE IF NOT EXISTS hotels (
        id INT PRIMARY KEY,
        city VARCHAR(50),
        name VARCHAR(255),
        description TEXT,
        address TEXT,
        latitude DOUBLE,
        longitude DOUBLE,
        review_score DOUBLE,
        review_score_word VARCHAR(50),
        review_count INT,
        ranking_position INT,
        property_class INT,
        accurate_property_class INT,
        ufi VARCHAR(50),
        country_code VARCHAR(10),
        is_preferred BOOLEAN,
        is_travel_sustainable BOOLEAN,
        price_value DOUBLE,
        currency VARCHAR(10),
        main_photo_url TEXT,
        all_photo_urls TEXT,
        INDEX idx_city (city),
        INDEX idx_review_score (review_score),
        INDEX idx_price (price_value),
        INDEX idx_property_class (property_class)
    )
    """
    
    # Hotels image table for high-resolution images
    images_table = """
    CREATE TABLE IF NOT EXISTS hotels_image (
        hotel_id INT,
        photos_urls TEXT,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id),
        INDEX idx_hotel_id (hotel_id)
    )
    """
    
    cursor.execute(hotels_table)
    cursor.execute(images_table)
    conn.commit()
    cursor.close()
    print("✓ Tables created successfully")


def hotel_exists(conn: mysql.connector.MySQLConnection, hotel_id: int) -> bool:
    """Check if hotel already exists in database"""
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM hotels WHERE id = %s", (hotel_id,))
    exists = cursor.fetchone() is not None
    cursor.close()
    return exists


def fetch_hotels_for_city(city: str, dest_id: str, page: int = 1) -> Optional[Dict]:
    """Fetch hotels for a specific city with pagination and retry logic"""
    url = f"{API_CONFIG['base_url']}/hotels/searchHotels"
    
    params = {
        'dest_id': dest_id,
        'search_type': 'CITY',
        'arrival_date': CHECKIN_DATE,
        'departure_date': CHECKOUT_DATE,
        'adults': '2',
        'children_age': '0,17',
        'room_qty': '1',
        'page_number': str(page),
        'units': 'metric',
        'temperature_unit': 'c',
        'languagecode': 'en-us',
        'currency_code': 'INR'
    }
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, headers=API_CONFIG['headers'], params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:  # Rate limit
                wait_time = 5 * (attempt + 1)  # Exponential backoff
                if attempt < MAX_RETRIES - 1:
                    print(f"⚠ Rate limit, waiting {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    print(f"✗ Rate limit exceeded")
                    return None
            else:
                print(f"✗ HTTP error: {e}")
                return None
        except requests.exceptions.Timeout:
            if attempt < MAX_RETRIES - 1:
                print(f"⚠ Timeout, retrying... (attempt {attempt + 2}/{MAX_RETRIES})")
                time.sleep(2)
            else:
                print(f"✗ Timeout after {MAX_RETRIES} attempts")
                return None
        except requests.exceptions.RequestException as e:
            print(f"✗ Request failed: {e}")
            return None
    
    return None


def parse_hotel_data(item: Dict) -> Optional[Dict]:
    """Extract and parse hotel data from API response"""
    try:
        # Get hotel_id from top level
        hotel_id = item.get('hotel_id')
        if not hotel_id:
            return None
        
        # Get property data
        prop = item.get('property', {})
        
        # Extract travel sustainable flag from accessibility label
        accessibility_label = item.get('accessibilityLabel', '')
        is_sustainable = 'sustainable' in accessibility_label.lower() or 'travel sustainable' in accessibility_label.lower()
        
        # Extract price information
        price_value = None
        currency = None
        price_breakdown = prop.get('priceBreakdown', {})
        if 'grossPrice' in price_breakdown:
            gross_price = price_breakdown['grossPrice']
            price_value = gross_price.get('value')
            currency = gross_price.get('currency')
        
        # Extract photo URLs
        photo_urls = prop.get('photoUrls', [])
        main_photo = photo_urls[0] if photo_urls else None
        all_photos = ','.join(photo_urls) if photo_urls else None
        
        return {
            'id': hotel_id,
            'name': prop.get('name'),
            'description': accessibility_label,
            'address': None,  # Not directly available in search API
            'latitude': prop.get('latitude'),
            'longitude': prop.get('longitude'),
            'review_score': prop.get('reviewScore'),
            'review_score_word': prop.get('reviewScoreWord'),
            'review_count': prop.get('reviewCount'),
            'ranking_position': prop.get('rankingPosition'),
            'property_class': prop.get('propertyClass'),
            'accurate_property_class': prop.get('accuratePropertyClass'),
            'ufi': str(prop.get('ufi', '')),
            'country_code': prop.get('countryCode'),
            'is_preferred': prop.get('isPreferred', False),
            'is_travel_sustainable': is_sustainable,
            'price_value': price_value,
            'currency': currency,
            'main_photo_url': main_photo,
            'all_photo_urls': all_photos
        }
    except Exception as e:
        print(f"  ✗ Error parsing hotel data: {e}")
        return None


def save_hotel_to_db(conn: mysql.connector.MySQLConnection, hotel: Dict, city: str) -> bool:
    """Save hotel data to database"""
    cursor = conn.cursor()
    
    query = """
    INSERT INTO hotels (
        id, city, name, description, address, latitude, longitude,
        review_score, review_score_word, review_count, ranking_position,
        property_class, accurate_property_class, ufi, country_code,
        is_preferred, is_travel_sustainable, price_value, currency,
        main_photo_url, all_photo_urls
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
    """
    
    values = (
        hotel['id'], city, hotel['name'], hotel['description'], hotel['address'],
        hotel['latitude'], hotel['longitude'], hotel['review_score'],
        hotel['review_score_word'], hotel['review_count'], hotel['ranking_position'],
        hotel['property_class'], hotel['accurate_property_class'], hotel['ufi'],
        hotel['country_code'], hotel['is_preferred'], hotel['is_travel_sustainable'],
        hotel['price_value'], hotel['currency'], hotel['main_photo_url'],
        hotel['all_photo_urls']
    )
    
    try:
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        return True
    except mysql.connector.Error as err:
        print(f"  ✗ Failed to insert hotel {hotel['id']}: {err}")
        cursor.close()
        return False


def fetch_images_for_hotel(hotel_id: int) -> Optional[List[str]]:
    """Fetch high-resolution images for a hotel using getHotelPhotos endpoint"""
    url = f"{API_CONFIG['base_url']}/hotels/getHotelPhotos"
    
    params = {
        'hotel_id': str(hotel_id)
    }
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, headers=API_CONFIG['headers'], params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Extract image URLs from response
            if 'data' in data and isinstance(data['data'], list):
                images = [photo['url'] for photo in data['data'] if 'url' in photo]
                return images if images else None
            return None
            
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:  # Rate limit
                wait_time = 5 * (attempt + 1)
                if attempt < MAX_RETRIES - 1:
                    time.sleep(wait_time)
                else:
                    return None
            else:
                return None
        except requests.exceptions.Timeout:
            if attempt < MAX_RETRIES - 1:
                time.sleep(2)
            else:
                return None
        except Exception:
            return None
    
    return None


def save_images_to_db(conn: mysql.connector.MySQLConnection, hotel_id: int, urls: List[str]) -> bool:
    """Save hotel images to database"""
    if not urls:
        return False
    
    cursor = conn.cursor()
    
    # Check if images already exist for this hotel
    cursor.execute("SELECT hotel_id FROM hotels_image WHERE hotel_id = %s", (hotel_id,))
    if cursor.fetchone():
        cursor.close()
        return False  # Already exists
    
    query = "INSERT INTO hotels_image (hotel_id, photos_urls) VALUES (%s, %s)"
    photos_str = ','.join(urls)
    
    try:
        cursor.execute(query, (hotel_id, photos_str))
        conn.commit()
        cursor.close()
        return True
    except mysql.connector.Error:
        cursor.close()
        return False


def main():
    """Main execution function"""
    print("=" * 60)
    print("STAYLIO HOTEL DATA FETCHER")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Statistics
    stats = {
        'total_hotels': 0,
        'cities_processed': 0,
        'hotels_skipped': 0,
        'pages_processed': 0,
        'total_images': 0,
        'errors': 0
    }
    
    # Connect to database
    conn = connect_db()
    create_tables(conn)
    print()
    
    # Collect hotel IDs for image fetching
    hotel_ids = []
    
    # Process each city
    for city, dest_id in CITY_DEST_MAP.items():
        print(f"Processing city: {city.upper()}")
        print("-" * 60)
        
        page = 1
        city_hotel_count = 0
        consecutive_empty_pages = 0
        max_empty_pages = 3  # Stop after 3 consecutive empty pages
        
        while consecutive_empty_pages < max_empty_pages:
            print(f"  Page: {page}", end=" ")
            
            # Fetch hotels
            data = fetch_hotels_for_city(city, dest_id, page)
            
            if not data or 'data' not in data or 'hotels' not in data['data']:
                print("✗ No data")
                consecutive_empty_pages += 1
                stats['errors'] += 1
                if consecutive_empty_pages >= max_empty_pages:
                    break
                page += 1
                time.sleep(SLEEP_INTERVAL)
                continue
            
            hotels = data['data']['hotels']
            
            if not hotels or len(hotels) == 0:
                print("✗ Empty")
                consecutive_empty_pages += 1
                if consecutive_empty_pages >= max_empty_pages:
                    break
                page += 1
                time.sleep(SLEEP_INTERVAL)
                continue
            
            # Reset consecutive empty counter
            consecutive_empty_pages = 0
            stats['pages_processed'] += 1
            
            page_inserts = 0
            page_skips = 0
            
            # Process each hotel
            for hotel_item in hotels:
                hotel_id = hotel_item.get('hotel_id')
                
                if not hotel_id:
                    continue
                
                # Skip if already exists
                if hotel_exists(conn, hotel_id):
                    stats['hotels_skipped'] += 1
                    page_skips += 1
                    continue
                
                # Parse and save hotel
                hotel_data = parse_hotel_data(hotel_item)
                if hotel_data and save_hotel_to_db(conn, hotel_data, city):
                    hotel_ids.append(hotel_id)  # Collect for image fetching
                    stats['total_hotels'] += 1
                    city_hotel_count += 1
                    page_inserts += 1
            
            print(f"✓ (+{page_inserts} new, {page_skips} skipped)")
            
            # Check if we should continue (if we got less than 20 hotels, might be last page)
            if len(hotels) < 20:
                print(f"  ℹ Last page (only {len(hotels)} hotels)")
                break
            
            page += 1
            time.sleep(SLEEP_INTERVAL)
        
        print(f"  ✓ City complete: {city_hotel_count} hotels added")
        stats['cities_processed'] += 1
        print()
    
    # Fetch high-resolution images for all hotels
    if hotel_ids:
        print("=" * 60)
        print("FETCHING HIGH-RESOLUTION IMAGES")
        print("=" * 60)
        print(f"Total hotels to process: {len(hotel_ids)}")
        print()
        
        for idx, hotel_id in enumerate(hotel_ids, 1):
            print(f"[{idx}/{len(hotel_ids)}] Hotel {hotel_id}: ", end="")
            
            images = fetch_images_for_hotel(hotel_id)
            
            if images:
                if save_images_to_db(conn, hotel_id, images):
                    print(f"✓ Saved {len(images)} images")
                    stats['total_images'] += len(images)
                else:
                    print("⊘ Already exists")
            else:
                print("✗ No images")
            
            time.sleep(SLEEP_INTERVAL)
        
        print()
    
    # Close connection
    conn.close()
    
    # Print summary
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total hotels stored: {stats['total_hotels']}")
    print(f"Total hotels skipped (already exist): {stats['hotels_skipped']}")
    print(f"Total images stored: {stats['total_images']}")
    print(f"Total pages processed: {stats['pages_processed']}")
    print(f"Total cities processed: {stats['cities_processed']}")
    print(f"Total errors: {stats['errors']}")
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)


if __name__ == "__main__":
    main()
