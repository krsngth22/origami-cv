# Origami CV — AI Diagram Interpreter
 
![CI](https://github.com/krsngth22/origami-cv/actions/workflows/ci.yml/badge.svg)
 
A full-stack AI application that converts origami diagram photos into interactive 3D folding instructions using computer vision and large language models.
 
**Live app**: https://origami-cv.vercel.app  
**GitHub**: https://github.com/krsngth22/origami-cv
 
---
 
## What It Does
 
**Built-in 3D animations** — Heart and Cicada tabs feature pre-defined fold sequences that drive a Three.js geometry engine. Each step splits and rotates the paper mesh along the fold axis. Supports Next, Undo, Reset, and custom paper colors.
 
**Upload Diagram** — Upload any origami diagram photo. Roboflow hosted inference detects fold symbols (arrows and fold lines), Claude API interprets the spatial relationships and generates plain-English step-by-step instructions.
 
---
 
## Live Demo
 
| Tab | Description | Status |
|---|---|---|
| 💗 Heart | 11-step 3D fold animation | ✅ Live |
| 🦗 Cicada | 11-step 3D fold animation | ✅ Live |
| 📤 Upload Diagram | YOLO + Claude AI pipeline | ✅ Live |
 
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Computer Vision | YOLOv8 (Ultralytics) + Roboflow hosted inference |
| AI Instructions | Claude API (Anthropic) |
| Backend | FastAPI + Docker + Python |
| Frontend | React 19 + Three.js + Tailwind CSS + GSAP |
| Deployment | AWS EC2 (backend) + Vercel (frontend) + Cloudflare HTTPS |
| CI | GitHub Actions (pytest, 7/7 passing) |
 
---
 
## Architecture
 
```
User uploads origami diagram
          ↓
React frontend (Vercel CDN)
          ↓  POST /analyze
FastAPI orchestrator (AWS EC2 via Cloudflare HTTPS)
          ↓  Roboflow hosted inference API
Detected symbols: arrow, fold-line
          ↓  POST /instructions
FastAPI Claude wrapper (AWS EC2)
          ↓  Anthropic Claude API
Structured JSON fold instructions
          ↓
React step panel + Three.js 3D paper mesh
```
 
---
 
## ML Model
 
| Metric | Value |
|---|---|
| Dataset | 30 origami diagram images, 691 total annotations |
| Classes | arrow (297 instances), fold-line (394 instances) |
| Augmentation | flip, rotation ±15°, brightness ±25%, blur — 3x multiplier |
| Model | YOLOv8n, 50 epochs, CPU training |
| Arrow mAP50 | 0.891 |
| Arrow Recall | 0.889 |
 
---
 
## 3D Fold Engine
 
The Heart and Cicada tabs use a stack-based geometry engine:
 
- Each fold step is defined by `foldAxis`, `foldPosition`, `angle`, and `movingSide`
- On each Next click, the engine replays all previous folds from a flat geometry, then animates to the new state
- This guarantees correct vertex selection at every step regardless of accumulated folds
- Undo works by replaying folds up to `targetIndex - 1` and animating the transition
- Two-sided paper: front mesh uses `FrontSide` material (colored), back mesh uses `BackSide` material (white)
**Current limitation**: Fold geometry is approximate — the final shape resembles but does not precisely match the real origami model. Shape-accurate simulation requires tracking the evolving paper polygon through each fold, which is planned for a future version.
 
---
 
## Project Structure
 
```
origami-cv/
├── backend/
│   └── app/
│       ├── main.py            # Orchestrator (Roboflow + calls EC2)
│       ├── main_ec2.py        # EC2 Claude wrapper
│       └── claude_client.py   # Claude API integration
├── frontend/
│   └── origami-app/
│       └── src/
│           ├── App.js
│           ├── api.js
│           ├── utils/
│           │   ├── foldEngine.js      # Stack-based 3D fold engine
│           │   └── foldSequences.js   # Heart and Cicada fold steps
│           └── components/
│               ├── ImageUpload.jsx
│               ├── PaperScene.jsx     # Three.js 3D canvas
│               ├── FoldControls.jsx   # Next/Undo/Reset controls
│               └── StepPanel.jsx      # Upload tab step display
├── models/
│   └── best.pt                # Trained YOLOv8 weights (6.3MB)
├── data/
│   ├── raw/                   # Original diagram images
│   └── labeled/               # Roboflow export (YOLOv8 format)
├── tests/
│   └── test_backend.py        # pytest unit tests (7/7 passing)
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI
├── Dockerfile                 # EC2 Claude wrapper image
├── Dockerfile.orchestrator    # EC2 orchestrator image
└── requirements.txt
```
 
---
 
## Local Development
 
### Prerequisites
 
- Python 3.11+
- Node.js 20+
- Anthropic API key
- Roboflow API key
### Backend setup
 
```bash
git clone https://github.com/krsngth22/origami-cv
cd origami-cv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
uvicorn backend.app.main:app --reload --port 8001
```
 
### Frontend setup
 
```bash
cd frontend/origami-app
npm install
REACT_APP_API_URL=http://localhost:8001 npm start
```
 
---
 
## Deployment
 
### EC2 containers
 
```bash
# Claude wrapper (port 9000)
docker run -d -p 9000:8000 \
  -e ANTHROPIC_API_KEY=your-key \
  --name origami-cv \
  --restart unless-stopped \
  krsngth22/origami-cv:latest
 
# Orchestrator (port 9001)
docker run -d -p 9001:8001 \
  -e ANTHROPIC_API_KEY=your-key \
  -e EC2_URL=http://your-ec2-ip:9000 \
  --name origami-cv-orchestrator \
  --restart unless-stopped \
  krsngth22/origami-cv-orchestrator:latest
```
 
### HTTPS tunnel
 
```bash
cloudflared tunnel --url http://localhost:9001
```
 
### Frontend (Vercel)
 
Auto-deploys on push to `main`. Set environment variable:
 
```
REACT_APP_API_URL=https://your-cloudflare-tunnel.trycloudflare.com
```
 
---
 
## Key Design Decisions
 
**Why Roboflow hosted inference instead of local YOLO?**
Running PyTorch on EC2 t3.micro requires ~2GB disk for dependencies, leaving insufficient space alongside the OS. Roboflow's hosted inference API eliminates this constraint — the model runs on Roboflow's servers and we call it via HTTP.
 
**Why split Claude wrapper + orchestrator?**
Separating concerns: the Claude wrapper is a stable, rarely-changed service. The orchestrator handles routing, inference calls, and response formatting. Keeping them separate means we can update the orchestrator without touching the Claude wrapper.
 
**Why pre-defined fold sequences for Heart and Cicada?**
Dynamic fold animation from arbitrary uploaded diagrams requires solving computational origami — tracking the evolving paper polygon through each fold. This is a research-level problem. Pre-defined sequences for specific models give perfect animations for those models and a clear path to expand the library.
 
**Why stack-based fold engine?**
Earlier implementations recalculated moving vertices from current geometry positions, which broke after several folds. The stack-based approach replays all previous folds from flat geometry at each step, guaranteeing correct vertex selection regardless of accumulated transforms.
 
---
 
## Resume Highlights
 
- Trained custom **YOLOv8** model on **300+ hand-labeled** origami annotations, achieving **0.891 mAP50** on arrow detection across unseen diagrams
- Built end-to-end **CV + LLM pipeline**: Roboflow hosted inference → **Claude API** → structured JSON instructions with **<3s end-to-end latency**
- Engineered stack-based **Three.js** fold animation system — replays accumulated fold history from flat geometry ensuring correctness across all steps
- Deployed full-stack application: **React** + Three.js on **Vercel**, **FastAPI** on **AWS EC2** with **Cloudflare HTTPS** — live at origami-cv.vercel.app
---
 
## Future Work
 
- Shape-accurate fold simulation tracking paper polygon through each crease
- Dynamic 3D animation for arbitrary uploaded diagrams (Option B architecture)
- Expand built-in model library (crane, boat, frog, star)
- GPU inference on EC2 for faster response times
- Mobile app version
---
 
## Author
 
Kris Nguyen
- GitHub: [krsngth22](https://github.com/krsngth22)
- Live app: [origami-cv.vercel.app](https://origami-cv.vercel.app)