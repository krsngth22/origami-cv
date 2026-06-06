import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Origami CV API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Detection(BaseModel):
    cls: str
    confidence: float
    bbox: list[float]

class AnalyzeRequest(BaseModel):
    detections: list[Detection]
    image_shape: list[int]

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/instructions")
async def get_instructions(request: AnalyzeRequest):
    if not request.detections:
        raise HTTPException(status_code=400, detail="No detections provided")

    detections = [{"cls": d.cls, "confidence": d.confidence, "bbox": d.bbox} for d in request.detections]
    img_shape = tuple(request.image_shape)

    from backend.app.claude_client import detections_to_instructions
    instructions = detections_to_instructions(detections, img_shape)

    return JSONResponse(content={"status": "success", "instructions": instructions})
