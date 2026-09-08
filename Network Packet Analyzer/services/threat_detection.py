# services/threat_detection.py
"""
Threat Detection Service
Identifies suspicious network patterns
"""

from collections import defaultdict

class ThreatDetector:
    def __init__(self):
        self.threats = {
            'port_scans': 0,
            'ddos_attempts': 0,
            'suspicious_ips': set(),
            'malformed_packets': 0
        }
    
    def analyze_packets(self, packets):
        """
        Analyze packet list for threats
        """
        ip_frequency = defaultdict(int)
        port_frequency = defaultdict(int)
        protocol_frequency = defaultdict(int)
        
        threats = {
            'port_scans': 0,
            'ddos_attempts': 0,
            'suspicious_ips': set(),
            'malformed_packets': 0
        }
        
        for packet in packets:
            src = packet.get('source_ip', '-')
            dst = packet.get('destination_ip', '-')
            protocol = packet.get('protocol', 'OTHER')
            size = packet.get('length', 0)
            
            # Track frequencies
            if src != '-':
                ip_frequency[src] += 1
            if dst != '-':
                ip_frequency[dst] += 1
            
            # Track ports
            sport = packet.get('source_port', '-')
            dport = packet.get('destination_port', '-')
            if sport != '-':
                port_frequency[f"{src}:{sport}"] += 1
            if dport != '-':
                port_frequency[f"{dst}:{dport}"] += 1
            
            # Track protocols
            protocol_frequency[protocol] += 1
            
            # Malformed packets (unusual size)
            if size < 64 or size > 1500:
                threats['malformed_packets'] += 1
        
        # Detect port scanning
        for key, count in port_frequency.items():
            if count > 5:
                ip = key.split(':')[0]
                if ip != '-':
                    threats['suspicious_ips'].add(ip)
                    threats['port_scans'] += 1
        
        # Detect DDoS (high frequency single IP)
        for ip, count in ip_frequency.items():
            if count > 20:
                threats['suspicious_ips'].add(ip)
                threats['ddos_attempts'] += 1
        
        # Detect ICMP flood
        if protocol_frequency.get('ICMP', 0) > 10:
            threats['ddos_attempts'] += 1
        
        # Convert set to list
        threats['suspicious_ips'] = list(threats['suspicious_ips'])
        
        return threats
    
    def get_threat_summary(self):
        """
        Get current threat summary
        """
        return {
            'total_threats': sum([
                self.threats['port_scans'],
                self.threats['ddos_attempts'],
                len(self.threats['suspicious_ips']),
                self.threats['malformed_packets']
            ]),
            **self.threats
        }

# Global instance
threat_detector = ThreatDetector()