// ===== Aircraft Comparison Page Logic =====
let radarChart, barChart;
let selectedA = null, selectedB = null;

// Chart colors for the two selected aircraft
const colorA = {
    border: '#0066CC',
    bg: 'rgba(0, 102, 204, 0.15)',
    solid: 'rgba(0, 102, 204, 0.7)'
};
const colorB = {
    border: '#ff3344',
    bg: 'rgba(255, 51, 68, 0.15)',
    solid: 'rgba(255, 51, 68, 0.7)'
};

// ===== Initialize Page =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();

    populateSelectors();

    // Default: select first two aircraft
    const aircraftList = LocalDatabase.getAircraft();
    if (aircraftList.length >= 2) {
        selectedA = aircraftList[0].model;
        selectedB = aircraftList[1].model;
        document.getElementById('aircraft-a').value = selectedA;
        document.getElementById('aircraft-b').value = selectedB;
        renderComparison();
    }

    document.getElementById('aircraft-a').addEventListener('change', (e) => {
        selectedA = e.target.value;
        renderComparison();
    });
    document.getElementById('aircraft-b').addEventListener('change', (e) => {
        selectedB = e.target.value;
        renderComparison();
    });

    document.addEventListener('languageChanged', () => {
        populateSelectors();
        if (selectedA && selectedB) renderComparison();
    });
});



// ===== Populate Selectors =====
function populateSelectors() {
    const aircraftList = LocalDatabase.getAircraft();
    const selectA = document.getElementById('aircraft-a');
    const selectB = document.getElementById('aircraft-b');
    if (!selectA || !selectB) return;

    selectA.innerHTML = '';
    selectB.innerHTML = '';

    aircraftList.forEach(ac => {
        const displayName = td(ac.model);
        selectA.appendChild(new Option(displayName, ac.model));
        selectB.appendChild(new Option(displayName, ac.model));
    });

    if (selectedA) selectA.value = selectedA;
    if (selectedB) selectB.value = selectedB;
}

// ===== Render Comparison =====
function renderComparison() {
    const aircraftA = LocalDatabase.getAircraftByModel(selectedA);
    const aircraftB = LocalDatabase.getAircraftByModel(selectedB);
    if (!aircraftA || !aircraftB) return;

    renderOverview(aircraftA, aircraftB);
    renderRadarChart(aircraftA, aircraftB);
    renderBarChart(aircraftA, aircraftB);
    renderAccidentList();
}

// ===== Overview Cards =====
// 已知的 PNG 格式机型图片（其余均为 JPG）
const PNG_AIRCRAFT_SLUGS = new Set([
    'airbus-a220-300',
    'embraer-e190-e2'
]);

function getAircraftImage(model) {
    const slug = model
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    const ext = PNG_AIRCRAFT_SLUGS.has(slug) ? 'png' : 'jpg';
    return `images/aircraft/${slug}.${ext}`;
}

