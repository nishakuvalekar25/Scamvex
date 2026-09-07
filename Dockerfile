FROM python:3.11-slim

WORKDIR /app

# Install Tesseract OCR
RUN apt-get update \
    && apt-get install -y tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

# Copy backend and trained model
COPY backend ./backend
COPY model ./model

# Render uses port 10000
EXPOSE 10000

# Start FastAPI
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "10000"]