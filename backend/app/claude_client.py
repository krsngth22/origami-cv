import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv(override=False)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def detections_to_instructions(detections: list[dict], image_shape: tuple) -> dict:
    height, width = image_shape[:2]

    detection_text = ""
    for i, d in enumerate(detections):
        x1, y1, x2, y2 = d["bbox"]
        cx = (x1 + x2) / 2
        cy = (y1 + y2) / 2
        w = x2 - x1
        h = y2 - y1

        h_pos = "left" if cx < width/3 else "center" if cx < 2*width/3 else "right"
        v_pos = "top" if cy < height/3 else "middle" if cy < 2*height/3 else "bottom"

        detection_text += f"{i+1}. {d['cls']} (confidence: {d['confidence']:.2f}) "
        detection_text += f"at {h_pos}-{v_pos} of image, "
        detection_text += f"size: {w:.0f}x{h:.0f}px\n"

    prompt = f"""You are an expert origami instructor. I have analyzed an origami diagram using computer vision and detected the following symbols:

{detection_text}

Based on these detected symbols, generate clear step-by-step folding instructions for a beginner.

For each detected arrow or fold symbol, provide:
1. A plain-English instruction (what to do)
2. The fold type (valley fold, mountain fold, fold and unfold, etc.)
3. A brief explanation of why this step is done

Return your response as a JSON object with this exact structure:
{{
  "steps": [
    {{
      "step_number": 1,
      "instruction": "plain English instruction here",
      "fold_type": "valley-fold",
      "explanation": "brief explanation",
      "position": "description of where on the paper"
    }}
  ],
  "difficulty": "beginner/intermediate/advanced",
  "estimated_steps": number,
  "notes": "any general notes about this diagram"
}}

Return only valid JSON, no other text."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )

    import json
    response_text = message.content[0].text
    response_text = response_text.strip()
    if response_text.startswith("```"):
        response_text = response_text.split("```")[1]
        if response_text.startswith("json"):
            response_text = response_text[4:]
    response_text = response_text.strip()
    instructions = json.loads(response_text)
    return instructions


def test_connection():
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=100,
        messages=[{"role": "user", "content": "Say 'Claude API connected successfully' and nothing else."}]
    )
    return message.content[0].text


if __name__ == "__main__":
    print("Testing Claude API connection...")
    result = test_connection()
    print(result)
