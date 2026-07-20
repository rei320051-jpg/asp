// ===== Rating Page Logic =====
let radarChart, aircraftChart;
let selectedAirlines = [];
const MAX_SELECTED = 5;
const radarColors = [
    { border: '#0066CC', bg: 'rgba(0, 102, 204, 0.15)' },
    { border: '#ff3344', bg: 'rgba(255, 51, 68, 0.15)' },
    { border: '#ffb800', bg: 'rgba(255, 184, 0, 0.15)' },
    { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
    { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' }
];
// Airline brand logo mapping (IATA code -> local SVG file)
const airlineLogos = {
    'Qantas Airways':                  'images/airline-logos/qa.svg',
    'Air New Zealand':                 'images/airline-logos/nz.svg',
    'Emirates':                        'images/airline-logos/ek.svg',
    'Etihad Airways':                  'images/airline-logos/ey.svg',
    'Singapore Airlines':              'images/airline-logos/sq.svg',
    'British Airways':                 'images/airline-logos/ba.svg',
    'Lufthansa':                       'images/airline-logos/lh.svg',
    'Air France':                      'images/airline-logos/af.svg',
    'Delta Air Lines':                 'images/airline-logos/dl.svg',
    'United Airlines':                 'images/airline-logos/ua.svg',
    'American Airlines':               'images/airline-logos/aa.svg',
    'Japan Airlines':                  'images/airline-logos/jl.svg',
    'All Nippon Airways':              'images/airline-logos/nh.svg',
    'Cathay Pacific':                  'images/airline-logos/cx.svg',
    'Lion Air':                        'images/airline-logos/jt.svg',
    'Pakistan International Airlines': 'images/airline-logos/pk.svg',
    'Air India Express':               'images/airline-logos/ix.svg',
    'China Eastern Airlines':          'images/airline-logos/mu.svg',
    'Korean Air':                      'images/airline-logos/ke.svg',
    'Ethiopian Airlines':              'images/airline-logos/et.svg',
    'Air China':                       'images/airline-logos/ca.svg',
    'China Southern Airlines':         'images/airline-logos/cz.svg',
    'Hainan Airlines':                 'images/airline-logos/hu.svg',
    'Xiamen Air':                      'images/airline-logos/mf.svg',
    'Sichuan Airlines':                'images/airline-logos/3u.svg'
};
// IATA codes for airlines
const airlineIATACodes = {
    'Qantas Airways':                  'QF',
    'Air New Zealand':                 'NZ',
    'Emirates':                        'EK',
    'Etihad Airways':                  'EY',
    'Singapore Airlines':              'SQ',
    'British Airways':                 'BA',
    'Lufthansa':                       'LH',
    'Air France':                      'AF',
    'Delta Air Lines':                 'DL',
    'United Airlines':                 'UA',
    'American Airlines':               'AA',
    'Japan Airlines':                  'JL',
    'All Nippon Airways':              'NH',
    'Cathay Pacific':                  'CX',
    'Lion Air':                        'JT',
    'Pakistan International Airlines': 'PK',
    'Air India Express':               'IX',
    'China Eastern Airlines':          'MU',
    'Korean Air':                      'KE',
    'Ethiopian Airlines':              'ET',
    'Air China':                       'CA',
    'China Southern Airlines':         'CZ',
    'Hainan Airlines':                 'HU',
    'Xiamen Air':                      'MF',
    'Sichuan Airlines':                '3U'
};
// Get airline logo path
function getAirlineLogo(name) {
    return airlineLogos[name] || 'images/airline-logos/default.svg';
}
// Get airline IATA code
function getAirlineIATA(name) {
    return airlineIATACodes[name] || '';
}
// Airline official website URLs
const airlineWebsites = {
    'Qantas Airways':                  'https://www.qantas.com',
    'Air New Zealand':                 'https://www.airnewzealand.com',
    'Emirates':                        'https://www.emirates.com',
    'Etihad Airways':                  'https://www.etihad.com',
    'Singapore Airlines':              'https://www.singaporeair.com',
    'British Airways':                 'https://www.british-airways.com',
    'Lufthansa':                       'https://www.lufthansa.com',
    'Air France':                      'https://www.airfrance.com',
    'Delta Air Lines':                 'https://www.delta.com',
    'United Airlines':                 'https://www.united.com',
    'American Airlines':               'https://www.aa.com',
    'Japan Airlines':                  'https://www.jal.co.jp',
    'All Nippon Airways':              'https://www.ana.co.jp',
    'Cathay Pacific':                  'https://www.cathaypacific.com',
    'Lion Air':                        'https://www.lionair.co.id',
    'Pakistan International Airlines': 'https://www.piac.com.pk',
    'Air India Express':               'https://www.airindiaexpress.com',
    'China Eastern Airlines':          'https://www.ceair.com',
    'Korean Air':                      'https://www.koreanair.com',
    'Ethiopian Airlines':              'https://www.ethiopianairlines.com',
    'Air China':                       'https://www.airchina.com.cn',
    'China Southern Airlines':         'https://www.csair.com',
    'Hainan Airlines':                 'https://www.hainanairlines.com',
    'Xiamen Air':                      'https://www.xiamenair.com',
    'Sichuan Airlines':                'https://www.sichuanair.com'
};
// Get airline official website URL
function getAirlineWebsite(name) {
    return airlineWebsites[name] || '';
}
// ===== Initialize Rating Page =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    initRadarChart();
    initAircraftChart();
    renderAirlineSelector();
    renderRatingTable();
    renderAircraftChart();
    
    // Default: select top 3 airlines
    const top3 = AppState.airlines
        .sort((a, b) => b.safetyRating - a.safetyRating)
        .slice(0, 3)
        .map(a => a.id);
    selectedAirlines = top3;
    updateAirlineCheckboxes();
    updateRadarChart();
    
    // Listen for language changes
    document.addEventListener('languageChanged', () => {
        updateRadarLabels();
        renderAirlineSelector();
        renderRatingTable();
        updateRadarChart();
        renderAircraftChart();
    });
});
// ===== Radar Chart =====
function getRadarLabels() {
    return [
        t('rating.safetyScore'),
        t('rating.fleetSize'),
        t('rating.experience'),
        t('rating.lowFatalities'),
        t('rating.iosaCertified'),
        t('rating.improvingTrend')
    ];
}
function updateRadarLabels() {
    if (!radarChart) return;
    radarChart.data.labels = getRadarLabels();
}
function initRadarChart() {
    const ctx = document.getElementById('radarChart');
    if (!ctx) return;
    
    radarChart = new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: getRadarLabels(),
            datasets: []
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
                    grid: {
                        color: 'rgba(0, 102, 204, 0.1)'
                    },
                    angleLines: {
                        color: 'rgba(0, 102, 204, 0.1)'
                    },
                    pointLabels: {
                        color: '#555566',
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}
// 【计算航空公司雷达评分】
function calculateRadarScores(airline) {
    // Normalize each dimension to 0-100
    const maxFleet = Math.max(...AppState.airlines.map(a => a.fleetSize));
    const maxFatalities = Math.max(...AppState.airlines.map(a => a.totalFatalities));
    const maxAge = Math.max(...AppState.airlines.map(a => 2024 - a.founded));
    
    const fleetScore = (airline.fleetSize / maxFleet) * 100;
    const experienceScore = ((2024 - airline.founded) / maxAge) * 100;
    const lowFatScore = (1 - airline.totalFatalities / (maxFatalities || 1)) * 100;
    const iosaScore = airline.iosaCertified ? 100 : 30;
    const trendScore = airline.recentTrend === 'improving' ? 100 : airline.recentTrend === 'stable' ? 60 : 20;
    
    return [
        airline.safetyRating,
        Math.round(fleetScore),
        Math.round(experienceScore),
        Math.round(Math.max(0, lowFatScore)),
        iosaScore,
        trendScore
    ];
}
function updateRadarChart() {
    if (!radarChart) return;
    
    const selected = AppState.airlines.filter(a => selectedAirlines.includes(a.id));
    
    radarChart.data.datasets = selected.map((airline, idx) => {
        const color = radarColors[idx % radarColors.length];
        return {
            label: td(airline.name),
            data: calculateRadarScores(airline),
            borderColor: color.border,
            backgroundColor: color.bg,
            borderWidth: 2,
            pointBackgroundColor: color.border,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4
        };
    });
    
    radarChart.update();
}
// ===== Airline Selector =====
function renderAirlineSelector() {
    const sorted = [...AppState.airlines].sort((a, b) => b.safetyRating - a.safetyRating);
    const container = document.getElementById('airlineList');
    if (!container) return;
    
    container.innerHTML = sorted.map(airline => `
        <label class="airline-checkbox">
            <input type="checkbox" value="${airline.id}" ${selectedAirlines.includes(airline.id) ? 'checked' : ''}>
            <span class="checkbox-custom"></span>
            <img src="${getAirlineLogo(airline.name)}" class="airline-logo-icon" alt="${td(airline.name)} logo" loading="lazy">
            <span class="airline-name">${td(airline.name)} <span class="airline-iata-code">${getAirlineIATA(airline.name)}</span></span>
            <span class="airline-score ${getScoreClass(airline.safetyRating)}">${airline.safetyRating}</span>
        </label>
    `).join('');
    
    // Add change handlers
    container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = e.target.value;
            
            if (e.target.checked) {
                if (selectedAirlines.length >= MAX_SELECTED) {
                    e.target.checked = false;
                    return;
                }
                selectedAirlines.push(id);
            } else {
                selectedAirlines = selectedAirlines.filter(a => a !== id);
            }
            
            updateRadarChart();
        });
    });
}
function updateAirlineCheckboxes() {
    document.querySelectorAll('#airlineList input[type="checkbox"]').forEach(cb => {
        cb.checked = selectedAirlines.includes(cb.value);
    });
}
// ===== Rating Table =====
function renderRatingTable() {
    const sorted = [...AppState.airlines].sort((a, b) => b.safetyRating - a.safetyRating);
    const tbody = document.getElementById('ratingTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = sorted.map((airline, index) => {
        const rank = index + 1;
        const scoreClass = getScoreClass(airline.safetyRating);
        const rankClass = getRankClass(rank);
        
        const website = getAirlineWebsite(airline.name);
        const websiteLink = website
            ? `<a href="${website}" target="_blank" rel="noopener noreferrer" class="airline-website-link" title="${t('rating.visitWebsite')}">
                   <img src="${getAirlineLogo(airline.name)}" class="airline-logo-icon" alt="${td(airline.name)} logo" loading="lazy">
                   <div class="airline-name-wrapper">
                       <strong>${td(airline.name)} <span class="airline-iata-code">${getAirlineIATA(airline.name)}</span>
                           <span class="external-link-icon" aria-hidden="true">↗</span>
                       </strong>
                       <span class="airline-founded">${t('rating.established')} ${airline.founded}</span>
                   </div>
               </a>`
            : `<img src="${getAirlineLogo(airline.name)}" class="airline-logo-icon" alt="${td(airline.name)} logo" loading="lazy">
               <div class="airline-name-wrapper">
                   <strong>${td(airline.name)} <span class="airline-iata-code">${getAirlineIATA(airline.name)}</span></strong>
                   <span class="airline-founded">${t('rating.established')} ${airline.founded}</span>
               </div>`;

        return `
            <tr>
                <td><span class="rank-badge ${rankClass}">${rank}</span></td>
                <td class="airline-name-cell">${websiteLink}</td>
                <td>${td(airline.country)}</td>
                <td class="score-cell">
                    <div class="score-bar-container">
                        <div class="score-bar ${scoreClass}" style="width: ${airline.safetyRating}%"></div>
                    </div>
                    <span class="score-value ${scoreClass}">${airline.safetyRating}</span>
                </td>
                <td>${airline.totalAccidents}</td>
                <td>${formatNumber(airline.totalFatalities)}</td>
                <td>
                    ${airline.iosaCertified 
                        ? '<span class="iosa-badge certified">✓ ' + t('common.yes') + '</span>' 
                        : '<span class="iosa-badge not-certified">✗ ' + t('common.no') + '</span>'}
                </td>
                <td>
                    <span class="trend-indicator ${airline.recentTrend}">
                        ${getTrendArrow(airline.recentTrend)} ${t('common.' + airline.recentTrend)}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}
// ===== Aircraft Chart =====
function initAircraftChart() {
    const ctx = document.getElementById('aircraftChart');
    if (!ctx) return;
    
    const defaults = getChartDefaults();
    
    aircraftChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: t('rating.fatalityRate'),
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1,
                borderRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#0066CC',
                    bodyColor: '#333333',
                    borderColor: 'rgba(0, 102, 204, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        afterLabel: function(context) {
                            const ac = AppState.aircraft.find(a => td(a.model) === context.label);
                            if (ac) {
                                return [
                                    t('rating.totalBuilt') + ': ' + formatNumber(ac.totalBuilt),
                                    t('rating.accidents') + ': ' + ac.accidents,
                                    t('rating.hullLosses') + ': ' + ac.hullLosses
                                ];
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: defaults.gridColor }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });
}
// 【绘制机型事故分布图】
function renderAircraftChart() {
    if (!aircraftChart) return;
    
    // Top 15 by fatality rate
    const sorted = [...AppState.aircraft]
        .sort((a, b) => b.fatalityRate - a.fatalityRate)
        .slice(0, 15);
    
    const labels = sorted.map(a => td(a.model));
    const data = sorted.map(a => a.fatalityRate);
    const bgColors = sorted.map(a => {
        if (a.fatalityRate >= 2.0) return 'rgba(255, 51, 68, 0.7)';
        if (a.fatalityRate >= 1.0) return 'rgba(255, 184, 0, 0.7)';
        if (a.fatalityRate >= 0.3) return 'rgba(168, 85, 247, 0.7)';
        return 'rgba(0, 102, 204, 0.7)';
    });
    const borderColors = sorted.map(a => {
        if (a.fatalityRate >= 2.0) return '#ff3344';
        if (a.fatalityRate >= 1.0) return '#ffb800';
        if (a.fatalityRate >= 0.3) return '#a855f7';
        return '#0066CC';
    });
    
    aircraftChart.data.labels = labels;
    aircraftChart.data.datasets[0].data = data;
    aircraftChart.data.datasets[0].backgroundColor = bgColors;
    aircraftChart.data.datasets[0].borderColor = borderColors;
    aircraftChart.update();
}