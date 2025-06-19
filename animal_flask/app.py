from ultralytics import YOLO
import cv2
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

# 加载 YOLO 模型
model = YOLO("models/yolo.pt")

@app.route('/predict', methods=['POST'])
def predict():
    # 获取上传的图片
    image_file = request.files['image']
    image = cv2.imdecode(np.frombuffer(image_file.read(), np.uint8), cv2.IMREAD_COLOR)

    # 运行推理
    results = model(image, conf=0.5)  # confidence threshold 0.5

    # 格式化结果
    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())  # Bounding box coordinates
            confidence = float(box.conf[0])  # Confidence score
            cls_name = model.names[int(box.cls[0])]  # Class name
            detections.append({
                "class": cls_name,
                "confidence": confidence,
                "bbox": [x1, y1, x2, y2]
            })

    return jsonify({"success": True, "detections": detections})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)