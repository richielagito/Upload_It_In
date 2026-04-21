FROM python:3.11-slim

WORKDIR /app

# Install minimal system dependencies needed by psycopg2
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as non-root user for security
RUN adduser --disabled-password --gecos "" appuser
USER appuser

# Railway injects the PORT environment variable
CMD gunicorn --bind 0.0.0.0:$PORT app:app
