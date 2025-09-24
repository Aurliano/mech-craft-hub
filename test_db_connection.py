#!/usr/bin/env python3
"""
Test database connection script
"""
import os
import sys
import psycopg2

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings_ultra_simple')

def test_db_connection():
    """Test database connection"""
    print("Testing database connection...")
    
    # Get database settings
    db_name = os.getenv('POSTGRES_DB', 'postgres')
    db_user = os.getenv('POSTGRES_USER', 'root')
    db_password = os.getenv('POSTGRES_PASSWORD', 'honm5klCHxMeLN9Rd8vkBegF')
    db_host = os.getenv('POSTGRES_HOST', 'sayda-db')
    db_port = os.getenv('POSTGRES_PORT', '5432')
    
    print(f"Connecting to: {db_user}@{db_host}:{db_port}/{db_name}")
    
    try:
        # Test connection
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password,
            connect_timeout=10
        )
        
        # Test query
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ Database connection successful!")
        print(f"PostgreSQL version: {version[0]}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    test_db_connection()
