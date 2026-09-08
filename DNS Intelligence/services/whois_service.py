"""
WHOIS Service

Responsible for retrieving WHOIS information
for a domain.
"""

import whois


class WhoisService:

    def lookup(self, domain: str):

        try:

            info = whois.whois(domain)

            return {

                "domain": info.domain_name,

                "registrar": info.registrar,

                "creation_date": str(info.creation_date),

                "expiration_date": str(info.expiration_date),

                "updated_date": str(info.updated_date),

                "name_servers": info.name_servers,

                "status": info.status,

                "emails": info.emails

            }

        except Exception as e:

            return {

                "error": str(e)

            }