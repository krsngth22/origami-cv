import os
import httpx
import base64
from fastapi import FastAPI, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

app = FastAPI(title="Origami CV API", version="2.0.0")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY", "y8CqklhaGLS0Ao0RTtXc")
ROBOFLOW_URL = "https://detect.roboflow.com/kriss-workspace-0pkoe/origami-symbols-1-yolov8n-t1"
EC2_URL = os.getenv("EC2_URL", "http://3.17.6.47:8000")

@app.get("/health")
def health():
    return {"status": "healthy", "inference": "roboflow"}

@app.post("/analyze")
@limiter.limit("10/minute")
async def analyze_diagram(request: Request, file: UploadFile = File(...)):
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/bmp"]
    if file.content_type not in allowed_types:
        return JSONResponse(
            content={"status": "error", "message": f"Invalid file type. Please upload an image."},
            status_code=400
        )
    if file.size and file.size > 10 * 1024 * 1024:
        return JSONResponse(
            content={"status": "error", "message": "File too large. Maximum size is 10MB."},
            status_code=400
        )

    contents = await file.read()
    img_base64 = base64.b64encode(contents).decode("utf-8")

    # Call Roboflow hosted inference
    async with httpx.AsyncClient(timeout=30) as client:
        rf_response = await client.post(
            f"{ROBOFLOW_URL}?api_key={ROBOFLOW_API_KEY}&confidence=40&overlap=30",
            content=img_base64,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )

    if rf_response.status_code != 200:
        return JSONResponse(
            content={"status": "error", "message": "Roboflow inference failed"},
            status_code=500
        )

    rf_data = rf_response.json()
    predictions = rf_data.get("predictions", [])
    img_width = rf_data.get("image", {}).get("width", 640)
    img_height = rf_data.get("image", {}).get("height", 480)

    if not predictions:
        return JSONResponse(content={
            "status": "no_detections",
            "message": "No origami symbols detected",
            "instructions": None
        })

    # Convert Roboflow format to our format
    detections = []
    for pred in predictions:
        x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
        x1 = round(x - w / 2)
        y1 = round(y - h / 2)
        x2 = round(x + w / 2)
        y2 = round(y + h / 2)
        detections.append({
            "cls": pred["class"],
            "confidence": round(pred["confidence"], 3),
            "bbox": [x1, y1, x2, y2]
        })

    img_shape = [img_height, img_width, 3]

    # Call EC2 Claude wrapper
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{EC2_URL}/instructions",
            json={"detections": detections, "image_shape": img_shape}
        )
        if not response.text:
            return JSONResponse(
                content={"status": "error", "message": "EC2 returned empty response"},
                status_code=500
            )
        result = response.json()

    return JSONResponse(content={
        "status": "success",
        "detections": detections,
        "instructions": result.get("instructions")
    })