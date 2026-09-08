"""
DNS Intelligence Dashboard

Main Flask Application
"""

from flask import Flask, jsonify, request, render_template

from config import APP_NAME, SECRET_KEY, DEBUG

from services.dns_service import DNSService
from services.whois_service import WhoisService
from services.ip_service import IPService
from services.security_service import SecurityService


# -----------------------------------------------------
# Flask App Configuration
# -----------------------------------------------------

app = Flask(__name__)

app.config["SECRET_KEY"] = SECRET_KEY

app.config["APP_NAME"] = APP_NAME


# -----------------------------------------------------
# Services
# -----------------------------------------------------

dns_service = DNSService()

whois_service = WhoisService()

ip_service = IPService()

security_service = SecurityService()


# -----------------------------------------------------
# Home - Render Dashboard
# -----------------------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------------------------------
# Health Check
# -----------------------------------------------------

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy"
    })


# -----------------------------------------------------
# Domain Lookup API
# -----------------------------------------------------

@app.route("/lookup", methods=["GET"])
def lookup():
    domain = request.args.get("domain")

    if not domain:
        return jsonify({
            "success": False,
            "error": "Domain parameter is required."
        }), 400

    # DNS Records
    dns_records = dns_service.get_all_records(domain)

    # WHOIS
    whois_info = whois_service.lookup(domain)

    # IP Intelligence
    ip_info = ip_service.lookup(domain)

    # Security Checks
    security = security_service.scan(domain)

    # Final Response
    return jsonify({
        "success": True,
        "domain": domain,
        "dns": dns_records,
        "whois": whois_info,
        "ip": ip_info,
        "security": security
    })


# -----------------------------------------------------
# API Information
# -----------------------------------------------------

@app.route("/api")
def api_info():
    return jsonify({
        "application": APP_NAME,
        "endpoints": {
            "/": "Dashboard UI",
            "/health": "Health Check",
            "/lookup?domain=google.com": "Lookup Domain Information"
        }
    })


# -----------------------------------------------------
# Error Handlers
# -----------------------------------------------------

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found."
    }), 404


@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "error": "Internal Server Error"
    }), 500


# -----------------------------------------------------
# Main
# -----------------------------------------------------

if __name__ == "__main__":
    print("=" * 50)
    print(APP_NAME)
    print("=" * 50)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=DEBUG
    )