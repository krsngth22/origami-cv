import cv2
import numpy as np
import os
import argparse

def load_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Could not load image at: {image_path}")
    return img

def preprocess(img, blur_kernel=(5, 5), canny_low=50, canny_high=150):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, blur_kernel, 0)
    edges = cv2.Canny(blurred, canny_low, canny_high)
    return {
        "original": img,
        "gray": gray,
        "blurred": blurred,
        "edges": edges
    }

def save_processed(edges, output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, edges)
    print(f"Saved processed image to: {output_path}")

def find_contours(edges, min_area=100):
    contours, _ = cv2.findContours(
        edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    significant = [c for c in contours if cv2.contourArea(c) > min_area]
    print(f"Found {len(contours)} total contours, {len(significant)} significant (area > {min_area}px)")
    return significant

def main():
    parser = argparse.ArgumentParser(description="Preprocess an origami diagram image")
    parser.add_argument("--input", required=True, help="Path to input image")
    parser.add_argument("--output", required=True, help="Path to save processed image")
    parser.add_argument("--canny-low", type=int, default=50)
    parser.add_argument("--canny-high", type=int, default=150)
    args = parser.parse_args()

    img = load_image(args.input)
    results = preprocess(img, canny_low=args.canny_low, canny_high=args.canny_high)
    contours = find_contours(results["edges"])
    save_processed(results["edges"], args.output)
    print(f"Original shape: {img.shape}")
    print(f"Done.")

if __name__ == "__main__":
    main()