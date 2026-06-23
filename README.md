# Origami CV — Diagram to 3D Folding Instructions
![CI](https://github.com/krsngth22/origami-cv/actions/workflows/ci.yml/badge.svg)

A full-stack AI application that converts origami diagram photos into animated 3D step-by-step folding instructions using computer vision and large language models.

---

## Live Demo

- **App**: https://origami-cv.vercel.app
- **API Docs**: http://3.17.6.47:8000/docs
- **Demo Video**: https://www.youtube.com/watch?v=0orBzSLKn0s

---

## What It Does

Upload any origami diagram and the system will:

1. Detect fold symbols (arrows and fold lines) using a custom-trained YOLOv8 model
2. Interpret the detected symbols using Claude AI to generate plain-English instructions
3. Render an animated 3D paper mesh that shows each fold step interactively

---

## Tech Stack

| Layer             | Technology                              |
|-------------------|-----------------------------------------|
| Computer Vision   | YOLOv8 (Ultralytics) + OpenCV           |
| Data Labeling     | Roboflow                                |
| AI Instructions   | Claude API (Anthropic)                  |
| Backend           | FastAPI + Docker + Python               |
| Frontend          | React 19 + Three.js + Tailwind CSS      |
| Deployment        | AWS EC2 (backend) + Vercel (frontend)   |
| Tunnel            | ngrok (local YOLO inference)            |

---

## Architecture

```
User uploads origami diagram
          ↓
React frontend (Vercel)
          ↓  POST /analyze
Local FastAPI + YOLOv8 (via ngrok)
          ↓  detections JSON
FastAPI Claude wrapper (AWS EC2)
          ↓  Anthropic API
Structured fold instructions
          ↓
Three.js 3D animation + step panel
```

---

## ML Model

| Metric         | Value                                        |
|----------------|----------------------------------------------|
| Dataset        | 30 images, 691 total annotations             |
| Classes        | arrow (297 instances), fold-line (394 instances) |
| Augmentation   | flip, rotation ±15°, brightness ±25%, blur — 3x |
| Model          | YOLOv8n, 50 epochs, CPU training             |
| Arrow mAP50    | 0.891                                        |
| Arrow Recall   | 0.889                                        |

---

## Project Structure

```
origami-cv/
├── backend/
│   └── app/
│       ├── main.py            # Local FastAPI (YOLO + calls EC2)
│       ├── main_ec2.py        # EC2 FastAPI (Claude only)
│       └── claude_client.py   # Claude API integration
├── frontend/
│   └── origami-app/
│       └── src/
│           ├── App.js
│           ├── api.js
│           └── components/
│               ├── ImageUpload.jsx
│               ├── PaperScene.jsx    # Three.js 3D paper
│               └── StepPanel.jsx
├── models/
│   └── best.pt                # Trained YOLOv8 weights
├── data/
│   ├── raw/                   # Original diagram images
│   ├── labeled/               # Roboflow export (YOLOv8 format)
│   └── processed/             # OpenCV preprocessed images
├── notebooks/
│   └── 01_preprocessing.ipynb
├── scripts/
│   ├── preprocess.py          # OpenCV preprocessing pipeline
│   ├── run_pipeline.py        # End-to-end test script
│   ├── test_inference.py      # YOLO inference test
│   └── download_dataset.py    # Roboflow dataset download
├── docs/
│   └── architecture.md
├── Dockerfile
├── requirements.txt
└── deployment.md
```

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 20+
- ngrok account (free tier works)
- Anthropic API key

### 1. Clone and set up Python environment

```bash
git clone https://github.com/krsngth22/origami-cv
cd origami-cv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Run the local backend

```bash
uvicorn backend.app.main:app --reload --port 8000
```

### 4. Expose via ngrok (for Vercel frontend)

```bash
ngrok http 8000
# Copy the https://xxx.ngrok-free.dev URL
```

### 5. Run the React frontend

```bash
cd frontend/origami-app
npm install
npm start
# App opens at http://localhost:3000
```

---

## Deployment

### Backend (AWS EC2)

The Claude-only wrapper runs as a Docker container on EC2:

```bash
docker pull krsngth22/origami-cv:latest
docker run -d -p 8000:8000 \
  -e ANTHROPIC_API_KEY=your-key \
  --name origami-cv \
  --restart unless-stopped \
  krsngth22/origami-cv:latest
```

### Frontend (Vercel)

Automatically deploys on push to `main`. Set environment variable:

```
REACT_APP_API_URL=https://your-ngrok-url.ngrok-free.dev
```

---

## Key Design Decisions

**Why 2 YOLO classes instead of 8?**
Origami diagrams have 8+ symbol types. Training a model to distinguish all of them requires hundreds of labeled instances per class — too much for a solo labeling effort. Reducing to arrow + fold-line gives enough training data for a reliable model, and delegates semantic interpretation to Claude where it performs better anyway.

**Why split local + cloud backend?**
PyTorch is ~2GB. An EC2 t3.micro has 8GB disk. Running YOLO on EC2 causes disk space issues. The solution: run heavy YOLO inference locally (fast CPU, unlimited disk) and run the lightweight Claude wrapper on EC2 (56MB Docker image, always-on).

**Why Three.js for visualization?**
Static text instructions miss the spatial intuition of folding. A 3D paper mesh that animates valley and mountain folds gives users an immediate visual reference for each step.

**Current limitations**
The Three.js animation is a visual step indicator — the paper mesh rotates to signal 
step transitions but does not simulate actual fold geometry. Full origami simulation 
(splitting mesh along fold axes, accumulating fold state) is noted as future work. 
The core value of the system is in the CV + LLM pipeline that generates the instructions, 
not the visualization layer.

**Pre-defined fold sequences for 3D animation**
The Crane and Boat tabs use hand-crafted fold sequences — each step defines a fold axis, 
position, and angle that drives a Three.js geometry transformation. The animation system 
splits the paper mesh along the fold axis and rotates one half using GSAP quaternion 
interpolation. Undo works by replaying all previous folds instantly on a reset geometry, 
then animating only the final unfold. Full shape-accurate simulation for arbitrary uploaded 
diagrams is noted as future work.

**3D fold animation (current limitation)**
The Heart and Cicada tabs show fold animations using a stack-based geometry engine
that replays all previous folds from flat on each step. The fold shapes are
approximations — geometrically accurate origami simulation is planned for a future
version. The Upload tab shows text instructions only; 3D animation for arbitrary
uploaded diagrams is future work.

---

## Author

Thai Hoang Nguyen
- GitHub: [krsngth22](https://github.com/krsngth22)
- Project: [origami-cv](https://github.com/krsngth22/origami-cv)
