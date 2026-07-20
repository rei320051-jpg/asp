// ===== Dashboard Page Logic =====
let trendChart, causeChart, fatalityChart, survivalChart;
let earthAnimationId;
let needsRedraw = true;
// ===== Initialize Dashboard =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    initCharts();
    updateDashboard();
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => initEarthCanvas(), { timeout: 1000 });
    } else {
        setTimeout(() => initEarthCanvas(), 200);
    }
    
    document.addEventListener('filtersUpdated', updateDashboard);
    
    document.addEventListener('languageChanged', () => {
        updateDashboard();
    });
});
// ===== World Map Visualization (D3 + Natural Earth GeoJSON) =====
function initEarthCanvas() {
    const canvas = document.getElementById('earthCanvas');
    if (!canvas) return;
    if (typeof d3 === 'undefined' || typeof topojson === 'undefined') return;
    
    const ctx = canvas.getContext('2d');
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');
    let worldGeoJSON = null;
    let projection = null;
    let pathGenerator = null;
    let sweepAngle = 0;
    let mapReady = false;
    let hoveredAccidentChanged = false;
    
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let mouseInCanvas = false;
    let hoveredAccident = null;
    
    let cachedW = 0, cachedH = 0;
    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    canvas.parentElement.appendChild(tooltip);
    
    function getAccidentScreenPos(accident) {
        if (!projection) return null;
        const [x, y] = projection([accident.longitude, accident.latitude]);
        return [x + panX, y + panY];
    }
    
    function findHoveredAccident(sx, sy) {
        const threshold = 15;
        for (const accident of AppState.filteredAccidents) {
            const pos = getAccidentScreenPos(accident);
            if (!pos) continue;
            const [x, y] = pos;
            const dist = Math.sqrt((sx - x) ** 2 + (sy - y) ** 2);
            if (dist < threshold) return accident;
        }
        return null;
    }
    
    function showTooltip(accident, x, y) {
        const isZh = AppState.currentLang === 'zh';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-airline">${accident.airline}</span>
                <span class="tooltip-flight">${accident.flightNumber || '-'}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">${t('tooltip.date')}</span>
                <span class="tooltip-value">${accident.date}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">${t('tooltip.location')}</span>
                <span class="tooltip-value">${accident.location}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">${t('tooltip.aircraft')}</span>
                <span class="tooltip-value">${td(accident.aircraft)}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">${t('tooltip.cause')}</span>
                <span class="tooltip-value">${t('cause.' + accident.cause)}</span>
            </div>
            <div class="tooltip-stats">
                <div class="tooltip-stat danger">
                    <div class="ts-num">${accident.fatalities}</div>
                    <div class="ts-lbl">${t('tooltip.fatalities')}</div>
                </div>
                <div class="tooltip-stat warning">
                    <div class="ts-num">${accident.injured || 0}</div>
                    <div class="ts-lbl">${t('tooltip.injured')}</div>
                </div>
                <div class="tooltip-stat success">
                    <div class="ts-num">${accident.uninjured || 0}</div>
                    <div class="ts-lbl">${t('tooltip.uninjured')}</div>
                </div>
            </div>
        `;
        tooltip.style.display = 'block';
        
        const rect = canvas.getBoundingClientRect();
        const padding = 15;
        let tx = x + padding;
        let ty = y + padding;
        
        if (tx + 320 > rect.width) tx = x - 320 - padding;
        if (ty + tooltip.offsetHeight > rect.height) ty = y - tooltip.offsetHeight - padding;
        
        tooltip.style.left = `${tx}px`;
        tooltip.style.top = `${ty}px`;
    }
    
    function updateZoomIndicator() {
        const indicator = document.querySelector('.map-zoom-indicator');
        if (indicator) {
            indicator.textContent = `${Math.round(zoom * 100)}%`;
        }
    }
    
    function zoomAt(cx, cy, factor) {
        zoom *= factor;
        zoom = Math.max(0.5, Math.min(5, zoom));
        panX = cx - (cx - panX) * factor;
        panY = cy - (cy - panY) * factor;
        updateZoomIndicator();
    }
    
    function resetView() {
        zoom = 1;
        panX = 0;
        panY = 0;
        updateZoomIndicator();
        needsRedraw = true;
    }
    
    d3.json('data/world-110m.json').then(world => {
        worldGeoJSON = topojson.feature(world, world.objects.countries);
        resize();
        mapReady = true;
        
        const skeleton = document.querySelector('.map-skeleton');
        if (skeleton) skeleton.classList.add('hidden');
        
        draw();
    }).catch(error => {
        console.error('Failed to load world map:', error);
    });
    
    function resize() {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        cachedW = rect.width;
        cachedH = rect.height;
        
        canvas.width = cachedW;
        canvas.height = cachedH;
        offscreen.width = cachedW;
        offscreen.height = cachedH;
        
        projection = d3.geoNaturalEarth1()
            .scale(cachedW / Math.PI / 1.5)
            .translate([cachedW / 2, cachedH / 2]);
        
        pathGenerator = d3.geoPath().projection(projection);
        
        renderStaticMap();
        needsRedraw = true;
    }
    
    function renderStaticMap() {
        if (!worldGeoJSON || !pathGenerator) return;
        
        offCtx.clearRect(0, 0, cachedW, cachedH);
        
        const bgGradient = offCtx.createLinearGradient(0, 0, 0, cachedH);
        bgGradient.addColorStop(0, '#1a3a6c');
        bgGradient.addColorStop(0.5, '#2a5a94');
        bgGradient.addColorStop(1, '#1a3a6c');
        offCtx.fillStyle = bgGradient;
        offCtx.fillRect(0, 0, cachedW, cachedH);
        
        const gridStep = 30;
        offCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        offCtx.lineWidth = 1;
        
        for (let x = 0; x <= cachedW; x += gridStep) {
            offCtx.beginPath();
            offCtx.moveTo(x, 0);
            offCtx.lineTo(x, cachedH);
            offCtx.stroke();
        }
        for (let y = 0; y <= cachedH; y += gridStep) {
            offCtx.beginPath();
            offCtx.moveTo(0, y);
            offCtx.lineTo(cachedW, y);
            offCtx.stroke();
        }
        
        offCtx.fillStyle = '#2d5a87';
        offCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        offCtx.lineWidth = 0.5;
        offCtx.beginPath();
        pathGenerator.context(offCtx)(worldGeoJSON);
        offCtx.fill();
        offCtx.stroke();
    }
    
    window.addEventListener('resize', () => {
        resize();
        needsRedraw = true;
    });
    
    function draw() {
        if (isPaused) {
            earthAnimationId = requestAnimationFrame(draw);
            return;
        }
        
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        
        if (w !== cachedW || h !== cachedH) {
            cachedW = w;
            cachedH = h;
            needsRedraw = true;
        }
        
        if (!mapReady) {
            earthAnimationId = requestAnimationFrame(draw);
            return;
        }
        
        if (!needsRedraw && !isDragging && !hoveredAccidentChanged) {
            sweepAngle += 1;
            earthAnimationId = requestAnimationFrame(draw);
            return;
        }
        
        needsRedraw = false;
        hoveredAccidentChanged = false;
        
        ctx.clearRect(0, 0, w, h);
        
        ctx.save();
        ctx.translate(panX, panY);
        ctx.scale(zoom, zoom);
        ctx.drawImage(offscreen, 0, 0, w, h);
        ctx.restore();
        
        const { filteredAccidents } = AppState;
        const len = filteredAccidents.length;
        for (let i = 0; i < len; i++) {
            const accident = filteredAccidents[i];
            const pos = getAccidentScreenPos(accident);
            if (!pos) continue;
            const [x, y] = pos;
            const isHovered = hoveredAccident === accident;
            let size = accident.fatalities > 50 ? 5 : accident.fatalities > 10 ? 3 : 2;
            if (isHovered) size += 2;
            const pulse = (Math.sin(sweepAngle * 0.02 + accident.latitude + accident.longitude) + 1) / 2;
            
            ctx.beginPath();
            ctx.arc(x, y, size * 2 + pulse * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 51, 68, ${0.15 + pulse * 0.25})`;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = accident.fatalities > 50 ? '#ff3344' : '#ffb800';
            ctx.fill();
            
            ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = isHovered ? 2.5 : 1;
            ctx.stroke();
        }
        
        const sweepX = ((sweepAngle * 0.5) % (w + 200)) - 100;
        const sweepGradient = ctx.createLinearGradient(sweepX - 80, 0, sweepX + 80, 0);
        sweepGradient.addColorStop(0, 'rgba(0, 200, 255, 0)');
        sweepGradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.15)');
        sweepGradient.addColorStop(1, 'rgba(0, 200, 255, 0)');
        ctx.fillStyle = sweepGradient;
        ctx.fillRect(0, 0, w, h);
        
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sweepX, 0);
        ctx.lineTo(sweepX, h);
        ctx.stroke();
        
        sweepAngle += 1;
        earthAnimationId = requestAnimationFrame(draw);
    }
    
    let isPaused = false;
    
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        isDragging = true;
        dragStartX = e.clientX - rect.left;
        dragStartY = e.clientY - rect.top;
        canvas.style.cursor = 'grabbing';
        tooltip.style.display = 'none';
        e.preventDefault();
    });
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        mouseInCanvas = true;
        
        if (isDragging) {
            panX += sx - dragStartX;
            panY += sy - dragStartY;
            dragStartX = sx;
            dragStartY = sy;
            tooltip.style.display = 'none';
            if (hoveredAccident !== null) {
                hoveredAccident = null;
                hoveredAccidentChanged = true;
            }
            needsRedraw = true;
        } else {
            const accident = findHoveredAccident(sx, sy);
            if (accident !== hoveredAccident) {
                hoveredAccident = accident;
                hoveredAccidentChanged = true;
            }
            if (accident) {
                showTooltip(accident, sx, sy);
                canvas.style.cursor = 'pointer';
            } else {
                tooltip.style.display = 'none';
                canvas.style.cursor = 'grab';
            }
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        mouseInCanvas = false;
        if (hoveredAccident !== null) {
            hoveredAccident = null;
            hoveredAccidentChanged = true;
        }
        tooltip.style.display = 'none';
        canvas.style.cursor = 'grab';
    });
    
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
        zoomAt(sx, sy, factor);
        needsRedraw = true;
        const accident = findHoveredAccident(sx, sy);
        if (accident !== hoveredAccident) {
            hoveredAccident = accident;
            hoveredAccidentChanged = true;
        }
        if (accident) showTooltip(accident, sx, sy);
        else tooltip.style.display = 'none';
    }, { passive: false });
    
    canvas.addEventListener('dblclick', () => {
        resetView();
    });
    
    // ===== Touch Events for Mobile =====
    let touchStartDist = 0;
    let touchStartZoom = 1;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        if (e.touches.length === 1) {
            isDragging = true;
            dragStartX = e.touches[0].clientX - rect.left;
            dragStartY = e.touches[0].clientY - rect.top;
            tooltip.style.display = 'none';
            if (hoveredAccident !== null) {
                hoveredAccident = null;
                hoveredAccidentChanged = true;
            }
        } else if (e.touches.length === 2) {
            touchStartDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            touchStartZoom = zoom;
        }
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        if (e.touches.length === 1 && isDragging) {
            const sx = e.touches[0].clientX - rect.left;
            const sy = e.touches[0].clientY - rect.top;
            panX += sx - dragStartX;
            panY += sy - dragStartY;
            dragStartX = sx;
            dragStartY = sy;
            needsRedraw = true;
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const factor = dist / touchStartDist;
            zoom = touchStartZoom * factor;
            zoom = Math.max(0.5, Math.min(5, zoom));
            needsRedraw = true;
        }
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        isDragging = false;
        if (e.touches.length === 0) {
            tooltip.style.display = 'none';
        }
    }, { passive: false });
    
    document.getElementById('mapZoomIn')?.addEventListener('click', () => {
        const w = canvas.offsetWidth, h = canvas.offsetHeight;
        zoomAt(w / 2, h / 2, 1.4);
        needsRedraw = true;
    });
    document.getElementById('mapZoomOut')?.addEventListener('click', () => {
        const w = canvas.offsetWidth, h = canvas.offsetHeight;
        zoomAt(w / 2, h / 2, 1 / 1.4);
        needsRedraw = true;
    });
    document.getElementById('mapReset')?.addEventListener('click', () => {
        resetView();
    });
    
    updateZoomIndicator();
    draw();
}
// ===== Initialize Charts =====
function initCharts() {
    const defaults = getChartDefaults();
    
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Accidents',
                data: [],
                borderColor: '#0066CC',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#0066CC',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }, {
                label: 'Fatalities',
                data: [],
                borderColor: '#ff3344',
                backgroundColor: 'rgba(255, 51, 68, 0.05)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#ff3344',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const year = trendChart.data.labels[index];
                    const yearMin = document.getElementById('year-min');
                    const yearMax = document.getElementById('year-max');
                    if (yearMin && yearMax) {
                        yearMin.value = year;
                        yearMax.value = year;
                        const yearMinVal = document.getElementById('year-min-val');
                        const yearMaxVal = document.getElementById('year-max-val');
                        if (yearMinVal) yearMinVal.textContent = year;
                        if (yearMaxVal) yearMaxVal.textContent = year;
                        updateFilterState();
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#0066CC',
                    bodyColor: '#333333',
                    borderColor: 'rgba(0, 102, 204, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    titleFont: { family: "'Segoe UI', sans-serif", size: 11 }
                }
            },
            scales: {
                x: {
                    grid: { color: defaults.gridColor },
                    ticks: { maxTicksLimit: 10 }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: defaults.gridColor },
                    title: {
                        display: true,
                        text: 'Accidents',
                        color: '#555566'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: {
                        display: true,
                        text: 'Fatalities',
                        color: '#555566'
                    }
                }
            }
        }
    });
    
    const causeCtx = document.getElementById('causeChart').getContext('2d');
    causeChart = new Chart(causeCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#ffb800',
                    '#3b82f6',
                    '#a855f7',
                    '#ff3344',
                    '#555566'
                ],
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 12,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
    
    const fatalityCtx = document.getElementById('fatalityChart').getContext('2d');
    fatalityChart = new Chart(fatalityCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Fatalities',
                data: [],
                backgroundColor: '#0066CC',
                borderRadius: 4,
                barThickness: 24
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#0066CC',
                    bodyColor: '#333333',
                    borderColor: 'rgba(0, 102, 204, 0.3)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: defaults.gridColor }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });
    
    const survivalCtx = document.getElementById('survivalChart').getContext('2d');
    survivalChart = new Chart(survivalCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Fatal',
                data: [],
                backgroundColor: '#ff3344'
            }, {
                label: 'Injured',
                data: [],
                backgroundColor: '#ffb800'
            }, {
                label: 'Uninjured',
                data: [],
                backgroundColor: '#00cc88'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: { size: 11 }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: defaults.gridColor }
                }
            }
        }
    });
}
function getChartDefaults() {
    return {
        gridColor: 'rgba(0, 0, 0, 0.05)'
    };
}
// ===== Update Dashboard Data =====
function updateDashboard() {
    const { filteredAccidents } = AppState;
    
    needsRedraw = true;
    
    updateStatCards(filteredAccidents);
    updateTrendChart(filteredAccidents);
    updateCauseChart(filteredAccidents);
    updateFatalityChart(filteredAccidents);
    updateRegionList(filteredAccidents);
    updatePhaseGrid(filteredAccidents);
    updateSurvivalChart(filteredAccidents);
}
function updateStatCards(accidents) {
    const totalAccidents = accidents.length;
    const totalFatalities = accidents.reduce((sum, a) => sum + a.fatalities, 0);
    
    const totalEl = document.getElementById('stat-total-accidents');
    const fatEl = document.getElementById('stat-total-fatalities');
    
    animateNumber(totalEl, totalAccidents);
    animateNumber(fatEl, totalFatalities);
    
    const yearCounts = {};
    accidents.forEach(a => {
        const year = getYearFromDate(a.date);
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    
    let safestYear = '--';
    let minAccidents = Infinity;
    Object.entries(yearCounts).forEach(([year, count]) => {
        if (count < minAccidents) {
            minAccidents = count;
            safestYear = year;
        }
    });
    
    const safestYearEl = document.getElementById('stat-safest-year');
    if (safestYearEl) {
        safestYearEl.textContent = safestYear === '--' ? safestYear : `${safestYear} (${minAccidents})`;
    }
    
    const airlineCounts = {};
    accidents.forEach(a => {
        airlineCounts[a.airline] = (airlineCounts[a.airline] || 0) + 1;
    });
    
    let highRiskAirline = '--';
    let maxAccidents = 0;
    Object.entries(airlineCounts).forEach(([airline, count]) => {
        if (count > maxAccidents) {
            maxAccidents = count;
            highRiskAirline = airline;
        }
    });
    
    const riskAirlineEl = document.getElementById('stat-high-risk-airline');
    if (riskAirlineEl) {
        riskAirlineEl.textContent = highRiskAirline === '--' ? highRiskAirline : `${highRiskAirline} (${maxAccidents})`;
    }
}
function animateNumber(element, target) {
    if (!element) return;
    const start = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
    const duration = 800;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * easeOut);
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}
function updateTrendChart(accidents) {
    const yearData = {};
    
    accidents.forEach(accident => {
        const year = getYearFromDate(accident.date);
        if (!yearData[year]) {
            yearData[year] = { accidents: 0, fatalities: 0 };
        }
        yearData[year].accidents++;
        yearData[year].fatalities += accident.fatalities;
    });
    
    const yearLabels = Object.keys(yearData).sort();
    const accidentCounts = yearLabels.map(y => yearData[y].accidents);
    const fatalityCounts = yearLabels.map(y => yearData[y].fatalities);
    
    trendChart.data.labels = yearLabels;
    trendChart.data.datasets[0].data = accidentCounts;
    trendChart.data.datasets[1].data = fatalityCounts;
    trendChart.update('active');
}
function updateCauseChart(accidents) {
    const causeCounts = {};
    accidents.forEach(a => {
        causeCounts[a.cause] = (causeCounts[a.cause] || 0) + 1;
    });
    
    const causes = Object.keys(causeCounts);
    const counts = causes.map(c => causeCounts[c]);
    
    causeChart.data.labels = causes.map(c => t('cause.' + c));
    causeChart.data.datasets[0].data = counts;
    causeChart.update('active');
}
function updateFatalityChart(accidents) {
    const airlineFatalities = {};
    accidents.forEach(a => {
        airlineFatalities[a.airline] = (airlineFatalities[a.airline] || 0) + a.fatalities;
    });
    
    const sorted = Object.entries(airlineFatalities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = sorted.map(([name]) => {
        const translated = td(name);
        return translated.length > 20 ? translated.substring(0, 18) + '...' : translated;
    });
    const data = sorted.map(([, count]) => count);
    
    fatalityChart.data.labels = labels;
    fatalityChart.data.datasets[0].data = data;
    fatalityChart.update('active');
}
function updateRegionList(accidents) {
    const regionCounts = {};
    accidents.forEach(a => {
        regionCounts[a.region] = (regionCounts[a.region] || 0) + 1;
    });
    
    const sorted = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);
    const maxCount = Math.max(...sorted.map(([, c]) => c));
    
    const container = document.getElementById('region-list');
    if (!container) return;
    
    container.innerHTML = sorted.map(([region, count]) => `
        <div class="region-item">
            <span class="region-name">${td(region)}</span>
            <div class="region-bar-container">
                <div class="region-bar" style="width: ${(count / maxCount) * 100}%"></div>
            </div>
            <span class="region-count">${count}</span>
        </div>
    `).join('');
}
function updatePhaseGrid(accidents) {
    const phaseCounts = {};
    accidents.forEach(a => {
        phaseCounts[a.phase] = (phaseCounts[a.phase] || 0) + 1;
    });
    
    const phases = ['Takeoff', 'Landing', 'Cruise', 'Taxi'];
    const colors = ['#ffb800', '#3b82f6', '#a855f7', '#00cc88'];
    
    const container = document.getElementById('phase-grid');
    if (!container) return;
    
    container.innerHTML = phases.map((phase, i) => `
        <div class="phase-item">
            <div class="phase-dot" style="background: ${colors[i]}"></div>
            <span class="phase-name">${t('phase.' + phase)}</span>
            <span class="phase-count">${phaseCounts[phase] || 0}</span>
        </div>
    `).join('');
}
function updateSurvivalChart(accidents) {
    const stats = { fatal: 0, injured: 0, uninjured: 0 };
    
    accidents.forEach(a => {
        stats.fatal += a.fatalities || 0;
        stats.injured += a.injured || 0;
        stats.uninjured += a.uninjured || 0;
    });
    
    survivalChart.data.labels = ['Total'];
    survivalChart.data.datasets[0].data = [stats.fatal];
    survivalChart.data.datasets[1].data = [stats.injured];
    survivalChart.data.datasets[2].data = [stats.uninjured];
    survivalChart.update();
}
function getYearFromDate(dateStr) {
    return parseInt(dateStr.split('-')[0]);
}