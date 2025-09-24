#!/usr/bin/env python
"""
Main entry point for Liara deployment
This file ensures compatibility with Liara's default startup process
"""

import os
import sys
import subprocess

def main():
    """Main entry point that redirects to Django management"""
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    
    # Set environment variables
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings_ultra_simple')
    os.environ.setdefault('PYTHONPATH', '/app/backend')
    
    # Run migrations
    print("Running database migrations...")
    subprocess.run([sys.executable, 'manage.py', 'migrate', '--run-syncdb'], check=True)
    
    # Start Gunicorn
    print("Starting Gunicorn server...")
    subprocess.run([
        'gunicorn', 
        'config.wsgi:application',
        '--bind', '0.0.0.0:80',
        '--workers', '3',
        '--timeout', '120',
        '--max-requests', '1000',
        '--max-requests-jitter', '100',
        '--preload'
    ], check=True)

if __name__ == '__main__':
    main()
