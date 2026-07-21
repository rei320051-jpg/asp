// ===== 仪表盘主逻辑 =====
let trendChart, causeChart, fatalityChart, survivalChart;
let earthAnimationId;
let needsRedraw = true;
// ===== 初始化仪表盘 =====
document.addEventListener('DOMContentLoaded', async () => {
    const skeleton = document.querySelector('.map-skeleton');
    if (skeleton) skeleton.classList.remove('hidden');
    
    try {
        await loadAllData();
        initCharts();
        updateDashboard();
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
    }
    
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
// ===== 全球事故地图可视化（D3 + 地图）=====
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
    let cachedPositions = null;
    
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
        return [x * zoom + panX, y * zoom + panY];
    }

    function findHoveredAccident(sx, sy) {
        const threshold = 15;
        if (cachedPositions) {
            const px = (sx - panX) / zoom * MAX_ZOOM;
            const py = (sy - panY) / zoom * MAX_ZOOM;
            const adjThreshold = threshold / zoom * MAX_ZOOM;
            for (let i = 0; i < cachedPositions.length; i++) {
                const c = cachedPositions[i];
                if (!c) continue;
                const dist = Math.sqrt((px - c.x) ** 2 + (py - c.y) ** 2);
                if (dist < adjThreshold) return c.accident;
            }
            return null;
        }
        for (const accident of AppState.filteredAccidents) {
            const pos = getAccidentScreenPos(accident);
            if (!pos) continue;
            const [x, y] = pos;
            const dist = Math.sqrt((sx - x) ** 2 + (sy - y) ** 2);
            if (dist < threshold) return accident;
        }
        return null;
    }
    
    function showTooltip(accident, cx, cy) {
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
                    <div class="ts-num">${accident.injuries || 0}</div>
                    <div class="ts-lbl">${t('tooltip.injured')}</div>
                </div>
                <div class="tooltip-stat success">
                    <div class="ts-num">${Math.max(0, (accident.totalOccupants || 0) - (accident.fatalities || 0) - (accident.injuries || 0))}</div>
                    <div class="ts-lbl">${t('tooltip.uninjured')}</div>
                </div>
            </div>
        `;
        tooltip.style.display = 'block';

        // Position tooltip in viewport space (position: fixed)
        const padding = 15;
        const tipW = Math.min(320, window.innerWidth - padding * 2);
        let tx = cx + padding;
        let ty = cy + padding;

        // Flip left if would overflow right edge
        if (tx + tipW > window.innerWidth - padding) tx = cx - tipW - padding;
        // Flip up if would overflow bottom edge
        if (ty + tooltip.offsetHeight > window.innerHeight - padding) ty = cy - tooltip.offsetHeight - padding;
        // Clamp to prevent overflowing left/top
        tx = Math.max(padding, tx);
        ty = Math.max(padding, ty);

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
        const oldZoom = zoom;
        zoom *= factor;
        zoom = Math.max(0.5, Math.min(5, zoom));
        
        const worldX = (cx - panX) / oldZoom;
        const worldY = (cy - panY) / oldZoom;
        panX = cx - worldX;
        panY = cy - worldY;
        
        updateZoomIndicator();
    }
    
    function resetView() {
        zoom = 1;
        panX = 0;
        panY = 0;
        updateZoomIndicator();
        needsRedraw = true;
        scheduleDraw();
    }
    
    d3.json('data/countries-110m.json').then(world => {
        worldGeoJSON = topojson.feature(world, world.objects.countries);
        resize();
        mapReady = true;
        startSweep();

        setTimeout(() => {
            const skeleton = document.querySelector('.map-skeleton');
            if (skeleton) skeleton.classList.add('hidden');
        }, 300);

        draw();
    }).catch(error => {
        console.error('Failed to load world map:', error);
        const skeleton = document.querySelector('.map-skeleton');
        if (skeleton) {
            skeleton.innerHTML = '<div class="skeleton-error">Failed to load map data</div>';
        }
    });
    
    function resize() {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        cachedW = rect.width;
        cachedH = rect.height;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = cachedW * dpr;
        canvas.height = cachedH * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        projection = d3.geoNaturalEarth1()
            .scale(cachedW / Math.PI / 1.5)
            .translate([cachedW / 2, cachedH / 2]);

        pathGenerator = d3.geoPath().projection(projection);

        renderStaticMap();
        needsRedraw = true;
        scheduleDraw();
    }

    const MAX_ZOOM = 5;
    function renderStaticMap() {
        if (!worldGeoJSON || !pathGenerator) return;
        
        const renderW = cachedW * MAX_ZOOM;
        const renderH = cachedH * MAX_ZOOM;
        
        const dpr = window.devicePixelRatio || 1;
        offscreen.width = renderW * dpr;
        offscreen.height = renderH * dpr;
        offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        offCtx.clearRect(0, 0, renderW, renderH);
        
        const bgGradient = offCtx.createLinearGradient(0, 0, 0, renderH);
        bgGradient.addColorStop(0, '#1a3a6c');
        bgGradient.addColorStop(0.5, '#2a5a94');
        bgGradient.addColorStop(1, '#1a3a6c');
        offCtx.fillStyle = bgGradient;
        offCtx.fillRect(0, 0, renderW, renderH);
        
        const gridStep = 30 * MAX_ZOOM;
        offCtx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        offCtx.lineWidth = 1;
        
        for (let x = 0; x <= renderW; x += gridStep) {
            offCtx.beginPath();
            offCtx.moveTo(x, 0);
            offCtx.lineTo(x, renderH);
            offCtx.stroke();
        }
        for (let y = 0; y <= renderH; y += gridStep) {
            offCtx.beginPath();
            offCtx.moveTo(0, y);
            offCtx.lineTo(renderW, y);
            offCtx.stroke();
        }
        
        const renderProjection = d3.geoNaturalEarth1()
            .scale(renderW / Math.PI / 1.5)
            .translate([renderW / 2, renderH / 2]);
        const renderPathGenerator = d3.geoPath().projection(renderProjection);
        
        offCtx.fillStyle = '#2d5a87';
        offCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        offCtx.lineWidth = 0.5;
        offCtx.beginPath();
        renderPathGenerator.context(offCtx)(worldGeoJSON);
        offCtx.fill();
        offCtx.stroke();
        
        cachedPositions = buildPositionCacheFromProjection(renderProjection);
    }
    
    function buildPositionCacheFromProjection(renderProjection) {
        const { filteredAccidents } = AppState;
        const renderW = cachedW * MAX_ZOOM;
        const renderH = cachedH * MAX_ZOOM;
        const cache = new Array(filteredAccidents.length);
        for (let i = 0; i < filteredAccidents.length; i++) {
            const a = filteredAccidents[i];
            const pos = renderProjection([a.longitude, a.latitude]);
            if (pos) {
                cache[i] = { x: pos[0], y: pos[1], accident: a };
            }
        }
        return cache;
    }
    
    window.addEventListener('resize', () => {
        resize();
        needsRedraw = true;
        scheduleDraw();
    });
    
    // 【按需调度绘制帧 - 仅在需要时 requestAnimationFrame】
    function scheduleDraw() {
        if (earthAnimationId) return;
        earthAnimationId = requestAnimationFrame(draw);
    }

    let sweepTimer = null;
    function startSweep() {
        if (sweepTimer) return;
        sweepTimer = setInterval(() => {
            sweepAngle += 3;
            needsRedraw = true;
            scheduleDraw();
        }, 30);
    }

    let lastZoom = 1;
    function draw() {
        earthAnimationId = null;

        if (isPaused) return;

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
            scheduleDraw();
            return;
        }

        if (zoom !== lastZoom) {
            lastZoom = zoom;
            needsRedraw = true;
        }

        if (!needsRedraw && !isDragging && !hoveredAccidentChanged) {
            return;
        }

        needsRedraw = false;
        hoveredAccidentChanged = false;

        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, w, h);

        const renderW = cachedW * MAX_ZOOM;
        const renderH = cachedH * MAX_ZOOM;
        
        const centerX = renderW / 2 + panX * MAX_ZOOM / zoom;
        const centerY = renderH / 2 + panY * MAX_ZOOM / zoom;
        const sourceW = renderW / zoom;
        const sourceH = renderH / zoom;
        
        ctx.drawImage(offscreen, centerX - sourceW / 2, centerY - sourceH / 2, sourceW, sourceH, 0, 0, w, h);

        // Batch-render accident points from cached positions (screen coords)
        if (cachedPositions) {
            const len = cachedPositions.length;
            const high = [], low = [];
            for (let i = 0; i < len; i++) {
                const c = cachedPositions[i];
                if (!c) continue;
                const isHovered = hoveredAccident === c.accident;
                if (isHovered || c.accident.fatalities > 50) high.push(c);
                else low.push(c);
            }
            const dotScale = Math.pow(zoom, 0.8);
            // Draw low-severity dots
            for (const c of low) {
                const sx = c.x / MAX_ZOOM * zoom + panX;
                const sy = c.y / MAX_ZOOM * zoom + panY;
                const pulse = (Math.sin(sweepAngle * 0.08 + c.accident.latitude + c.accident.longitude) + 1) / 2;
                const r = 2.5 * dotScale;
                ctx.beginPath();
                ctx.arc(sx, sy, r * 2 + pulse * 3 * dotScale, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 51, 68, ${0.15 + pulse * 0.25})`;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
                ctx.fillStyle = '#ffb800';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = 1 * dotScale;
                ctx.stroke();
            }
            // Draw high-severity / hovered dots
            for (const c of high) {
                const sx = c.x / MAX_ZOOM * zoom + panX;
                const sy = c.y / MAX_ZOOM * zoom + panY;
                const isHovered = hoveredAccident === c.accident;
                const baseSize = isHovered ? 7 : 5;
                const size = baseSize * dotScale;
                const pulse = (Math.sin(sweepAngle * 0.08 + c.accident.latitude + c.accident.longitude) + 1) / 2;
                ctx.beginPath();
                ctx.arc(sx, sy, size * 2 + pulse * 3 * dotScale, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 51, 68, ${0.15 + pulse * 0.25})`;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(sx, sy, size, 0, Math.PI * 2);
                ctx.fillStyle = '#ff3344';
                ctx.fill();
                ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
                ctx.lineWidth = (isHovered ? 2.5 : 1) * dotScale;
                ctx.stroke();
            }
        }

        const sweepX = ((sweepAngle * 0.8) % (w + 200)) - 100;
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
        
        sweepAngle++;
    }

    let isPaused = false;
    let didDrag = false;

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        isDragging = true;
        didDrag = false;
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
            const dx = sx - dragStartX;
            const dy = sy - dragStartY;
            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag = true;
            panX += dx;
            panY += dy;
            dragStartX = sx;
            dragStartY = sy;
            tooltip.style.display = 'none';
            if (hoveredAccident !== null) {
                hoveredAccident = null;
                hoveredAccidentChanged = true;
            }
            needsRedraw = true;
            scheduleDraw();
        } else {
            const accident = findHoveredAccident(sx, sy);
            if (accident !== hoveredAccident) {
                hoveredAccident = accident;
                hoveredAccidentChanged = true;
                scheduleDraw();
            }
            if (accident) {
                showTooltip(accident, e.clientX, e.clientY);
                canvas.style.cursor = 'pointer';
            } else {
                tooltip.style.display = 'none';
                canvas.style.cursor = 'grab';
            }
        }
    });
    
    canvas.addEventListener('mouseup', (e) => {
        isDragging = false;
        canvas.style.cursor = 'grab';

        if (!didDrag) {
            const rect = canvas.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;
            const clicked = findHoveredAccident(sx, sy);
            if (clicked && clicked.id) {
                window.location.href = `table.html#${clicked.id}`;
            }
        }
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
        scheduleDraw();
        const accident = findHoveredAccident(sx, sy);
        if (accident !== hoveredAccident) {
            hoveredAccident = accident;
            hoveredAccidentChanged = true;
        }
        if (accident) showTooltip(accident, e.clientX, e.clientY);
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
            const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const rect = canvas.getBoundingClientRect();
            const sx = cx - rect.left;
            const sy = cy - rect.top;
            const factor = dist / touchStartDist;
            zoomAt(sx, sy, factor);
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
        scheduleDraw();
    });
    document.getElementById('mapZoomOut')?.addEventListener('click', () => {
        const w = canvas.offsetWidth, h = canvas.offsetHeight;
        zoomAt(w / 2, h / 2, 1 / 1.4);
        needsRedraw = true;
        scheduleDraw();
    });
    document.getElementById('mapReset')?.addEventListener('click', () => {
        resetView();
    });

    document.addEventListener('filtersUpdated', () => {
        renderStaticMap();
        needsRedraw = true;
        scheduleDraw();
    });

    updateZoomIndicator();
    draw();
}
// ===== 初始化图表（Chart.js）=====
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
    const airlineColors = [
        '#0066CC', '#E85D3A', '#2E9A5E', '#8B5CF6', '#F59E0B',
        '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#A855F7'
    ];
    fatalityChart = new Chart(fatalityCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Fatalities',
                data: [],
                backgroundColor: airlineColors.slice(0, 10),
                borderRadius: 4,
                barThickness: 14,
                categoryPercentage: 0.7,
                barPercentage: 0.75
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
// ===== 更新仪表盘数据图表 =====
let updateTimeout;
function updateDashboard() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
        const { filteredAccidents } = AppState;
        
        needsRedraw = true;
        
        updateStatCards(filteredAccidents);
        updateTrendChart(filteredAccidents);
        updateCauseChart(filteredAccidents);
        updateFatalityChart(filteredAccidents);
        updateRegionList(filteredAccidents);
        updatePhaseGrid(filteredAccidents);
        updateSurvivalChart(filteredAccidents);
    }, 150);
}
// 【更新统计卡片/趋势图/原因图/航空公司图/区域列表/阶段分布/生存率】
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
        safestYearEl.textContent = safestYear === '--' ? safestYear : `${safestYear}`;
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
        riskAirlineEl.textContent = highRiskAirline === '--' ? highRiskAirline : `${td(highRiskAirline)}`;
    }
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
    
    const container = document.getElementById('regionList');
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
    
    const container = document.getElementById('phaseGrid');
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
        stats.injured += a.injuries || 0;
        stats.uninjured += Math.max(0, (a.totalOccupants || 0) - (a.fatalities || 0) - (a.injuries || 0));
    });
    
    survivalChart.data.labels = ['Total'];
    survivalChart.data.datasets[0].data = [stats.fatal];
    survivalChart.data.datasets[1].data = [stats.injured];
    survivalChart.data.datasets[2].data = [stats.uninjured];
    survivalChart.update();
}