// 【渲染飞机对比概览】
function renderOverview(a, b) {
    const container = document.getElementById('compareOverview');
    if (!container) return;

    const buildSpecItems = (ac) => [
        { label: t('compare.capacity'), value: ac.capacity > 0 ? ac.capacity + t('compare.pax') : t('compare.cargoOnly') },
        { label: t('compare.length'), value: ac.length + ' m' },
        { label: t('compare.wingspan'), value: ac.wingspan + ' m' },
        { label: t('compare.range'), value: formatNumber(ac.range) + ' km' },
        { label: t('compare.cruiseSpeed'), value: ac.cruiseSpeed + ' km/h' },
        { label: t('compare.engines'), value: ac.engines }
    ];

    const buildSafetyItems = (ac) => [
        { label: t('compare.firstFlight'), value: ac.firstFlight },
        { label: t('compare.totalBuilt'), value: formatNumber(ac.totalBuilt) },
        { label: t('compare.accidents'), value: ac.accidents },
        { label: t('compare.hullLosses'), value: ac.hullLosses },
        { label: t('compare.fatalityRate'), value: ac.fatalityRate + '%' }
    ];

    const buildColumn = (ac, colorClass) => `
        <div class="compare-column ${colorClass}">
            <div class="compare-aircraft-image">
                <img data-src="${getAircraftImage(ac.model)}" alt="${td(ac.model)}" class="lazy-image" onerror="this.classList.add('image-error')">
            </div>
            <div class="compare-aircraft-name">${td(ac.model)}</div>
            <div class="compare-section-title">${t('compare.specs')}</div>
            <div class="compare-items">
                ${buildSpecItems(ac).map(item => `
                    <div class="compare-item">
                        <span class="compare-item-label">${item.label}</span>
                        <span class="compare-item-value">${item.value}</span>
                    </div>
                `).join('')}
            </div>
            <div class="compare-section-title">${t('compare.safetyStats')}</div>
            <div class="compare-items">
                ${buildSafetyItems(ac).map(item => `
                    <div class="compare-item">
                        <span class="compare-item-label">${item.label}</span>
                        <span class="compare-item-value">${item.value}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.innerHTML = `
        ${buildColumn(a, 'compare-column-a')}
        <div class="vs-badge">${t('compare.vs')}</div>
        ${buildColumn(b, 'compare-column-b')}
    `;
    
    if (typeof refreshLazyImages === 'function') {
        setTimeout(refreshLazyImages, 50);
    }
}

// ===== Radar Chart =====
function getRadarLabels() {
    return [
        t('compare.totalBuiltShort'),
        t('compare.accidentsShort'),
        t('compare.hullLossesShort'),
        t('compare.fatalityRateShort'),
        t('compare.serviceYearsShort')
    ];
}

function getRadarData(aircraft) {
    const all = LocalDatabase.getAircraft();
    const maxBuilt = Math.max(...all.map(a => a.totalBuilt));
    const maxAccidents = Math.max(...all.map(a => a.accidents));
    const maxHull = Math.max(...all.map(a => a.hullLosses));
    const maxFat = Math.max(...all.map(a => a.fatalityRate * 100));
    const maxYears = Math.max(...all.map(a => 2025 - a.firstFlight));

    return [
        Math.round((aircraft.totalBuilt / maxBuilt) * 100),
        Math.round((aircraft.accidents / maxAccidents) * 100),
        Math.round((aircraft.hullLosses / maxHull) * 100),
        Math.round((aircraft.fatalityRate * 100 / maxFat) * 100),
        Math.round(((2025 - aircraft.firstFlight) / maxYears) * 100)
    ];
}

// 【渲染机型对比雷达图】
function renderRadarChart(a, b) {
    const ctx = document.getElementById('radarChart');
    if (!ctx) return;

    const labels = getRadarLabels();
    const dataA = getRadarData(a);
    const dataB = getRadarData(b);

    if (radarChart) {
        radarChart.data.labels = labels;
        radarChart.data.datasets[0].label = td(a.model);
        radarChart.data.datasets[0].data = dataA;
        radarChart.data.datasets[1].label = td(b.model);
        radarChart.data.datasets[1].data = dataB;
        radarChart.update();
    } else {
        radarChart = new Chart(ctx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: td(a.model),
                        data: dataA,
                        borderColor: colorA.border,
                        backgroundColor: colorA.bg,
                        borderWidth: 2,
                        pointBackgroundColor: colorA.border,
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    },
                    {
                        label: td(b.model),
                        data: dataB,
                        borderColor: colorB.border,
                        backgroundColor: colorB.bg,
                        borderWidth: 2,
                        pointBackgroundColor: colorB.border,
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#0066CC',
                        bodyColor: '#333333',
                        borderColor: 'rgba(0, 102, 204, 0.3)',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            backdropColor: 'transparent',
                            color: '#555566',
                            font: { size: 10 }
                        },
                        grid: { color: 'rgba(0, 102, 204, 0.12)' },
                        angleLines: { color: 'rgba(0, 102, 204, 0.12)' },
                        pointLabels: { color: '#555566', font: { size: 11 } }
                    }
                }
            }
        });
    }
}

