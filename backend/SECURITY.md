# Security Configuration Guide

This document outlines the security measures implemented in the Mech Craft Hub application.

## Security Features Implemented

### 1. HTTPS and SSL Security
- **SECURE_SSL_REDIRECT**: Forces all HTTP requests to redirect to HTTPS
- **SESSION_COOKIE_SECURE**: Ensures session cookies are only sent over HTTPS
- **CSRF_COOKIE_SECURE**: Ensures CSRF cookies are only sent over HTTPS
- **SESSION_COOKIE_HTTPONLY**: Prevents JavaScript access to session cookies

### 2. HTTP Strict Transport Security (HSTS)
- **SECURE_HSTS_SECONDS**: 31536000 (1 year)
- **SECURE_HSTS_INCLUDE_SUBDOMAINS**: Includes all subdomains
- **SECURE_HSTS_PRELOAD**: Enables HSTS preload list inclusion

### 3. Content Security
- **SECURE_CONTENT_TYPE_NOSNIFF**: Prevents MIME type sniffing
- **SECURE_BROWSER_XSS_FILTER**: Enables browser XSS filtering
- **X_FRAME_OPTIONS**: 'DENY' - Prevents clickjacking
- **SECURE_REFERRER_POLICY**: Controls referrer information

### 4. Password Security
- **Argon2 Password Hasher**: Primary password hashing algorithm
- **Fallback Hashers**: PBKDF2, BCrypt, Scrypt for compatibility
- **Password Validation**: Django's built-in password validators

### 5. Content Security Policy (CSP)
- **CSP_DEFAULT_SRC**: Restricts resource loading to same origin
- **CSP_SCRIPT_SRC**: Allows scripts from self and Cloudflare
- **CSP_STYLE_SRC**: Allows styles from self and Google Fonts
- **CSP_IMG_SRC**: Allows images from self, data, and HTTPS
- **CSP_OBJECT_SRC**: Blocks object/embed elements
- **CSP_FRAME_ANCESTORS**: Prevents embedding in frames

### 6. Brute Force Protection (django-axes)
- **AXES_FAILURE_LIMIT**: 5 failed attempts before lockout
- **AXES_COOLOFF_TIME**: 1 hour lockout duration
- **AXES_LOCKOUT_BY_COMBINATION_USER_AND_IP**: Locks by user+IP combination
- **AXES_RESET_ON_SUCCESS**: Resets counter on successful login

### 7. API Rate Limiting
- **Anonymous Users**: 100 requests per hour
- **Authenticated Users**: 1000 requests per hour
- **Login Endpoint**: 5 requests per minute
- **Registration Endpoint**: 3 requests per minute
- **Password Reset**: 2 requests per minute
- **Sensitive Endpoints**: 20 requests per minute

## Testing Security Configuration

### Local HTTPS Testing

For local development with HTTPS:

1. **Generate SSL Certificate**:
   ```bash
   # Create self-signed certificate
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
   ```

2. **Run Django with HTTPS**:
   ```bash
   python manage.py runserver --settings=config.settings 0.0.0.0:8000
   ```

3. **Use HTTPS in development**:
   ```bash
   # Install django-extensions for runserver_plus
   pip install django-extensions
   
   # Run with HTTPS
   python manage.py runserver_plus --cert-file=cert.pem --key-file=key.pem
   ```

### Security Headers Testing

Test security headers using curl:

```bash
# Test security headers
curl -I https://localhost:8000/api/health/

# Expected headers:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# Content-Security-Policy: default-src 'self'; ...
```

### Rate Limiting Testing

Test rate limiting:

```bash
# Test login rate limiting
for i in {1..6}; do
  curl -X POST https://localhost:8000/api/v1/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
done
```

### Brute Force Protection Testing

Test django-axes:

```bash
# Test axes lockout
for i in {1..6}; do
  curl -X POST https://localhost:8000/api/v1/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"wrong"}'
done
```

## Security Best Practices

### 1. Environment Variables
- Store sensitive configuration in environment variables
- Use different settings for development and production
- Never commit secrets to version control

### 2. Database Security
- Use strong database passwords
- Enable SSL for database connections in production
- Regular database backups with encryption

### 3. Server Configuration
- Keep server software updated
- Use a reverse proxy (nginx/Apache) in production
- Configure proper firewall rules
- Enable server-level security headers

### 4. Monitoring and Logging
- Monitor failed login attempts
- Log security events
- Set up alerts for suspicious activity
- Regular security audits

### 5. User Education
- Encourage strong passwords
- Implement two-factor authentication (future enhancement)
- Regular security awareness training

## Production Deployment

### 1. Environment Configuration
```bash
# Production environment variables
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port/db
```

### 2. SSL Certificate
- Use Let's Encrypt for free SSL certificates
- Configure automatic renewal
- Use strong cipher suites

### 3. Reverse Proxy Configuration
```nginx
# Nginx configuration example
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Security Checklist

- [ ] HTTPS enabled and working
- [ ] Security headers present
- [ ] CSP configured and tested
- [ ] Rate limiting working
- [ ] Brute force protection active
- [ ] Password hashing using Argon2
- [ ] Session cookies secure
- [ ] CSRF protection enabled
- [ ] Database connections encrypted
- [ ] Error pages don't leak information
- [ ] Logging configured for security events
- [ ] Regular security updates scheduled

## Incident Response

### 1. Security Incident Procedure
1. Identify the incident
2. Contain the threat
3. Assess the damage
4. Notify stakeholders
5. Document the incident
6. Implement fixes
7. Review and improve

### 2. Contact Information
- Security Team: security@mechcraft.com
- Emergency Contact: +98-XXX-XXX-XXXX
- Incident Reporting: incidents@mechcraft.com

## Updates and Maintenance

### Regular Security Tasks
- [ ] Weekly security updates
- [ ] Monthly security audits
- [ ] Quarterly penetration testing
- [ ] Annual security review
- [ ] Continuous monitoring

### Security Dependencies
- Django security updates
- Python security updates
- OS security patches
- Third-party library updates

## References

- [Django Security](https://docs.djangoproject.com/en/stable/topics/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Mozilla Security Guidelines](https://infosec.mozilla.org/guidelines/)
- [Django-axes Documentation](https://django-axes.readthedocs.io/)
- [Django-CSP Documentation](https://django-csp.readthedocs.io/)
