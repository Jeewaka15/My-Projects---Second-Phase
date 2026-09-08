"""
Packet Parser

Responsible for extracting useful information
from captured Scapy packets.
"""

from datetime import datetime

from scapy.layers.inet import IP, TCP, UDP, ICMP
from scapy.layers.dns import DNS


def parse_packet(packet):
    """
    Parse a Scapy packet and return a dictionary
    containing useful information.
    """

    packet_info = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "source_ip": "-",
        "destination_ip": "-",
        "protocol": "OTHER",
        "source_port": "-",
        "destination_port": "-",
        "length": len(packet)
    }

    # -------------------------------
    # IP Layer
    # -------------------------------
    if packet.haslayer(IP):

        packet_info["source_ip"] = packet[IP].src
        packet_info["destination_ip"] = packet[IP].dst

    # -------------------------------
    # DNS
    # -------------------------------
    if packet.haslayer(DNS):

        packet_info["protocol"] = "DNS"

    # -------------------------------
    # TCP
    # -------------------------------
    elif packet.haslayer(TCP):

        packet_info["protocol"] = "TCP"

        packet_info["source_port"] = packet[TCP].sport
        packet_info["destination_port"] = packet[TCP].dport

    # -------------------------------
    # UDP
    # -------------------------------
    elif packet.haslayer(UDP):

        packet_info["protocol"] = "UDP"

        packet_info["source_port"] = packet[UDP].sport
        packet_info["destination_port"] = packet[UDP].dport

    # -------------------------------
    # ICMP
    # -------------------------------
    elif packet.haslayer(ICMP):

        packet_info["protocol"] = "ICMP"

    return packet_info