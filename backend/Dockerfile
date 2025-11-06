FROM python:3.11-slim AS base

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Configurable worker count and uvicorn options via env vars
ENV UVICORN_WORKERS=1 \
    UVICORN_TIMEOUT=60 \
    UVICORN_LOG_LEVEL=info

CMD ["bash", "-lc", "uvicorn main:app --host 0.0.0.0 --port 8000 --workers ${UVICORN_WORKERS} --timeout-keep-alive ${UVICORN_TIMEOUT} --log-level ${UVICORN_LOG_LEVEL}"]