"""
Security Checks
"""

import dns.resolver


class SecurityService:

    def check_spf(self, domain):

        try:

            answers = dns.resolver.resolve(domain, "TXT")

            for record in answers:

                value = record.to_text()

                if "v=spf1" in value:

                    return True

        except Exception:

            pass

        return False

    # ------------------------

    def check_dmarc(self, domain):

        try:

            answers = dns.resolver.resolve(

                "_dmarc." + domain,

                "TXT"

            )

            return len(answers) > 0

        except Exception:

            return False

    # ------------------------

    def check_dnssec(self, domain):

        """
        Placeholder for DNSSEC validation.
        """

        return False

    # ------------------------

    def scan(self, domain):

        return {

            "SPF": self.check_spf(domain),

            "DMARC": self.check_dmarc(domain),

            "DNSSEC": self.check_dnssec(domain)

        }