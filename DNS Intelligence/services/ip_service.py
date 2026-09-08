"""
IP Intelligence Service
"""

import socket

from ipwhois import IPWhois


class IPService:

    def lookup(self, domain: str):

        try:

            ip = socket.gethostbyname(domain)

            obj = IPWhois(ip)

            result = obj.lookup_rdap()

            return {

                "ip": ip,

                "asn": result.get("asn"),

                "asn_description": result.get("asn_description"),

                "network": result.get("network", {})

            }

        except Exception as e:

            return {

                "error": str(e)

            }