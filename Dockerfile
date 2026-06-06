FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgl1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    python-multipart \
    anthropic \
    python-dotenv \
    opencv-python-headless \
    "ultralytics==8.0.196" \
    "torch==2.0.1+cpu" \
    "torchvision==0.15.2+cpu" \
    --extra-index-url https://download.pytorch.org/whl/cpu

COPY models/ ./models/
COPY backend/ ./backend/

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
