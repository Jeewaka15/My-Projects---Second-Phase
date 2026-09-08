"""
Configuration File

Stores global application settings.
"""

from pathlib import Path
import os

# -----------------------------------------------------
# Project Information
# -----------------------------------------------------

APP_NAME = "DNS Intelligence Dashboard"

APP_VERSION = "1.0.0"

DEBUG = True


# -----------------------------------------------------
# Flask Configuration
# -----------------------------------------------------

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "change-this-to-a-random-secret-key"
)


# -----------------------------------------------------
# Project Paths
# -----------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = BASE_DIR / "data"

DATA_DIR.mkdir(exist_ok=True)


# -----------------------------------------------------
# Output Files
# -----------------------------------------------------

REPORT_FILE = DATA_DIR / "last_scan.json"


# -----------------------------------------------------
# DNS Configuration
# -----------------------------------------------------

DEFAULT_TIMEOUT = 5

DEFAULT_LIFETIME = 5


# -----------------------------------------------------
# Supported DNS Record Types
# -----------------------------------------------------

SUPPORTED_RECORDS = [

    "A",

    "AAAA",

    "MX",

    "NS",

    "TXT",

    "CNAME",

    "SOA"

]