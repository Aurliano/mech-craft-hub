"""
Sitemap configuration for SEO optimization
"""
from django.contrib.sitemaps import Sitemap


class BlogPostSitemap(Sitemap):
    """Sitemap for blog posts"""
    priority = 0.7
    changefreq = 'weekly'

    def items(self):
        """Return all published blog posts"""
        try:
            from api.models import BlogPost
            return BlogPost.objects.filter(status='published')
        except:
            return []

    def location(self, item):
        """Return URL for each blog post"""
        return f'/blog/{item.slug}'
    
    def lastmod(self, item):
        """Return last modification date"""
        return item.updated_at


class StaticViewSitemap(Sitemap):
    """
    Static view sitemap for main pages of the application
    Since we're using a React SPA, we list the frontend routes directly
    """
    priority = 0.5
    changefreq = 'weekly'

    def items(self):
        """Return list of URL paths for frontend routes"""
        return [
            '/',  # Home page
            '/services',  # Services page
            '/design',  # Design service page
            '/analysis',  # Analysis service page
            '/drawing',  # Drawing service page
            '/manufacturing',  # Manufacturing service page
            '/blog',  # Blog main page
            '/portfolio',  # Portfolio page
            '/#contact',  # Contact section
        ]

    def location(self, item):
        """Return the URL for each item"""
        return item
    
    def priority(self, item):
        """Return priority based on page importance"""
        priority_map = {
            '/': 1.0,
            '/services': 0.9,
            '/blog': 0.8,
            '/portfolio': 0.7,
            '/design': 0.8,
            '/analysis': 0.8,
            '/drawing': 0.8,
            '/manufacturing': 0.8,
            '/#contact': 0.6,
        }
        return priority_map.get(item, 0.5)
    
    def changefreq(self, item):
        """Return change frequency based on page type"""
        freq_map = {
            '/': 'weekly',
            '/services': 'monthly',
            '/blog': 'daily',  # Blog updates frequently
            '/portfolio': 'monthly',
            '/design': 'monthly',
            '/analysis': 'monthly',
            '/drawing': 'monthly',
            '/manufacturing': 'monthly',
            '/#contact': 'yearly',
        }
        return freq_map.get(item, 'weekly')


# Dictionary to be used in URLs configuration
sitemaps = {
    'static': StaticViewSitemap,
    'blog': BlogPostSitemap,
}
