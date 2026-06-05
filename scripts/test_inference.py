from ultralytics import YOLO
import cv2
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

model = YOLO("models/best.pt")

import os
test_images = [f for f in os.listdir("data/labeled/test/images")]
print(f"Test images available: {test_images}")

test_img = f"data/labeled/test/images/{test_images[0]}"
print(f"Testing on: {test_img}")

results = model(test_img, conf=0.4)

for r in results:
    boxes = r.boxes
    print(f"\nDetected {len(boxes)} objects")
    for box in boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        name = model.names[cls]
        print(f"  {name}: {conf:.2f} confidence")

    annotated = r.plot()
    annotated_rgb = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)
    plt.figure(figsize=(10, 10))
    plt.imshow(annotated_rgb)
    plt.title("YOLO detections on test image")
    plt.axis("off")
    plt.savefig("data/processed/test_detections.png", bbox_inches='tight')
    print("\nSaved to data/processed/test_detections.png")
