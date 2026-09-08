from flask import Flask, render_template, jsonify

from services.capture import start_capture, stop_capture
from services.packet_store import get_packets
from services.statistics import (
    get_packet_count,
    get_protocol_statistics
)

app = Flask(__name__)


# -------------------------------
# Home Page
# -------------------------------
@app.route("/")
def home():
    return render_template("dashboard.html")


# -------------------------------
# Dashboard Page (New)
# -------------------------------
@app.route("/dashboard")
def dashboard():
    return render_template("index.html")



# -------------------------------
# Start Packet Capture
# -------------------------------
@app.route("/start_capture", methods=["POST"])
def start_capture_route():

    try:
        start_capture()

        return jsonify({
            "success": True,
            "message": "Packet capture started."
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500


# -------------------------------
# Stop Packet Capture
# -------------------------------
@app.route("/stop_capture", methods=["POST"])
def stop_capture_route():

    try:
        stop_capture()

        return jsonify({
            "success": True,
            "message": "Packet capture stopped."
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": str(error)
        }), 500


# -------------------------------
# Packet Counter API
# -------------------------------
@app.route("/packet_count")
def packet_count():

    return jsonify({

        "count": get_packet_count()

    })


# -------------------------------
# Protocol Statistics API
# -------------------------------
@app.route("/statistics")
def statistics():

    return jsonify(

        get_protocol_statistics()

    )


# -------------------------------
# Packet List API
# -------------------------------
@app.route("/packets")
def packets():

    return jsonify(

        get_packets()

    )


# -------------------------------
# Run Flask
# -------------------------------
if __name__ == "__main__":

    app.run(
        debug=True
    )