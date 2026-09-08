"""
Packet Store Service

Stores recently captured packets in memory.
"""

from collections import deque

# Maximum number of packets to keep
MAX_PACKETS = 100

# Circular buffer
packet_store = deque(maxlen=MAX_PACKETS)


def add_packet(packet):
    """
    Add a packet to the beginning of the store.
    """

    packet_store.appendleft(packet)


def get_packets():
    """
    Return all stored packets.
    """

    return list(packet_store)


def clear_packets():
    """
    Remove all packets.
    """

    packet_store.clear()


def packet_count():
    """
    Return number of stored packets.
    """

    return len(packet_store)