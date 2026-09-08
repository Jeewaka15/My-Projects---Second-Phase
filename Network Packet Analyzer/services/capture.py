from scapy.all import AsyncSniffer

from services.packet_parser import parse_packet
from services.packet_store import add_packet
from services.statistics import (
    increment_packet,
    increment_protocol
)

# Global sniffer object
sniffer = None


def packet_callback(packet):
    """
    Called automatically every time Scapy captures a packet.
    """

    try:
        # Parse packet
        packet_data = parse_packet(packet)

        # Save packet
        add_packet(packet_data)

        # Update counters
        increment_packet()
        increment_protocol(packet_data["protocol"])

        # Debug output
        print(
            f"[{packet_data['protocol']}] "
            f"{packet_data['source_ip']} -> "
            f"{packet_data['destination_ip']}"
        )

    except Exception as error:
        print(f"Packet parsing error: {error}")


def start_capture():
    """
    Start packet capture.
    """

    global sniffer

    # Already running?
    if sniffer is not None and sniffer.running:
        return

    sniffer = AsyncSniffer(
        prn=packet_callback,
        store=False
    )

    sniffer.start()

    print("Packet capture started.")


def stop_capture():
    """
    Stop packet capture.
    """

    global sniffer

    if sniffer is None:
        return

    if sniffer.running:
        sniffer.stop()

    sniffer = None

    print("Packet capture stopped.")