import os
import cv2
import json
import httpx
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Origami CV Local API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../models/best.pt")
model = YOLO(MODEL_PATH)

EC2_URL = "http://3.17.6.47:8000"

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
    img_shape = list(img.shape)
    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            detections.append({
                "cls": model.names[cls],
                "confidence": round(conf, 3),
                "bbox": [round(x1), round(y1), round(x2), round(y2)]
            })

    if not detections:
        return JSONResponse(content={
            "status": "no_detections",
            "message": "No origami symbols detected",
            "instructions": None
        })

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{EC2_URL}/instructions",
            json={"detections": detections, "image_shape": img_shape}
        )
        print(f"EC2 status: {response.status_code}")
        print(f"EC2 response text: '{response.text[:200]}'")
        if not response.text:
            return JSONResponse(content={"status": "error", "message": "EC2 returned empty response"}, status_code=500)
        result = response.json()

    return JSONResponse(content={
        "status": "success",
        "detections": detections,
        "instructions": result.get("instructions")
    })
