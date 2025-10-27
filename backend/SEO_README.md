# SEO Configuration - پلتفرم مهندسی سایدا

## ✅ Implementation Complete

### 1. robots.txt
- **Endpoint**: `/robots.txt`
- **Content-Type**: `text/plain`
- **Features**:
  - Allows all bots to crawl the site
  - Disallows `/admin/` and `/api/` directories
  - Points to sitemap.xml dynamically
  - Automatically uses correct scheme (http/https) and domain

### 2. sitemap.xml
- **Endpoint**: `/sitemap.xml`
- **Content-Type**: `application/xml`
- **Features**:
  - **Static pages** (StaticViewSitemap):
    - Home (priority: 1.0)
    - Services (priority: 0.9)
    - Design, Analysis, Drawing, Manufacturing (priority: 0.8)
    - Blog, Portfolio (priority: 0.7-0.8)
    - Contact (priority: 0.6)
  - **Blog posts** (BlogPostSitemap):
    - Automatically includes all published blog posts
    - Updates when new posts are published
    - Includes last modification dates

## 📁 Files Created/Modified

### New Files:
- `backend/config/sitemaps.py` - Sitemap configuration
- `backend/config/seo_views.py` - robots.txt view
- `backend/test_seo.py` - Test script

### Modified Files:
- `backend/config/settings_ultra_simple.py` - Added sitemaps app
- `backend/config/urls.py` - Added SEO routes
- `liara_nginx.conf` - Added Nginx configuration for SEO files

## 🧪 Testing

### Local Testing:
```bash
cd backend
python test_seo.py
```

### Manual Testing:
```bash
# Test robots.txt
curl http://localhost:8000/robots.txt

# Test sitemap.xml
curl http://localhost:8000/sitemap.xml
```

### Production Testing:
After deployment, test at:
- https://saydatech.ir/robots.txt
- https://saydatech.ir/sitemap.xml

## 🔍 Google Search Console Setup

### 1. Verify Site Ownership
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://saydatech.ir`
3. Verify ownership using one of these methods:
   - HTML file upload
   - HTML tag (already in index.html)
   - Domain name provider

### 2. Submit Sitemap
1. After verification, go to **Sitemaps** section
2. Add new sitemap: `https://saydatech.ir/sitemap.xml`
3. Click **Submit**
4. Wait for Google to crawl (usually 24-48 hours)

### 3. Monitor Indexing
- Check **Coverage** report for indexed pages
- Check **Sitemaps** report for submission status
- Use **URL Inspection** tool to test individual URLs

## 📊 Expected Results

### robots.txt Output:
```
User-agent: *
Allow: /

# Disallow admin and API areas
Disallow: /admin/
Disallow: /api/

# Allow static files
Allow: /static/
Allow: /media/

Sitemap: https://saydatech.ir/sitemap.xml
```

### sitemap.xml Structure:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://saydatech.ir/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://saydatech.ir/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- More URLs... -->
</urlset>
```

## 🎯 Next Steps

### Recommended SEO Enhancements:
1. Add meta descriptions to each page
2. Add Open Graph tags for social sharing
3. Implement structured data (JSON-LD)
4. Add canonical URLs
5. Optimize images with alt text
6. Add breadcrumbs schema

### Performance Optimizations:
1. Enable Gzip compression
2. Implement lazy loading for images
3. Minify CSS and JavaScript
4. Use CDN for static assets (already configured)

## 🔧 Troubleshooting

### Issue: robots.txt returns 404
**Solution**: Check that `robots_txt` view is properly imported in `urls.py`

### Issue: sitemap.xml returns 404
**Solution**: Verify that `django.contrib.sitemaps` is in `INSTALLED_APPS`

### Issue: Google can't access sitemap
**Solution**: 
- Ensure sitemap is accessible without authentication
- Check Nginx configuration allows serving XML files
- Verify CORS settings

### Issue: Blog posts not appearing in sitemap
**Solution**: Check that blog posts have `status='published'` in database

## 📝 Maintenance

The sitemap automatically updates when:
- New blog posts are published
- You modify the `StaticViewSitemap.items()` list

To add new pages to sitemap:
1. Open `backend/config/sitemaps.py`
2. Add URL path to `StaticViewSitemap.items()`
3. Update priority and changefreq dictionaries if needed
4. Deploy changes

## ✅ Verification Checklist

- [x] robots.txt returns 200 OK
- [x] sitemap.xml returns 200 OK
- [x] Correct Content-Type headers
- [x] All main pages included in sitemap
- [x] Blog posts automatically included
- [x] Nginx configuration updated
- [x] Django app added to INSTALLED_APPS
- [x] URLs configured correctly
- [ ] Test in production
- [ ] Submit to Google Search Console
- [ ] Monitor indexing status