// ===== Bar Chart =====
function renderBarChart(a, b) {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;

    const labels = [t('compare.accidentsShort'), t('compare.hullLossesShort')];
    const dataA = [a.accidents, a.hullLosses];
    const dataB = [b.accidents, b.hullLosses];

    if (barChart) {
        barChart.data.labels = labels;
        barChart.data.datasets[0].label = td(a.model);
        barChart.data.datasets[0].data = dataA;
        barChart.data.datasets[1].label = td(b.model);
        barChart.data.datasets[1].data = dataB;
        barChart.update();
    } else {
        barChart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: td(a.model),
                        data: dataA,
                        backgroundColor: colorA.solid,
                        borderColor: colorA.border,
                        borderWidth: 1,
                        borderRadius: 2
                    },
                    {
                        label: td(b.model),
                        data: dataB,
                        backgroundColor: colorB.solid,
                        borderColor: colorB.border,
                        borderWidth: 1,
                        borderRadius: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#0066CC',
                        bodyColor: '#333333',
                        borderColor: 'rgba(0, 102, 204, 0.3)',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 102, 204, 0.12)' }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 102, 204, 0.12)' }
                    }
                }
            }
        });
    }
}

// ===== Accident List =====
// 【按机型筛选事故记录】
function getAccidentsByModel(model) {
    return AppState.accidents.filter(acc => acc.aircraft === model);
}

