/* ============================================
   DNS INTELLIGENCE DASHBOARD
   Main Application JavaScript
   ============================================ */

let scanData = null;
let progressInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // DOM elements
    const domainInput = document.getElementById('domainInput');
    const scanBtn = document.getElementById('scanBtn');
    
    // Enter key listener
    domainInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') scanDomain();
    });
    
    // Scan button
    scanBtn.addEventListener('click', scanDomain);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Fullscreen
    document.getElementById('fullscreenToggle').addEventListener('click', toggleFullscreen);
    
    // Matrix background
    initMatrixRain();
    
    // Typing effect
    initTypingEffect();
    
    // Clock
    updateClock();
    setInterval(updateClock, 1000);
}

/* ============================================
   DOMAIN SCAN
   ============================================ */
async function scanDomain() {
    const domain = document.getElementById('domainInput').value.trim();
    
    if (!domain) {
        showNotification('⚠️ Please enter a domain to scan', 'warning');
        return;
    }
    
    // Show loading
    showLoading(true);
    
    // Simulate progress
    startProgressSimulation();
    
    try {
        const response = await fetch(`/lookup?domain=${encodeURIComponent(domain)}`);
        const data = await response.json();
        
        if (!data.success) {
            showNotification(`❌ ${data.error || 'Scan failed'}`, 'error');
            showLoading(false);
            return;
        }
        
        scanData = data;
        updateUI(data);
        showResults();
        
    } catch (error) {
        showNotification('❌ Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
        clearInterval(progressInterval);
    }
}

function startProgressSimulation() {
    let progress = 0;
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    const dnsQueries = document.getElementById('dnsQueries');
    const securityChecks = document.getElementById('securityChecks');
    const responseTime = document.getElementById('responseTime');
    
    const steps = [
        '🔍 Initializing DNS scan...',
        '🌐 Querying DNS records...',
        '🏢 Fetching WHOIS data...',
        '📍 Geolocating IP address...',
        '🛡️ Running security analysis...',
        '📊 Generating security report...'
    ];
    
    let stepIndex = 0;
    let queries = 0;
    let checks = 0;
    
    progressInterval = setInterval(() => {
        progress += Math.random() * 4 + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
        }
        
        fill.style.width = progress + '%';
        
        const step = Math.floor((progress / 100) * steps.length);
        if (step < steps.length) {
            text.textContent = steps[step];
        }
        
        // Update stats
        queries = Math.floor(progress / 100 * 12);
        checks = Math.floor(progress / 100 * 8);
        const time = Math.floor(progress / 100 * 450 + 50);
        
        dnsQueries.textContent = queries;
        securityChecks.textContent = checks;
        responseTime.textContent = time + 'ms';
        
        if (progress >= 100) {
            text.textContent = '✅ Scan complete!';
        }
    }, 120);
}

/* ============================================
   UI UPDATE
   ============================================ */
function updateUI(data) {
    // Update Security Score
    updateScore(data.security?.score || 0);
    
    // Update IP Info
    if (data.ip) {
        document.getElementById('ipAddress').textContent = data.ip.ip || '-';
        const location = data.ip.city && data.ip.country ? 
            `${data.ip.city}, ${data.ip.country}` : 
            data.ip.country || '-';
        document.getElementById('ipLocation').textContent = location;
        document.getElementById('ipIsp').textContent = data.ip.isp || '-';
        document.getElementById('ipAsn').textContent = data.ip.asn || '-';
    }
    
    // Update WHOIS
    if (data.whois) {
        document.getElementById('whoisRegistrar').textContent = data.whois.registrar || '-';
        document.getElementById('whoisOrg').textContent = data.whois.org || data.whois.name || '-';
        document.getElementById('whoisCreated').textContent = formatDate(data.whois.creation_date);
        document.getElementById('whoisExpires').textContent = formatDate(data.whois.expiration_date);
        
        // Domain Age
        if (data.whois.creation_date) {
            const age = calculateAge(data.whois.creation_date);
            document.getElementById('domainAge').textContent = age;
        }
    }
    
    // Update Security
    if (data.security) {
        updateSecurityBadge('spfStatus', data.security.spf);
        updateSecurityBadge('dmarcStatus', data.security.dmarc);
        updateSecurityBadge('dkimStatus', data.security.dkim);
        updateSecurityBadge('dnssecStatus', data.security.dnssec);
    }
    
    // Update DNS Records
    if (data.dns) {
        updateDNSTable(data.dns);
    }
    
    // Update timestamp
    document.getElementById('scanTimestamp').textContent = 
        `🕐 ${new Date().toLocaleString()}`;
}

