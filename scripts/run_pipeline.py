import sys
import json
import cv2
sys.path.append(".")

from ultralytics import YOLO
from backend.app.claude_client import detections_to_instructions

def run_pipeline(image_path: str, conf_threshold: float = 0.4):
    print(f"\nProcessing: {image_path}")
    print("-" * 50)

    model = YOLO("models/best.pt")
    results = model(image_path, conf=conf_threshold)

    detections = []
    for r in results:
        img_shape = r.orig_shape
        for box in r.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            detections.append({
                "class": model.names[cls],
                "confidence": conf,
                "bbox": [x1, y1, x2, y2]
            })

    print(f"YOLO detected {len(detections)} symbols:")
    for d in detections:
        print(f"  {d['class']}: {d['confidence']:.2f}")

    if not detections:
        print("No symbols detected. Try lowering conf_threshold.")
        return None

    print("\nSending to Claude API...")
    instructions = detections_to_instructions(detections, img_shape)

    print("\nGenerated instructions:")
    print(json.dumps(instructions, indent=2))

    output_path = "data/processed/pipeline_output.json"
    with open(output_path, "w") as f:
        json.dump(instructions, f, indent=2)
    print(f"\nSaved to {output_path}")

    return instructions


if __name__ == "__main__":
    image = sys.argv[1] if len(sys.argv) > 1 else "data/labeled/test/images/cat_png.rf.ab6f313a44bc7b61c18ff8af76997b2f.jpg"
    run_pipeline(image)
