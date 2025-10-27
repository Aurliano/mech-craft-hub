"""
SEO views for robots.txt and sitemap
"""
from django.http import HttpResponse
from django.conf import settings


def robots_txt(request):
    """
    Generate robots.txt file dynamically
    Returns proper Content-Type header for text/plain
    """
    # Get the domain from request
    scheme = request.scheme  # http or https
    host = request.get_host()  # domain or domain:port
    
    # Build the sitemap URL using the current request
    sitemap_url = f"{scheme}://{host}/sitemap.xml"
    
    # Generate robots.txt content
    robots_content = f"""User-agent: *
Allow: /

# Disallow admin and API areas
Disallow: /admin/
Disallow: /api/

# Allow static files
Allow: /static/
Allow: /media/

Sitemap: {sitemap_url}
"""
    
    response = HttpResponse(robots_content, content_type='text/plain')
    response['X-Content-Type-Options'] = 'nosniff'
    return response
