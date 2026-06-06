import os
import uuid
import cv2
import json
import tempfile
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Origami CV API",
    description="Converts origami diagram images into step-by-step folding instructions",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../models/best.pt")
model = YOLO(MODEL_PATH)

@app.get("/")
def root():
    return {"status": "ok", "message": "Origami CV API is running"}

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/analyze")
async def analyze_diagram(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    results = model(img, conf=0.4)

    detections = []
    img_shape = img.shape
    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            detections.append({
                "class": model.names[cls],
                "confidence": round(conf, 3),
                "bbox": [round(x1), round(y1), round(x2), round(y2)]
            })

    if not detections:
        return JSONResponse(content={
            "status": "no_detections",
            "message": "No origami symbols detected in this image",
            "detections": [],
            "instructions": None
        })

    from backend.app.claude_client import detections_to_instructions
    instructions = detections_to_instructions(detections, img_shape)

    return JSONResponse(content={
        "status": "success",
        "filename": file.filename,
        "detections": detections,
        "instructions": instructions
    })
