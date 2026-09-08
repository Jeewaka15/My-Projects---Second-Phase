"""
Statistics Service

Keeps track of captured packet statistics.
"""

# Total packet counter
packet_count = 0

# Protocol counters
protocol_statistics = {
    "TCP": 0,
    "UDP": 0,
    "ICMP": 0,
    "DNS": 0,
    "OTHER": 0
}


def increment_packet():
    """
    Increment total packet count.
    """
    global packet_count
    packet_count += 1


def increment_protocol(protocol):
    """
    Increment protocol counter.
    """

    if protocol in protocol_statistics:
        protocol_statistics[protocol] += 1
    else:
        protocol_statistics["OTHER"] += 1


def get_packet_count():
    """
    Return total packet count.
    """
    return packet_count


# def get_protocol_statistics():
#     """
#     Return protocol statistics.
#     """
#     return protocol_statistics

def get_protocol_statistics():
    return protocol_statistics.copy()


def reset_statistics():
    """
    Reset all counters.
    """

    global packet_count

    packet_count = 0

    for protocol in protocol_statistics:
        protocol_statistics[protocol] = 0