function renderAccidentList() {
    const container = document.getElementById('accidentList');
    if (!container) return;

    const accidentsA = getAccidentsByModel(selectedA)
        .sort((x, y) => y.fatalities - x.fatalities)
        .slice(0, 5);
    const accidentsB = getAccidentsByModel(selectedB)
        .sort((x, y) => y.fatalities - x.fatalities)
        .slice(0, 5);

    const buildTable = (accidents) => {
        if (accidents.length === 0) {
            return `<div class="no-accidents">${t('compare.noAccidents')}</div>`;
        }
        return `
            <table class="accident-list-table">
                <thead>
                    <tr>
                        <th>${t('compare.date')}</th>
                        <th>${t('compare.airline')}</th>
                        <th>${t('compare.location')}</th>
                        <th>${t('compare.fatalities')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${accidents.map(acc => `
                        <tr class="accident-row-link" data-href="table.html#${acc.id}">
                            <td>${formatDate(acc.date)}</td>
                            <td>${td(acc.airline)}</td>
                            <td>${acc.location}</td>
                            <td>${formatNumber(acc.fatalities)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    };

    const buildColumn = (accidents, model, colorClass) => `
        <div class="accident-list-column ${colorClass}">
            <div class="accident-list-title">${td(model)}</div>
            ${buildTable(accidents)}
        </div>
    `;

    container.innerHTML = `
        ${buildColumn(accidentsA, selectedA, 'compare-column-a')}
        ${buildColumn(accidentsB, selectedB, 'compare-column-b')}
    `;

    document.querySelectorAll('.accident-row-link').forEach(row => {
        row.addEventListener('click', () => {
            const href = row.dataset.href;
            if (href) {
                window.location.href = href;
            }
        });
    });

    initImageLightbox();
}

// ===== Image Lightbox =====
let lightboxZoom = 1;
let lightboxTranslate = { x: 0, y: 0 };
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragStartTranslate = { x: 0, y: 0 };
let currentImageIndex = 0;
let lightboxImages = [];
let touchStartDistance = 0;
let savedScrollPosition = { x: 0, y: 0 };
let touchStartCenter = { x: 0, y: 0 };
let touchStartZoom = 1;
let touchStartTranslate = { x: 0, y: 0 };

// 【图片灯箱浏览功能】
function initImageLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const zoomReset = document.getElementById('zoomReset');
    const zoomSlider = document.getElementById('zoomSlider');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxResolution = document.getElementById('lightboxResolution');
    const zoomInfo = document.getElementById('lightboxZoom');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxLoading = document.getElementById('lightboxLoading');

    const updateImageList = () => {
        lightboxImages = Array.from(document.querySelectorAll('.compare-aircraft-image img'))
            .map(img => ({ src: img.src, title: img.alt || 'Aircraft Image' }));
    };

    document.querySelectorAll('.compare-aircraft-image img').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            updateImageList();
            currentImageIndex = lightboxImages.findIndex(i => i.src === img.src);
            if (currentImageIndex === -1) currentImageIndex = 0;
            openLightbox(lightboxImages[currentImageIndex].src, lightboxImages[currentImageIndex].title);
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    zoomIn.addEventListener('click', () => {
        zoomLightbox(1.2);
        zoomSlider.value = lightboxZoom * 100;
    });
    zoomOut.addEventListener('click', () => {
        zoomLightbox(0.8);
        zoomSlider.value = lightboxZoom * 100;
    });
    zoomReset.addEventListener('click', () => {
        resetLightbox();
        zoomSlider.value = 100;
    });
    zoomSlider.addEventListener('input', (e) => {
        const newZoom = parseInt(e.target.value) / 100;
        zoomTo(newZoom);
    });

    lightboxPrev.addEventListener('click', () => navigateImage(-1));
    lightboxNext.addEventListener('click', () => navigateImage(1));

    lightboxImage.addEventListener('wheel', handleWheel);
    lightboxImage.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    
    lightboxImage.addEventListener('touchstart', handleTouchStart, { passive: false });
    lightboxImage.addEventListener('touchmove', handleTouchMove, { passive: false });
    lightboxImage.addEventListener('touchend', handleTouchEnd);

    function openLightbox(src, title) {
        savedScrollPosition = { x: window.scrollX, y: window.scrollY };
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        
        lightboxLoading.classList.add('active');
        lightboxImage.style.opacity = '0';
        lightboxImage.src = src;
        lightboxTitle.textContent = title;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        
        lightboxImage.onload = () => {
            lightboxLoading.classList.remove('active');
            lightboxImage.style.opacity = '1';
            lightboxResolution.textContent = `${lightboxImage.naturalWidth} × ${lightboxImage.naturalHeight}`;
            resetLightbox();
            zoomSlider.value = 100;
        };
        
        lightboxImage.onerror = () => {
            lightboxLoading.classList.remove('active');
        };
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        lightboxImage.style.opacity = '0';
        
        setTimeout(() => {
            window.scrollTo({ top: savedScrollPosition.y, left: savedScrollPosition.x, behavior: 'smooth' });
        }, 100);
    }

    function navigateImage(direction) {
        updateImageList();
        if (lightboxImages.length === 0) return;
        
        currentImageIndex = (currentImageIndex + direction + lightboxImages.length) % lightboxImages.length;
        const image = lightboxImages[currentImageIndex];
        openLightbox(image.src, image.title);
    }

    function zoomLightbox(factor) {
        const newZoom = Math.max(0.5, Math.min(5, lightboxZoom * factor));
        zoomTo(newZoom);
    }

    function zoomTo(newZoom) {
        if (newZoom === lightboxZoom) return;
        
        const rect = lightboxImage.getBoundingClientRect();
        const contentRect = lightbox.querySelector('.lightbox-content').getBoundingClientRect();
        const centerX = contentRect.width / 2;
        const centerY = contentRect.height / 2;
        
        const contentX = (centerX - lightboxTranslate.x) / lightboxZoom;
        const contentY = (centerY - lightboxTranslate.y) / lightboxZoom;
        
        lightboxTranslate.x = centerX - contentX * newZoom;
        lightboxTranslate.y = centerY - contentY * newZoom;
        
        lightboxZoom = newZoom;
        updateLightboxTransform();
        updateZoomInfo();
    }

    function handleWheel(e) {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        const rect = lightboxImage.getBoundingClientRect();
        const contentRect = lightbox.querySelector('.lightbox-content').getBoundingClientRect();
        
        const mouseX = e.clientX - contentRect.left;
        const mouseY = e.clientY - contentRect.top;
        
        const newZoom = Math.max(0.5, Math.min(5, lightboxZoom * factor));
        if (newZoom === lightboxZoom) return;
        
        const contentX = (mouseX - lightboxTranslate.x) / lightboxZoom;
        const contentY = (mouseY - lightboxTranslate.y) / lightboxZoom;
        
        lightboxTranslate.x = mouseX - contentX * newZoom;
        lightboxTranslate.y = mouseY - contentY * newZoom;
        
        lightboxZoom = newZoom;
        updateLightboxTransform();
        updateZoomInfo();
        zoomSlider.value = lightboxZoom * 100;
    }

    function resetLightbox() {
        lightboxZoom = 1;
        lightboxTranslate = { x: 0, y: 0 };
        updateLightboxTransform();
        updateZoomInfo();
    }

    function updateLightboxTransform() {
        lightboxImage.style.transform = `translate(${lightboxTranslate.x}px, ${lightboxTranslate.y}px) scale(${lightboxZoom})`;
    }

    function updateZoomInfo() {
        zoomInfo.textContent = `${Math.round(lightboxZoom * 100)}%`;
    }

    function handleMouseDown(e) {
        if (lightboxZoom <= 1) return;
        isDragging = true;
        dragStart = { x: e.clientX, y: e.clientY };
        dragStartTranslate = { x: lightboxTranslate.x, y: lightboxTranslate.y };
        lightboxImage.classList.add('dragging');
    }

    function handleMouseMove(e) {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        lightboxTranslate.x = dragStartTranslate.x + dx;
        lightboxTranslate.y = dragStartTranslate.y + dy;
        updateLightboxTransform();
    }

    function handleMouseUp() {
        isDragging = false;
        lightboxImage.classList.remove('dragging');
    }

    function handleKeyDown(e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === '+' || e.key === '=') {
            zoomLightbox(1.2);
            zoomSlider.value = lightboxZoom * 100;
        }
        if (e.key === '-') {
            zoomLightbox(0.8);
            zoomSlider.value = lightboxZoom * 100;
        }
        if (e.key === '0') {
            resetLightbox();
            zoomSlider.value = 100;
        }
        if (e.key === 'ArrowLeft') navigateImage(-1);
        if (e.key === 'ArrowRight') navigateImage(1);
    }

    function handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            if (lightboxZoom > 1) {
                isDragging = true;
                dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                dragStartTranslate = { x: lightboxTranslate.x, y: lightboxTranslate.y };
                lightboxImage.classList.add('dragging');
            }
        } else if (e.touches.length === 2) {
            touchStartDistance = getTouchDistance(e.touches);
            touchStartCenter = getTouchCenter(e.touches);
            touchStartZoom = lightboxZoom;
            touchStartTranslate = { x: lightboxTranslate.x, y: lightboxTranslate.y };
        }
    }

    function handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
            const dx = e.touches[0].clientX - dragStart.x;
            const dy = e.touches[0].clientY - dragStart.y;
            lightboxTranslate.x = dragStartTranslate.x + dx;
            lightboxTranslate.y = dragStartTranslate.y + dy;
            updateLightboxTransform();
        } else if (e.touches.length === 2) {
            const currentDistance = getTouchDistance(e.touches);
            const currentCenter = getTouchCenter(e.touches);
            const contentRect = lightbox.querySelector('.lightbox-content').getBoundingClientRect();
            
            const zoomFactor = currentDistance / touchStartDistance;
            const newZoom = Math.max(0.5, Math.min(5, touchStartZoom * zoomFactor));
            
            const contentX = (touchStartCenter.x - contentRect.left - touchStartTranslate.x) / touchStartZoom;
            const contentY = (touchStartCenter.y - contentRect.top - touchStartTranslate.y) / touchStartZoom;
            
            lightboxTranslate.x = currentCenter.x - contentRect.left - contentX * newZoom;
            lightboxTranslate.y = currentCenter.y - contentRect.top - contentY * newZoom;
            lightboxZoom = newZoom;
            
            updateLightboxTransform();
            updateZoomInfo();
            zoomSlider.value = lightboxZoom * 100;
        }
    }

    function handleTouchEnd() {
        isDragging = false;
        lightboxImage.classList.remove('dragging');
    }

    function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getTouchCenter(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }
}
