#!/usr/bin/env python3
"""
DHT22 Temperature Sensor REST API for Raspberry Pi 4
Reads temperature from DHT22 sensor on GPIO pin 15 and serves via REST API.
"""

import time
import board
import adafruit_dht
from flask import Flask, jsonify, render_template

# Initialize the DHT22 sensor on GPIO pin 15
# Note: board.D15 corresponds to GPIO 15 on Raspberry Pi
dht_device = adafruit_dht.DHT22(board.D15)

app = Flask(__name__)


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
    """Serve the dashboard."""
    return render_template("dashboard.html")


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
    print("Dashboard available at http://<raspberry-pi-ip>:5000")
    print("\nEndpoints:")
    print("  GET /            - Dashboard UI")
    print("  GET /api         - API info")
    print("  GET /temperature - Temperature reading")
    print("  GET /humidity    - Humidity reading")
    print("  GET /reading     - Full sensor reading")
    print("  GET /health      - Health check")
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        # Run on all interfaces so it's accessible from other devices
        app.run(host="0.0.0.0", port=5000, debug=False)
    finally:
        dht_device.exit()

