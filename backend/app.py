from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import numpy as np
from ultralytics import YOLO
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load the trained model (fallback to base model if best.pt is not found yet)
MODEL_PATH = os.path.join("..", "output_results", "runs", "detect", "helmet_detection", "weights", "best.pt")
if not os.path.exists(MODEL_PATH):
    print("Trained model not found yet, falling back to yolov8n.pt")
    MODEL_PATH = "yolov8n.pt"

try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# In-memory store for recent violations and live frame
recent_violations = []
latest_frame_b64 = None

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "online",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    global latest_frame_b64
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    
    # Read image from request
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    
    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    # Run inference
    results = model.predict(source=img, conf=0.25)
    
    # Save the annotated frame for live surveillance
    import base64
    annotated_img = results[0].plot()
    _, buffer = cv2.imencode('.jpg', annotated_img)
    latest_frame_b64 = base64.b64encode(buffer).decode('utf-8')
    
    detections = []
    has_no_helmet = False
    
    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            cls_name = model.names[cls_id]
            
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            
            detections.append({
                "class": cls_name,
                "confidence": conf,
                "bbox": [x1, y1, x2, y2]
            })
            
            if cls_name == "Without Helmet" or cls_name == "No Helmet" or cls_id == 1:
                has_no_helmet = True

    # If a violation is detected, record it
    if has_no_helmet:
        violation = {
            "id": f"CAM-{np.random.randint(1, 10):02d}",
            "type": "No Helmet",
            "time": datetime.now().strftime("%I:%M %p"),
            "loc": "Intersection Checkpoint",
            "status": "alert",
            "color": "alert"
        }
        recent_violations.insert(0, violation)
        # Keep only the last 50 violations
        if len(recent_violations) > 50:
            recent_violations.pop()

    return jsonify({
        "success": True,
        "detections": detections,
        "violation_recorded": has_no_helmet
    })

@app.route('/api/violations', methods=['GET'])
def get_violations():
    return jsonify({
        "success": True,
        "violations": recent_violations
    })

@app.route('/api/latest_frame', methods=['GET'])
def get_latest_frame():
    return jsonify({
        "success": True,
        "image": latest_frame_b64
    })

if __name__ == '__main__':
    # Make sure backend folder exists
    os.makedirs("uploads", exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)
