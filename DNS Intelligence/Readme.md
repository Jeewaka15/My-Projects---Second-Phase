# 🛰️ DNS Intelligence Dashboard

A Python and Flask-based DNS Intelligence Dashboard developed as part of my **Cybersecurity Foundations – Phase 02** learning journey. This project provides DNS reconnaissance, WHOIS lookups, IP intelligence, and basic security checks through a modern web interface, helping users analyze domain infrastructure and security configurations.

## 🚀 Overview

DNS Intelligence Dashboard is a reconnaissance and information gathering tool that allows users to investigate a domain's DNS records, WHOIS information, IP ownership details, and email security configurations. It demonstrates practical networking and cybersecurity concepts through a clean Flask-based application.


![First Image Description](https://github.com/Jeewaka15/My-Projects---Second-Phase/blob/d6383d287f135e39209e876e93bf31b852f5ab4b/DNS%20Intelligence/DNS%20Intelligence%201.png)

<br><br>

![Second Image Description](https://github.com/Jeewaka15/My-Projects---Second-Phase/blob/d6383d287f135e39209e876e93bf31b852f5ab4b/DNS%20Intelligence/DNS%20Intelligence%202.png)

<br><br>

![Third Image Description](https://github.com/Jeewaka15/My-Projects---Second-Phase/blob/d6383d287f135e39209e876e93bf31b852f5ab4b/DNS%20Intelligence/DNS%20Intelligence%203.png)

<br><br>

![Fourth Image Description](https://github.com/Jeewaka15/My-Projects---Second-Phase/blob/d6383d287f135e39209e876e93bf31b852f5ab4b/DNS%20Intelligence/DNS%20Intelligence%204.png)




## ✨ Features

* Domain DNS lookup
* A, AAAA, MX, NS, TXT, CNAME, and SOA record retrieval
* WHOIS information lookup
* IP address resolution
* ASN (Autonomous System Number) lookup
* RDAP/IP ownership information
* SPF record detection
* DMARC record detection
* DNSSEC status (foundation for future enhancement)
* REST API endpoints
* Modular service-based architecture
* Ready for deployment with Flask

## 🛠️ Technologies Used

### Backend

* Python
* Flask
* dnspython
* python-whois
* ipwhois

### Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap 5 (planned dashboard UI)

## 📂 Project Structure

```text
DNS-Intelligence-Dashboard/
│
├── app.py
├── config.py
├── requirements.txt
│
├── services/
│   ├── dns_service.py
│   ├── whois_service.py
│   ├── ip_service.py
│   └── security_service.py
│
├── templates/
│
├── static/
│
└── README.md
```

## 🔎 Information Collected

### DNS Records

* A
* AAAA
* MX
* NS
* TXT
* CNAME
* SOA

### WHOIS Information

* Registrar
* Creation Date
* Expiration Date
* Updated Date
* Name Servers
* Domain Status

### IP Intelligence

* Public IP Address
* ASN
* ASN Description
* Network Information

### Security Checks

* SPF
* DMARC
* DNSSEC (basic implementation)

## 📚 Cybersecurity Concepts Covered

* DNS Fundamentals
* DNS Resolution
* DNS Record Types
* Domain Reconnaissance
* WHOIS Enumeration
* RDAP
* ASN Lookup
* Email Security (SPF & DMARC)
* Information Gathering
* Service-Oriented Architecture
* Flask REST APIs

## 🎯 Skills Demonstrated

* Python programming
* Flask web development
* REST API development
* Network programming
* DNS analysis
* Information gathering techniques
* Cybersecurity tool development
* Error handling
* Clean project architecture
* Modular code organization

## 🚀 Future Improvements

* Modern SOC-style dashboard
* Security score calculation
* GeoIP location lookup
* Hosting provider detection
* DNSSEC validation
* DKIM detection
* Export reports as JSON/PDF
* Historical scan history
* Dark mode
* Docker support
* Render deployment

## 👨‍💻 Learning Outcome

Building this project strengthened my understanding of networking fundamentals, DNS infrastructure, domain reconnaissance, Python web development, and cybersecurity-focused software engineering. It also improved my ability to design modular applications using a service-based architecture.

---

**Project Series:** Cybersecurity Foundations – Phase 02
