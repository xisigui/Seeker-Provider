FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=development
ENV FLASK_DEBUG=1
ENV FLASK_RUN_HOST=0.0.0.0

# Make the startup script executable
RUN chmod +x /app/start.sh

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["/app/start.sh"] 