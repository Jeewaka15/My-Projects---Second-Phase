"""
DNS Service

Responsible for performing DNS lookups for various
record types using dnspython.
"""

import dns.resolver

from config import DEFAULT_TIMEOUT, DEFAULT_LIFETIME


class DNSService:
    """
    Service responsible for DNS record lookups.
    """

    def __init__(self):
        """
        Configure the DNS resolver.
        """

        self.resolver = dns.resolver.Resolver()

        self.resolver.timeout = DEFAULT_TIMEOUT

        self.resolver.lifetime = DEFAULT_LIFETIME

    # --------------------------------------------------

    def query(self, domain: str, record_type: str) -> list:
        """
        Perform a DNS query.

        Parameters
        ----------
        domain : str
            Domain name.

        record_type : str
            DNS record type.

        Returns
        -------
        list
            List of DNS records.
        """

        records = []

        try:

            answers = self.resolver.resolve(domain, record_type)

            for answer in answers:

                records.append(answer.to_text())

        except dns.resolver.NoAnswer:

            pass

        except dns.resolver.NXDOMAIN:

            pass

        except dns.resolver.NoNameservers:

            pass

        except dns.exception.Timeout:

            pass

        except Exception:

            pass

        return records

    # --------------------------------------------------

    def get_a_records(self, domain: str):

        return self.query(domain, "A")

    # --------------------------------------------------

    def get_aaaa_records(self, domain: str):

        return self.query(domain, "AAAA")

    # --------------------------------------------------

    def get_mx_records(self, domain: str):

        return self.query(domain, "MX")

    # --------------------------------------------------

    def get_ns_records(self, domain: str):

        return self.query(domain, "NS")

    # --------------------------------------------------

    def get_txt_records(self, domain: str):

        return self.query(domain, "TXT")

    # --------------------------------------------------

    def get_cname_records(self, domain: str):

        return self.query(domain, "CNAME")

    # --------------------------------------------------

    def get_soa_records(self, domain: str):

        return self.query(domain, "SOA")

    # --------------------------------------------------

    def get_all_records(self, domain: str) -> dict:
        """
        Retrieve all supported DNS records.
        """

        return {

            "A": self.get_a_records(domain),

            "AAAA": self.get_aaaa_records(domain),

            "MX": self.get_mx_records(domain),

            "NS": self.get_ns_records(domain),

            "TXT": self.get_txt_records(domain),

            "CNAME": self.get_cname_records(domain),

            "SOA": self.get_soa_records(domain)

        }