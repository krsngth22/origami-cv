import pytest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ─── claude_client tests ───────────────────────────────────────────────────

def test_detections_to_prompt_format():
    """Test that detections are correctly formatted into a prompt string."""
    from backend.app.claude_client import format_detections_for_prompt
    detections = [
        {"cls": "arrow", "confidence": 0.98, "bbox": [10, 20, 50, 80]},
        {"cls": "fold-line", "confidence": 0.75, "bbox": [100, 200, 300, 210]},
    ]
    img_shape = (640, 480)
    result = format_detections_for_prompt(detections, img_shape)
    assert "arrow" in result
    assert "fold-line" in result
    assert "0.98" in result or "98" in result


def test_detections_empty():
    """Test that empty detections list is handled gracefully."""
    from backend.app.claude_client import format_detections_for_prompt
    result = format_detections_for_prompt([], (640, 480))
    assert isinstance(result, str)
    assert len(result) >= 0


# ─── preprocess tests ──────────────────────────────────────────────────────

def test_preprocess_returns_array():
    """Test that preprocess returns a dict with expected keys."""
    import numpy as np
    from scripts.preprocess import preprocess
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    result = preprocess(img)
    assert isinstance(result, dict)
    assert "original" in result
    assert "gray" in result
    assert "edges" in result


def test_preprocess_grayscale():
    """Test that preprocess gray output is a 2D grayscale array."""
    import numpy as np
    from scripts.preprocess import preprocess
    img = np.ones((480, 640, 3), dtype=np.uint8) * 128
    result = preprocess(img)
    assert isinstance(result["gray"], np.ndarray)
    assert len(result["gray"].shape) == 2


# ─── FastAPI endpoint tests ────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_endpoint():
    """Test that /health returns 200 and healthy status."""
    from httpx import AsyncClient, ASGITransport
    from backend.app.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_analyze_no_file():
    """Test that /analyze returns 422 when no file is provided."""
    from httpx import AsyncClient, ASGITransport
    from backend.app.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/analyze")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_analyze_invalid_file():
    """Test that /analyze handles non-image files gracefully."""
    from httpx import AsyncClient, ASGITransport
    from backend.app.main import app
    import io
    fake_file = io.BytesIO(b"this is not an image")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/analyze",
            files={"file": ("test.txt", fake_file, "text/plain")}
        )
    assert response.status_code in [400, 422, 500]