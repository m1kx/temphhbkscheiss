"""Object and face detection for the Pi camera stream.

Face detection: OpenCV Haar cascades (built-in, no extra downloads).
Object detection: YOLOv4-tiny on COCO (auto-downloaded ~23 MB on first run).
"""

import os
import urllib.request

import cv2
import numpy as np

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

_YOLO_WEIGHTS_URL = (
    "https://github.com/AlexeyAB/darknet/releases/download/yolov4/yolov4-tiny.weights"
)
_YOLO_CFG_URL = (
    "https://raw.githubusercontent.com/AlexeyAB/darknet/master/cfg/yolov4-tiny.cfg"
)
_COCO_NAMES_URL = (
    "https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names"
)

# BGR colours matching the dashboard accent palette
_FACE_COLOR = (255, 224, 74)  # cyan (#4ae0ff)
_PALETTE = [
    (128, 222, 74),   # green
    (36, 191, 251),   # amber
    (250, 139, 167),  # purple
    (113, 113, 248),  # red
    (250, 165, 96),   # blue
    (153, 211, 52),   # emerald
    (60, 146, 251),   # orange
    (249, 121, 232),  # fuchsia
    (53, 230, 163),   # lime
    (250, 200, 130),  # sky
]


def _download(url, dest):
    """Download a file if it doesn't already exist."""
    if os.path.exists(dest):
        return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    print(f"  Downloading {os.path.basename(dest)} ...")
    urllib.request.urlretrieve(url, dest)
    print(f"  Done: {os.path.basename(dest)}")


class FaceDetector:
    """Haar-cascade frontal-face detector (ships with OpenCV)."""

    def __init__(self):
        path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self._cascade = cv2.CascadeClassifier(path)

    def detect(self, frame_bgr):
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
        rects = self._cascade.detectMultiScale(
            gray, scaleFactor=1.15, minNeighbors=5, minSize=(40, 40),
        )
        return [
            {
                "label": "Face",
                "confidence": 1.0,
                "box": (int(x), int(y), int(x + w), int(y + h)),
                "color": _FACE_COLOR,
            }
            for (x, y, w, h) in rects
        ]


class ObjectDetector:
    """YOLOv4-tiny object detector (80 COCO classes).

    Model files are auto-downloaded to ./models/ on first instantiation.
    """

    def __init__(self, conf_threshold=0.45, nms_threshold=0.4):
        self._conf = conf_threshold
        self._nms = nms_threshold
        self._net = None
        self._labels = []
        self._out_layers = []
        self._load()

    def _load(self):
        weights = os.path.join(MODELS_DIR, "yolov4-tiny.weights")
        cfg = os.path.join(MODELS_DIR, "yolov4-tiny.cfg")
        names = os.path.join(MODELS_DIR, "coco.names")

        print("Loading YOLOv4-tiny model ...")
        _download(_YOLO_WEIGHTS_URL, weights)
        _download(_YOLO_CFG_URL, cfg)
        _download(_COCO_NAMES_URL, names)

        self._net = cv2.dnn.readNetFromDarknet(cfg, weights)
        self._net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        self._net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
        self._out_layers = self._net.getUnconnectedOutLayersNames()

        with open(names) as f:
            self._labels = [line.strip() for line in f if line.strip()]
        print(f"  Model ready — {len(self._labels)} COCO classes")

    def detect(self, frame_bgr):
        h, w = frame_bgr.shape[:2]
        blob = cv2.dnn.blobFromImage(
            frame_bgr, 1 / 255.0, (416, 416), swapRB=True, crop=False,
        )
        self._net.setInput(blob)
        outputs = self._net.forward(self._out_layers)

        boxes, confs, cids = [], [], []
        for out in outputs:
            for row in out:
                scores = row[5:]
                cid = int(np.argmax(scores))
                conf = float(scores[cid])
                if conf < self._conf:
                    continue
                cx = int(row[0] * w)
                cy = int(row[1] * h)
                bw = int(row[2] * w)
                bh = int(row[3] * h)
                boxes.append([cx - bw // 2, cy - bh // 2, bw, bh])
                confs.append(conf)
                cids.append(cid)

        indices = cv2.dnn.NMSBoxes(boxes, confs, self._conf, self._nms)
        results = []
        if len(indices) > 0:
            for i in indices.flatten():
                x, y, bw, bh = boxes[i]
                cid = cids[i]
                label = self._labels[cid] if cid < len(self._labels) else f"id:{cid}"
                results.append({
                    "label": label,
                    "confidence": confs[i],
                    "box": (x, y, x + bw, y + bh),
                    "color": _PALETTE[cid % len(_PALETTE)],
                })
        return results


def draw_detections(frame_bgr, detections):
    """Overlay bounding boxes with labels onto the frame (in-place)."""
    fh, fw = frame_bgr.shape[:2]

    for det in detections:
        x1, y1, x2, y2 = det["box"]
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(fw - 1, x2), min(fh - 1, y2)
        color = det["color"]

        cv2.rectangle(frame_bgr, (x1, y1), (x2, y2), color, 2)

        # Corner accents for a modern look
        cl = min(18, abs(x2 - x1) // 4, abs(y2 - y1) // 4)
        if cl > 4:
            for cx, cy, dx, dy in [
                (x1, y1, 1, 1), (x2, y1, -1, 1),
                (x1, y2, 1, -1), (x2, y2, -1, -1),
            ]:
                cv2.line(frame_bgr, (cx, cy), (cx + dx * cl, cy), color, 3)
                cv2.line(frame_bgr, (cx, cy), (cx, cy + dy * cl), color, 3)

        # Label text
        conf = det["confidence"]
        text = f"{det['label']} {conf:.0%}" if conf < 1.0 else det["label"]
        (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)

        # Keep label inside the frame
        ly = max(y1, th + 10)
        cv2.rectangle(
            frame_bgr, (x1, ly - th - 8), (x1 + tw + 10, ly), color, -1,
        )
        cv2.putText(
            frame_bgr, text, (x1 + 5, ly - 4),
            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 1, cv2.LINE_AA,
        )