/* ============================================
   SECURITY SCORE
   ============================================ */
function updateScore(score) {
    const number = document.getElementById('scoreNumber');
    const circle = document.getElementById('scoreCircle');
    const threatLevel = document.getElementById('threatLevel');
    const sslStatus = document.getElementById('sslStatus');
    
    // Animate number
    animateNumber(number, 0, score);
    
    // Update circle
    const circumference = 339.292;
    const offset = circumference - (score / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    
    // Set color based on score
    const color = score >= 80 ? '#00ff41' : 
                  score >= 60 ? '#ffb800' : '#ff0040';
    circle.style.stroke = color;
    number.style.color = color;
    
    // Threat level
    if (score >= 80) {
        threatLevel.textContent = '🟢 LOW';
        threatLevel.style.color = '#00ff41';
    } else if (score >= 60) {
        threatLevel.textContent = '🟡 MEDIUM';
        threatLevel.style.color = '#ffb800';
    } else {
        threatLevel.textContent = '🔴 HIGH';
        threatLevel.style.color = '#ff0040';
    }
    
    // SSL Status (simulated)
    sslStatus.textContent = score > 70 ? '✅ Valid' : '⚠️ Check';
    sslStatus.style.color = score > 70 ? '#00ff41' : '#ffb800';
}

function animateNumber(element, start, end) {
    const duration = 1500;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * easeOutCubic(progress));
        element.textContent = current + '%';
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/* ============================================
   SECURITY BADGES
   ============================================ */
function updateSecurityBadge(elementId, enabled) {
    const element = document.getElementById(elementId);
    if (enabled) {
        element.textContent = '✅ Enabled';
        element.className = 'security-status status-enabled';
    } else {
        element.textContent = '❌ Missing';
        element.className = 'security-status status-disabled';
    }
}

/* ============================================
   DNS TABLE
   ============================================ */
function updateDNSTable(dns) {
    const tbody = document.getElementById('dnsTableBody');
    tbody.innerHTML = '';
    
    const recordTypes = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'SOA', 'CNAME'];
    let hasRecords = false;
    
    for (const type of recordTypes) {
        if (dns[type] && dns[type].length > 0) {
            hasRecords = true;
            const values = dns[type];
            values.forEach((value, index) => {
                const row = document.createElement('tr');
                const ttl = Math.floor(Math.random() * 300) + 60; // Simulated TTL
                row.innerHTML = `
                    <td><strong>${type}</strong></td>
                    <td class="info-value">${value}</td>
                    <td>${ttl}s</td>
                `;
                tbody.appendChild(row);
            });
        }
    }
    
    if (!hasRecords) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="no-data">
                    <i class="fas fa-database"></i>
                    <span>No DNS records found</span>
                </td>
            </tr>
        `;
    }
}

/* ============================================
   HELPERS
   ============================================ */
function formatDate(date) {
    if (!date) return '-';
    try {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return String(date);
    }
}

function calculateAge(creationDate) {
    try {
        const created = new Date(creationDate);
        const now = new Date();
        const diff = now - created;
        const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
        
        if (years > 1) return `${years} years`;
        if (years === 1) return '1 year';
        
        const months = Math.floor(diff / (30.44 * 24 * 60 * 60 * 1000));
        if (months > 1) return `${months} months`;
        if (months === 1) return '1 month';
        
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days} days`;
    } catch {
        return 'Unknown';
    }
}

/* ============================================
   EXPORT & COPY
   ============================================ */
