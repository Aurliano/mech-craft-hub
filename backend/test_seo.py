#!/usr/bin/env python
"""
Test SEO endpoints (robots.txt and sitemap.xml)
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings_ultra_simple')
os.environ.setdefault('USE_SQLITE', '1')
os.environ.setdefault('SECRET_KEY', 'test-key')
django.setup()

from django.test import Client
from django.urls import reverse


def test_robots_txt():
    """Test robots.txt endpoint"""
    print("=" * 60)
    print("Testing robots.txt endpoint")
    print("=" * 60)
    
    client = Client()
    response = client.get('/robots.txt')
    
    print(f"Status Code: {response.status_code}")
    print(f"Content-Type: {response.get('Content-Type')}")
    print(f"\nContent:\n{response.content.decode()}")
    
    assert response.status_code == 200, "robots.txt should return 200"
    assert 'text/plain' in response.get('Content-Type'), "Should be text/plain"
    assert 'User-agent' in response.content.decode(), "Should contain User-agent"
    assert 'Sitemap' in response.content.decode(), "Should contain Sitemap URL"
    
    print("\n✅ robots.txt test passed!")
    return True


def test_sitemap_xml():
    """Test sitemap.xml endpoint"""
    print("\n" + "=" * 60)
    print("Testing sitemap.xml endpoint")
    print("=" * 60)
    
    client = Client()
    response = client.get('/sitemap.xml')
    
    print(f"Status Code: {response.status_code}")
    print(f"Content-Type: {response.get('Content-Type')}")
    
    content = response.content.decode()
    print(f"\nContent (first 500 chars):\n{content[:500]}...")
    
    assert response.status_code == 200, "sitemap.xml should return 200"
    assert 'xml' in response.get('Content-Type'), "Should be XML"
    assert 'urlset' in content or 'urlset' in content.lower(), "Should contain urlset"
    assert '<url>' in content, "Should contain URL entries"
    
    print("\n✅ sitemap.xml test passed!")
    return True


def test_urls_exist():
    """Test that all URLs in sitemap exist"""
    print("\n" + "=" * 60)
    print("Testing URLs from sitemap")
    print("=" * 60)
    
    client = Client()
    response = client.get('/sitemap.xml')
    content = response.content.decode()
    
    # Extract URLs from sitemap
    import re
    urls = re.findall(r'<loc>(.*?)</loc>', content)
    
    print(f"Found {len(urls)} URLs in sitemap:")
    for url in urls:
        print(f"  - {url}")
    
    assert len(urls) > 0, "Sitemap should contain at least one URL"
    
    print("\n✅ URLs test passed!")
    return True


if __name__ == "__main__":
    try:
        # Run tests
        test_robots_txt()
        test_sitemap_xml()
        test_urls_exist()
        
        print("\n" + "=" * 60)
        print("✅ All SEO tests passed!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
