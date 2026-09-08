// app.js
console.log("📊 Network Packet Analyzer Dashboard Loaded");

// ==================== DOM Elements ====================
const startButton = document.getElementById("start-btn");
const stopButton = document.getElementById("stop-btn");
const clearButton = document.getElementById("clear-btn");
const packetCounter = document.getElementById("packet-count");
const packetTotal = document.getElementById("packet-total");
const packetTableBody = document.getElementById("packet-table-body");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const filterInput = document.getElementById("filter-input");
const clockDisplay = document.getElementById("clock");

const totalPackets = document.getElementById("total-packets");
const protocolCount = document.getElementById("protocol-count");
const rateCount = document.getElementById("rate-count");
const alertCount = document.getElementById("alert-count");
const hostCount = document.getElementById("host-count");
const dataCount = document.getElementById("data-count");

const topHostsDiv = document.getElementById("top-hosts");
const alertListDiv = document.getElementById("alert-list");

// ==================== State ====================
let isCapturing = false;
let updateInterval = null;
let previousPacketCount = 0;
let currentRate = 0;
let totalBytes = 0;
let alertMessages = [];
let hostMap = new Map();
let packetHistory = [];

// ==================== Charts ====================
const protocolCtx = document.getElementById('protocolChart').getContext('2d');
const rateCtx = document.getElementById('rateChart').getContext('2d');
const activityCtx = document.getElementById('activityChart').getContext('2d');

// Protocol Distribution Chart (Pie)
const protocolChart = new Chart(protocolCtx, {
    type: 'doughnut',
    data: {
        labels: ['TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP', 'DNS', 'OTHER'],
        datasets: [{
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: [
                '#56e0c9', '#ffb454', '#6fd48a', '#6ea8fe',
                '#ff6b6b', '#b48cff', '#64758c'
            ],
            borderColor: '#10151d',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#8fa2ba', font: { size: 9 }, padding: 6, boxWidth: 10 }
            }
        },
        cutout: '65%'
    }
});

// Packet Rate Chart (Line)
const rateChart = new Chart(rateCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Packets/sec',
            data: [],
            borderColor: '#ffb454',
            backgroundColor: 'rgba(255, 180, 84, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: '#ffb454'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: { display: false },
            y: { 
                display: true, 
                grid: { color: 'rgba(28,37,49,0.6)' }, 
                ticks: { color: '#64758c', font: { size: 8 } },
                beginAtZero: true
            }
        }
    }
});

// Activity Chart (Bar)
const activityChart = new Chart(activityCtx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Packets',
            data: [],
            backgroundColor: 'rgba(86, 224, 201, 0.6)',
            borderColor: '#56e0c9',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { display: false },
            y: { 
                display: true, 
                grid: { color: 'rgba(28,37,49,0.6)' }, 
                ticks: { color: '#64758c', font: { size: 8 } },
                beginAtZero: true
            }
        }
    }
});

// ==================== Helper Functions ====================
function updateClock() {
    const now = new Date();
    clockDisplay.textContent = now.toTimeString().split(' ')[0];
}
updateClock();
setInterval(updateClock, 1000);

function getProtocolClass(protocol) {
    const classes = {
        'TCP': 'protocol-tcp',
        'UDP': 'protocol-udp',
        'HTTP': 'protocol-http',
        'HTTPS': 'protocol-https',
        'ICMP': 'protocol-icmp',
        'DNS': 'protocol-dns',
        'OTHER': 'protocol-other'
    };
    return classes[protocol] || 'protocol-other';
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
}

function getRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// ==================== API Calls ====================
async function startCapture() {
    try {
        const response = await fetch('/start_capture', { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
            isCapturing = true;
            startButton.disabled = true;
            stopButton.disabled = false;
            statusDot.className = 'status-dot active';
            statusText.textContent = 'Capturing...';
            statusText.style.color = '#48bb78';
            
            // Start auto-refresh
            if (updateInterval) clearInterval(updateInterval);
            updateInterval = setInterval(fetchData, 1000);
            
            console.log("📡 Capture started");
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error starting capture:', error);
        alert('Failed to start capture');
    }
}

async function stopCapture() {
    try {
        const response = await fetch('/stop_capture', { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
            isCapturing = false;
            startButton.disabled = false;
            stopButton.disabled = true;
            statusDot.className = 'status-dot';
            statusText.textContent = 'Stopped';
            statusText.style.color = '#fc8181';
            
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
            
            console.log("⏹️ Capture stopped");
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error stopping capture:', error);
        alert('Failed to stop capture');
    }
}

async function fetchData() {
    try {
        // Fetch packet count
        const countResponse = await fetch('/packet_count');
        const countData = await countResponse.json();
        const count = countData.count || 0;
        
        // Fetch statistics
        const statsResponse = await fetch('/statistics');
        const stats = await statsResponse.json();
        
        // Fetch packets
        const packetsResponse = await fetch('/packets');
        const packets = await packetsResponse.json();
        
        updateUI(count, stats, packets);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function clearAll() {
    if (isCapturing) {
        if (!confirm('Stop capture and clear all data?')) return;
        await stopCapture();
    }
    
    // Clear local data
    totalBytes = 0;
    alertMessages = [];
    hostMap = new Map();
    packetHistory = [];
    
    // Reset UI
    packetCounter.textContent = '0';
    packetTotal.textContent = '0 packets';
    totalPackets.textContent = '0';
    protocolCount.textContent = '0';
    rateCount.textContent = '0';
    alertCount.textContent = '0';
    hostCount.textContent = '0';
    dataCount.textContent = '0 B';
    previousPacketCount = 0;
    currentRate = 0;
    
    packetTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-muted py-4">
                <i class="fas fa-inbox fa-2x d-block mb-2"></i>
                No packets captured
            </td>
        </tr>
    `;
    
    topHostsDiv.innerHTML = `
        <div class="text-center text-muted py-3">
            <i class="fas fa-spinner fa-spin"></i> Waiting for data...
        </div>
    `;
    
    alertListDiv.innerHTML = `
        <div class="text-center text-muted py-3">
            <i class="fas fa-shield-alt"></i> No alerts
        </div>
    `;
    
    // Reset charts
    protocolChart.data.datasets[0].data = [0, 0, 0, 0, 0, 0, 0];
    protocolChart.update();
    rateChart.data.labels = [];
    rateChart.data.datasets[0].data = [];
    rateChart.update();
    activityChart.data.labels = [];
    activityChart.data.datasets[0].data = [];
    activityChart.update();
    
    if (!isCapturing) {
        statusDot.className = 'status-dot';
        statusText.textContent = 'Ready';
        statusText.style.color = '#e0e6ed';
        startButton.disabled = false;
        stopButton.disabled = true;
    }
    
    console.log("🧹 All data cleared");
}

// ==================== UI Update Functions ====================
function updateUI(count, stats, packets) {
    // Update packet counter
    packetCounter.textContent = count;
    totalPackets.textContent = count;
    packetTotal.textContent = `${count} packets`;
    
    // Calculate rate
    const rate = count - previousPacketCount;
    currentRate = rate > 0 ? rate : 0;
    rateCount.textContent = currentRate;
    previousPacketCount = count;
    
    // Update rate chart
    const now = new Date().toLocaleTimeString();
    rateChart.data.labels.push(now);
    rateChart.data.datasets[0].data.push(currentRate);
    if (rateChart.data.labels.length > 20) {
        rateChart.data.labels.shift();
        rateChart.data.datasets[0].data.shift();
    }
    rateChart.update();
    
    // Update protocol chart
    const protocolLabels = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'ICMP', 'DNS', 'OTHER'];
    const protocolData = protocolLabels.map(p => stats[p] || 0);
    protocolChart.data.datasets[0].data = protocolData;
    protocolChart.update();
    
    // Count active protocols
    const activeProtocols = protocolData.filter(v => v > 0).length;
    protocolCount.textContent = activeProtocols;
    
    // Update packets table
    if (packets && packets.length > 0) {
        updatePacketTable(packets);
        updateHosts(packets);
        updateActivityChart(packets);
    }
    
    // Update total data
    if (packets && packets.length > 0) {
        const totalSize = packets.reduce((sum, p) => sum + (p.length || 0), 0);
        totalBytes = totalSize;
        dataCount.textContent = formatBytes(totalSize);
    }
}

function updatePacketTable(packets) {
    const filter = filterInput.value.toLowerCase().trim();
    
    // Remove empty state
    const emptyRow = packetTableBody.querySelector('td[colspan="6"]');
    if (emptyRow) packetTableBody.innerHTML = '';
    
    // Clear existing rows
    packetTableBody.innerHTML = '';
    
    let visibleCount = 0;
    const maxDisplay = 100;
    
    packets.slice(0, maxDisplay).forEach((packet, index) => {
        const row = document.createElement('tr');
        const protocol = packet.protocol || 'OTHER';
        const source = packet.source_ip || '-';
        const dest = packet.destination_ip || '-';
        const size = packet.length || 0;
        const time = packet.timestamp || new Date().toLocaleTimeString();
        
        const rowText = `${protocol} ${source} ${dest}`.toLowerCase();
        if (filter && !rowText.includes(filter)) {
            row.style.display = 'none';
        } else {
            visibleCount++;
        }
        
        row.className = 'packet-new';
        row.innerHTML = `
            <td><span class="text-muted">#${packets.length - index}</span></td>
            <td><span class="text-light">${time}</span></td>
            <td><span class="protocol-badge ${getProtocolClass(protocol)}">${protocol}</span></td>
            <td><span class="text-info">${source}</span></td>
            <td><span class="text-warning">${dest}</span></td>
            <td><span class="text-light">${size} B</span></td>
        `;
        
        packetTableBody.appendChild(row);
    });
    
    // Update packet total with filter info
    if (filter) {
        packetTotal.textContent = `${visibleCount} / ${packets.length} packets`;
    } else {
        packetTotal.textContent = `${packets.length} packets`;
    }
}

function updateHosts(packets) {
    hostMap = new Map();
    
    packets.forEach(packet => {
        const src = packet.source_ip || '-';
        const dst = packet.destination_ip || '-';
        
        if (src !== '-') {
            hostMap.set(src, (hostMap.get(src) || 0) + 1);
        }
        if (dst !== '-') {
            hostMap.set(dst, (hostMap.get(dst) || 0) + 1);
        }
    });
    
    const sorted = Array.from(hostMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    hostCount.textContent = hostMap.size;
    
    if (sorted.length === 0) {
        topHostsDiv.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="fas fa-spinner fa-spin"></i> Waiting for data...
            </div>
        `;
        return;
    }
    
    const maxCount = sorted[0][1];
    topHostsDiv.innerHTML = sorted.map(([host, count]) => `
        <div class="host-item">
            <div>
                <div class="host-name">${host}</div>
                <div class="host-bar" style="width: ${(count / maxCount * 100)}%"></div>
            </div>
            <div class="host-count">${count}</div>
        </div>
    `).join('');
}

function updateActivityChart(packets) {
    // Show last 15 intervals
    const now = new Date().toLocaleTimeString();
    const count = packets.length || 0;
    
    activityChart.data.labels.push(now);
    activityChart.data.datasets[0].data.push(count);
    
    if (activityChart.data.labels.length > 15) {
        activityChart.data.labels.shift();
        activityChart.data.datasets[0].data.shift();
    }
    activityChart.update();
}

// ==================== Event Listeners ====================
startButton.addEventListener("click", startCapture);
stopButton.addEventListener("click", stopCapture);
clearButton.addEventListener("click", clearAll);

filterInput.addEventListener("input", () => {
    // Re-filter table
    fetchData();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); startCapture(); }
    if (e.ctrlKey && e.key === 'e') { e.preventDefault(); stopCapture(); }
    if (e.ctrlKey && e.key === 'c' && !e.shiftKey) { e.preventDefault(); clearAll(); }
});

// ==================== Initial Setup ====================
stopButton.disabled = true;

// Initial data fetch
fetchData();

console.log("✅ Dashboard ready");
console.log("⌨️ Shortcuts: Ctrl+S (Start) | Ctrl+E (Stop) | Ctrl+C (Clear)");