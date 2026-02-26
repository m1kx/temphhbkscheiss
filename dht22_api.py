#!/usr/bin/env python3
"""
DHT22 Temperature Sensor REST API for Raspberry Pi 4
Reads temperature from DHT22 sensor on GPIO pin 15 and serves via REST API.
Streams video from a connected Raspberry Pi camera via MJPEG with
optional face/object detection overlays.
"""

import time
import threading

import cv2
import board
import adafruit_dht
from flask import Flask, jsonify, request, Response, send_from_directory
from picamera2 import Picamera2

from detection import FaceDetector, ObjectDetector, draw_detections

# Initialize the DHT22 sensor on GPIO pin 15
# Note: board.D15 corresponds to GPIO 15 on Raspberry Pi
dht_device = adafruit_dht.DHT22(board.D17)

import os

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "frontend", "dist")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")

# --- Camera streaming setup ---

camera = Picamera2()
camera_config = camera.create_video_configuration(
    main={"size": (1280, 720), "format": "RGB888"},
)
camera.configure(camera_config)
camera.start()

# --- Detection setup ---

face_detector = FaceDetector()
try:
    object_detector = ObjectDetector()
except Exception as exc:
    print(f"Warning: object detection unavailable ({exc})")
    object_detector = None

# Shared state — reference swaps are atomic under the GIL
_latest_frame = None   # JPEG bytes (for streaming)
_raw_frame = None      # BGR numpy array (for detection thread)
_latest_detections = []
_detection_state = {"faces": True, "objects": True}

_frame_lock = threading.Lock()


def _camera_capture_loop():
    """Capture frames, overlay detections, encode to JPEG."""
    global _latest_frame, _raw_frame
    while True:
        frame_bgr = camera.capture_array()
        _raw_frame = frame_bgr

        dets = _latest_detections
        if dets:
            output = frame_bgr.copy()
            draw_detections(output, dets)
        else:
            output = frame_bgr

        ok, jpeg = cv2.imencode(".jpg", output, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if ok:
            with _frame_lock:
                _latest_frame = jpeg.tobytes()

        time.sleep(0.03)


def _detection_loop():
    """Run face/object detection on the latest frame in a background thread."""
    global _latest_detections
    while True:
        frame = _raw_frame
        if frame is None:
            time.sleep(0.2)
            continue

        state = _detection_state
        if not state["faces"] and not state["objects"]:
            _latest_detections = []
            time.sleep(0.3)
            continue

        frame = frame.copy()
        dets = []
        if state["faces"]:
            dets.extend(face_detector.detect(frame))
        if state["objects"] and object_detector is not None:
            dets.extend(object_detector.detect(frame))

        _latest_detections = dets
        time.sleep(0.05)


threading.Thread(target=_camera_capture_loop, daemon=True).start()
threading.Thread(target=_detection_loop, daemon=True).start()


def _generate_mjpeg():
    """Yield MJPEG frames for the video stream response."""
    while True:
        with _frame_lock:
            frame = _latest_frame
        if frame is None:
            time.sleep(0.1)
            continue
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
        )
        time.sleep(0.05)


def read_sensor():
    """
    Read temperature and humidity from DHT22 sensor.
    Includes retry logic as DHT sensors can occasionally fail to read.
    """
    max_retries = 5
    retry_delay = 2.0  # DHT22 requires ~2 seconds between reads
    
    for attempt in range(max_retries):
        try:
            temperature_c = dht_device.temperature
            humidity = dht_device.humidity
            
            if temperature_c is not None and humidity is not None:
                temperature_f = temperature_c * 9 / 5 + 32
                return {
                    "success": True,
                    "temperature_celsius": round(temperature_c, 1),
                    "temperature_fahrenheit": round(temperature_f, 1),
                    "humidity_percent": round(humidity, 1),
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                }
        except RuntimeError as e:
            # DHT sensors throw errors fairly often, just retry
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                continue
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }
    
    return {
        "success": False,
        "error": "Failed to read sensor after multiple attempts",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }


@app.route("/")
def index():
    """Serve the React dashboard."""
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/api")
def api_info():
    """API info endpoint."""
    return jsonify({
        "name": "DHT22 Temperature API",
        "endpoints": {
            "/": "Dashboard UI",
            "/api": "This help message",
            "/temperature": "Get current temperature reading",
            "/humidity": "Get current humidity reading",
            "/reading": "Get full sensor reading (temperature + humidity)",
            "/video_feed": "MJPEG video livestream from Pi camera",
            "/snapshot": "Single JPEG snapshot from Pi camera",
            "/detection/status": "Current detection toggle state",
            "/detection/toggle": "POST to toggle face/object detection",
            "/health": "API health check"
        }
    })


@app.route("/temperature")
def get_temperature():
    """Get temperature only."""
    data = read_sensor()
    if data["success"]:
        return jsonify({
            "success": True,
            "temperature_celsius": data["temperature_celsius"],
            "temperature_fahrenheit": data["temperature_fahrenheit"],
            "timestamp": data["timestamp"]
        })
    return jsonify(data), 500


@app.route("/humidity")
def get_humidity():
    """Get humidity only."""
    data = read_sensor()
    if data["success"]:
        return jsonify({
            "success": True,
            "humidity_percent": data["humidity_percent"],
            "timestamp": data["timestamp"]
        })
    return jsonify(data), 500


@app.route("/reading")
def get_full_reading():
    """Get complete sensor reading."""
    data = read_sensor()
    if data["success"]:
        return jsonify(data)
    return jsonify(data), 500


@app.route("/video_feed")
def video_feed():
    """MJPEG video stream from the Raspberry Pi camera."""
    return Response(
        _generate_mjpeg(),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


@app.route("/snapshot")
def snapshot():
    """Single JPEG snapshot from the camera."""
    with _frame_lock:
        frame = _latest_frame
    if frame is None:
        return jsonify({"error": "Camera not ready"}), 503
    return Response(frame, mimetype="image/jpeg")


@app.route("/detection/status")
def detection_status():
    """Current detection toggle state."""
    return jsonify(_detection_state)


@app.route("/detection/toggle", methods=["POST"])
def detection_toggle():
    """Toggle face and/or object detection on or off."""
    global _detection_state
    data = request.get_json(force=True)
    new = dict(_detection_state)
    if "faces" in data:
        new["faces"] = bool(data["faces"])
    if "objects" in data:
        new["objects"] = bool(data["objects"])
    _detection_state = new
    return jsonify(new)


@app.route("/health")
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })


if __name__ == "__main__":
    print("Starting DHT22 Temperature API Server...")
    print("DHT22 sensor configured on GPIO pin 15")
    print("Pi Camera streaming enabled (1280x720) with detection")
    print("Dashboard available at http://<raspberry-pi-ip>:5000")
    print("\nEndpoints:")
    print("  GET  /                  - Dashboard UI")
    print("  GET  /api               - API info")
    print("  GET  /temperature       - Temperature reading")
    print("  GET  /humidity          - Humidity reading")
    print("  GET  /reading           - Full sensor reading")
    print("  GET  /video_feed        - MJPEG video livestream")
    print("  GET  /snapshot          - Camera snapshot (JPEG)")
    print("  GET  /detection/status  - Detection toggle state")
    print("  POST /detection/toggle  - Toggle face/object detection")
    print("  GET  /health            - Health check")
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        app.run(host="0.0.0.0", port=5000, debug=False)
    finally:
        camera.stop()
        dht_device.exit()