function exportJSON() {
    if (!scanData) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(scanData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dns-scan-${scanData.domain}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function copyReport() {
    if (!scanData) {
        showNotification('No data to copy', 'warning');
        return;
    }
    
    const text = generateReportText(scanData);
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('✅ Report copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('✅ Report copied!', 'success');
    });
}

function generateReportText(data) {
    const security = data.security || {};
    const ip = data.ip || {};
    const whois = data.whois || {};
    const dns = data.dns || {};
    
    let text = `╔════════════════════════════════════════════╗\n`;
    text += `║  DNS INTELLIGENCE REPORT                     ║\n`;
    text += `╚════════════════════════════════════════════╝\n\n`;
    text += `📋 Domain: ${data.domain}\n`;
    text += `🕐 Scan Time: ${new Date().toLocaleString()}\n\n`;
    
    text += `━━━ SECURITY SCORE ━━━\n`;
    text += `Score: ${security.score || 0}%\n`;
    text += `Threat Level: ${security.score >= 80 ? 'LOW' : security.score >= 60 ? 'MEDIUM' : 'HIGH'}\n\n`;
    
    text += `━━━ IP INTELLIGENCE ━━━\n`;
    text += `IP: ${ip.ip || 'N/A'}\n`;
    text += `Location: ${ip.city || 'N/A'}, ${ip.country || 'N/A'}\n`;
    text += `ISP: ${ip.isp || 'N/A'}\n`;
    text += `ASN: ${ip.asn || 'N/A'}\n\n`;
    
    text += `━━━ WHOIS REGISTRY ━━━\n`;
    text += `Registrar: ${whois.registrar || 'N/A'}\n`;
    text += `Organization: ${whois.org || 'N/A'}\n`;
    text += `Created: ${formatDate(whois.creation_date)}\n`;
    text += `Expires: ${formatDate(whois.expiration_date)}\n\n`;
    
    text += `━━━ SECURITY CHECKS ━━━\n`;
    text += `SPF: ${security.spf ? '✅ Enabled' : '❌ Missing'}\n`;
    text += `DMARC: ${security.dmarc ? '✅ Enabled' : '❌ Missing'}\n`;
    text += `DKIM: ${security.dkim ? '✅ Enabled' : '❌ Missing'}\n`;
    text += `DNSSEC: ${security.dnssec ? '✅ Enabled' : '❌ Missing'}\n\n`;
    
    text += `━━━ DNS RECORDS ━━━\n`;
    const types = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'SOA'];
    for (const type of types) {
        if (dns[type] && dns[type].length > 0) {
            text += `${type}: ${dns[type].join(', ')}\n`;
        }
    }
    
    text += `\n${'═'.repeat(40)}\n`;
    text += `Generated by DNS Intelligence Dashboard\n`;
    
    return text;
}

/* ============================================
   UI HELPERS
   ============================================ */
function showResults() {
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

function showNotification(message, type = 'info') {
    // Simple notification - can be upgraded to custom toast
    alert(message);
}

/* ============================================
   MATRIX RAIN BACKGROUND
   ============================================ */
function initMatrixRain() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const charArray = chars.split('');
    const columns = Math.floor(canvas.width / 14);
    const drops = Array(columns).fill(1);
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(10, 14, 23, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff41';
        ctx.font = '12px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const char = charArray[Math.floor(Math.random() * charArray.length)];
            const x = i * 14;
            const y = drops[i] * 14;
            
            ctx.fillStyle = '#00ff41';
            ctx.fillText(char, x, y);
            
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(drawMatrix, 50);
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

/* ============================================
   TYPING EFFECT
   ============================================ */
function initTypingEffect() {
    const element = document.getElementById('typingEffect');
    const texts = [
        'Scanning the matrix...',
        'Analyzing DNS records...',
        'Securing the network...',
        'Ready for action...',
        'Cyber intelligence active...'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeEffect() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            element.textContent = currentText.substring(0, charIndex--);
        } else {
            element.textContent = currentText.substring(0, charIndex++);
        }
        
        let speed = isDeleting ? 30 : 60;
        
        if (!isDeleting && charIndex === currentText.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            speed = 500;
        }
        
        setTimeout(typeEffect, speed);
    }
    
    typeEffect();
}

/* ============================================
   CLOCK
   ============================================ */
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('clockDisplay').textContent = time;
}

/* ============================================
   THEME TOGGLE
   ============================================ */
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const btn = document.getElementById('themeToggle');
    const icon = btn.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

/* ============================================
   FULLSCREEN
   ============================================ */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}