FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    python-multipart \
    anthropic \
    python-dotenv \
    pydantic

COPY backend/ ./backend/

EXPOSE 8000

CMD ["uvicorn", "backend.app.main_ec2:app", "--host", "0.0.0.0", "--port", "8000"]
