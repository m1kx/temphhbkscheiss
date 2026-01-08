# DHT22 Temperature Sensor REST API

A simple REST API for Raspberry Pi 4 that reads temperature and humidity from a DHT22 sensor on GPIO pin 15.

## Hardware Setup

### Wiring the DHT22 to Raspberry Pi 4

| DHT22 Pin | Raspberry Pi Pin |
|-----------|------------------|
| VCC (+)   | 3.3V (Pin 1)     |
| DATA      | GPIO 15 (Pin 10) |
| GND (-)   | Ground (Pin 6)   |

**Note:** Add a 10kΩ pull-up resistor between the DATA pin and VCC for more reliable readings.

## Installation

1. **Install system dependencies:**
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv libgpiod2
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Run the API server:

```bash
python3 dht22_api.py
```

The server will start on port 5000 and be accessible from any device on your network.

### Run as a service (optional):

Create a systemd service file `/etc/systemd/system/dht22-api.service`:

```ini
[Unit]
Description=DHT22 Temperature API
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/piprojekt
ExecStart=/home/pi/piprojekt/venv/bin/python /home/pi/piprojekt/dht22_api.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dht22-api
sudo systemctl start dht22-api
```

## API Endpoints

| Endpoint       | Method | Description                          |
|----------------|--------|--------------------------------------|
| `/`            | GET    | API information and available endpoints |
| `/temperature` | GET    | Get current temperature (°C and °F)  |
| `/humidity`    | GET    | Get current humidity (%)             |
| `/reading`     | GET    | Get full sensor reading              |
| `/health`      | GET    | Health check                         |

## Example Responses

### GET /temperature
```json
{
  "success": true,
  "temperature_celsius": 23.5,
  "temperature_fahrenheit": 74.3,
  "timestamp": "2026-01-08 14:30:00"
}
```

### GET /reading
```json
{
  "success": true,
  "temperature_celsius": 23.5,
  "temperature_fahrenheit": 74.3,
  "humidity_percent": 45.2,
  "timestamp": "2026-01-08 14:30:00"
}
```

## Troubleshooting

- **Sensor read failures:** DHT22 sensors can occasionally fail to read. The API includes retry logic to handle this.
- **Permission errors:** Make sure your user has GPIO access. Add your user to the `gpio` group: `sudo usermod -aG gpio $USER`
- **libgpiod errors:** Ensure `libgpiod2` is installed: `sudo apt install libgpiod2`

