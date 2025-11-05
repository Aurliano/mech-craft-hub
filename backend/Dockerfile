# Multi-stage build optimized for Liara
FROM python:3.11-slim as builder

# Install system dependencies for building
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and install Python dependencies
COPY requirements_liara.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user (kept for reference)
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code (excluding unnecessary files)
COPY --chown=root:root . .

# Remove unnecessary files to reduce image size
RUN find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find . -name "*.pyc" -delete 2>/dev/null || true && \
    find . -name "*.pyo" -delete 2>/dev/null || true && \
    find . -name ".pytest_cache" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find . -name ".mypy_cache" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find . -name "*.log" -delete 2>/dev/null || true

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/media /app/staticfiles /app/backend/media && \
    chown -R root:root /app

# NOTE: Run as root to ensure mounted disk at /app/backend/media is writable
# USER appuser

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings_ultra_simple
ENV STATIC_ROOT=/app/staticfiles

# Health check - using curl instead of requests for better reliability
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/api/health/ || exit 1

# Expose port
EXPOSE 80

# Collect static files at build time so admin assets are available
RUN python backend/manage.py collectstatic --noinput

# Default command
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:80", "--workers", "3", "--timeout", "120", "--max-requests", "1000", "--max-requests-jitter", "100", "--preload"]
