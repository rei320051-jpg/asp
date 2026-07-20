// ===== Table Page Logic =====
let currentPage = 1;
let pageSize = 10;
let sortField = 'date';
let sortDirection = 'desc';
let tableSearchTerm = '';
// ===== Initialize Table Page =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    initTableEvents();
    renderTable();
    
    // Check URL hash for accident ID and open detail modal
    checkHashAndOpenModal();
    
    // Listen for hash changes
    window.addEventListener('hashchange', checkHashAndOpenModal);
    
    // Listen for filter changes
    document.addEventListener('filtersUpdated', () => {
        currentPage = 1;
        renderTable();
    });
    
    // Listen for language changes
    document.addEventListener('languageChanged', () => {
        updatePageSizeOptions();
        renderTable();
    });
});

function checkHashAndOpenModal() {
    const hash = window.location.hash.slice(1);
    if (hash && hash.startsWith('ACC')) {
        const accident = AppState.accidents.find(a => a.id === hash);
        if (accident) {
            showDetailModal(accident);
        }
    }
}
function initTableEvents() {
    // Sort headers
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (sortField === field) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDirection = 'asc';
            }
            updateSortArrows();
            renderTable();
        });
    });
    
    // Pagination
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(getFilteredAndSearched().length / pageSize);
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
    }
    
    const pageSizeSelect = document.getElementById('pageSize');
    if (pageSizeSelect) {
        updatePageSizeOptions();
        pageSizeSelect.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value);
            currentPage = 1;
            renderTable();
        });
    }
    
    // Table search with autocomplete
    const searchInput = document.getElementById('table-search');
    if (searchInput) {
        initSearchAutocomplete(searchInput);
        searchInput.addEventListener('input', debounce((e) => {
            tableSearchTerm = e.target.value.toLowerCase();
            currentPage = 1;
            renderTable();
        }, 250));
    }
    
    // Export dropdown
    const exportBtn = document.getElementById('exportBtn');
    const exportMenu = document.querySelector('.export-menu');
    if (exportBtn) {
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportMenu.classList.toggle('open');
        });
        
        document.addEventListener('click', () => {
            exportMenu.classList.remove('open');
        });
        
        document.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                exportMenu.classList.remove('open');
                const format = option.dataset.format;
                if (format === 'csv') exportCSV();
                else if (format === 'excel') exportExcel();
                else if (format === 'json') exportJSON();
            });
        });
    }
}
function updateSortArrows() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
        const arrow = th.querySelector('.sort-arrow');
        if (!arrow) return;
        if (th.dataset.sort === sortField) {
            arrow.textContent = sortDirection === 'asc' ? '↑' : '↓';
            th.classList.add('sorted');
        } else {
            arrow.textContent = '↕';
            th.classList.remove('sorted');
        }
    });
}
function updatePageSizeOptions() {
    const pageSizeSelect = document.getElementById('pageSize');
    if (!pageSizeSelect) return;
    const perPage = t('table.perPage');
    Array.from(pageSizeSelect.options).forEach(opt => {
        opt.textContent = opt.value + perPage;
    });
}
function getFilteredAndSearched() {
    let data = [...AppState.filteredAccidents];
    
    // Apply table-level search
    if (tableSearchTerm) {
        data = data.filter(accident => {
            const searchStr = `${accident.airline} ${accident.flightNumber} ${accident.aircraft} ${accident.location} ${accident.country} ${accident.description}`.toLowerCase();
            return searchStr.includes(tableSearchTerm);
        });
    }
    
    // Sort
    data.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        
        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
            return valA > valB ? 1 : valA < valB ? -1 : 0;
        } else {
            return valA < valB ? 1 : valA > valB ? -1 : 0;
        }
    });
    
    return data;
}
function renderTable() {
    const data = getFilteredAndSearched();
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    
    // Clamp current page
    if (currentPage > totalPages) currentPage = totalPages;
    
    const startIdx = (currentPage - 1) * pageSize;
    const pageData = data.slice(startIdx, startIdx + pageSize);
    
    // Update result count
    const resultCountEl = document.getElementById('resultCount');
    if (resultCountEl) {
        resultCountEl.innerHTML = `<span>${data.length}</span> ${t('table.records')}`;
    }
    
    // Render table body
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    // Empty state
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="8">
                <div class="empty-state">
                    <div class="empty-state-icon" aria-hidden="true">⊘</div>
                    <div class="empty-state-text">${t('table.noResults')}</div>
                </div>
            </td></tr>
        `;
        renderPagination(totalPages);
        return;
    }
    
    tbody.innerHTML = pageData.map(accident => `
        <tr data-id="${accident.id}" class="clickable-row">
            <td class="date">${formatDate(accident.date)}</td>
            <td class="airline">${highlightSearchTerm(td(accident.airline), tableSearchTerm)}</td>
            <td>${highlightSearchTerm(accident.flightNumber, tableSearchTerm)}</td>
            <td>${highlightSearchTerm(td(accident.aircraft), tableSearchTerm)}</td>
            <td>${highlightSearchTerm(td(accident.location), tableSearchTerm)}, ${highlightSearchTerm(td(accident.country), tableSearchTerm)}</td>
            <td class="fatality-cell ${accident.fatalities > 50 ? 'high' : accident.fatalities > 0 ? 'medium' : 'low'}">
                ${accident.fatalities}
            </td>
            <td><span class="cause-badge ${getCauseClass(accident.cause)}">${t('cause.' + accident.cause)}</span></td>
            <td><span class="phase-tag">${t('phase.' + accident.phase)}</span></td>
        </tr>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.clickable-row').forEach(row => {
        row.addEventListener('click', () => {
            const id = row.dataset.id;
            const accident = AppState.accidents.find(a => a.id === id);
            if (accident) showDetailModal(accident);
        });
    });
    
    // Render pagination
    renderPagination(totalPages);
}
function renderPagination(totalPages) {
    const container = document.getElementById('pageNumbers');
    if (!container) return;
    
    let pages = [];
    
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push('...');
        
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
    }
    
    container.innerHTML = pages.map(p => {
        if (p === '...') {
            return '<span class="page-ellipsis">...</span>';
        }
        return `<button class="page-num ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }).join('');
    
    // Page number click handlers
    container.querySelectorAll('.page-num').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            renderTable();
        });
    });
    
    // Disable prev/next
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}
function showDetailModal(accident) {
    const content = `
        <div class="modal-aircraft-banner" style="background-image: url('images/modal-aircraft.jpg');">
            <div class="modal-aircraft-overlay">
                <span class="modal-aircraft-name">${td(accident.aircraft)}</span>
            </div>
        </div>
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-label">${t('table.flight')}</span>
                <span class="detail-value">${td(accident.airline)} ${accident.flightNumber}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${t('table.date')}</span>
                <span class="detail-value">${formatDate(accident.date)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${t('table.aircraft')}</span>
                <span class="detail-value">${td(accident.aircraft)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${t('table.location')}</span>
                <span class="detail-value">${td(accident.location)}, ${td(accident.country)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${t('filter.region')}</span>
                <span class="detail-value">${td(accident.region)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${t('tooltip.phase')}</span>
                <span class="detail-value">${t('phase.' + accident.phase)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${t('tooltip.cause')}</span>
                <span class="detail-value"><span class="cause-badge ${getCauseClass(accident.cause)}">${t('cause.' + accident.cause)}</span></span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${t('tooltip.fatalities')}</span>
                <span class="detail-value danger">${accident.fatalities}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${t('tooltip.injured')}</span>
                <span class="detail-value warning">${accident.injuries}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">${t('table.totalOccupants')}</span>
                <span class="detail-value">${accident.totalOccupants}</span>
            </div>
            ${accident.aircraftAge !== undefined ? `
            <div class="detail-item">
                <span class="detail-label">${t('table.aircraftAge')}</span>
                <span class="detail-value">${accident.aircraftAge} ${t('table.years')}</span>
            </div>
            ` : ''}
            ${accident.weather ? `
            <div class="detail-item">
                <span class="detail-label">${t('table.weather')}</span>
                <span class="detail-value">${td(accident.weather)}</span>
            </div>
            ` : ''}
            ${(accident.departure || accident.destination) ? `
            <div class="detail-item">
                <span class="detail-label">${t('table.route')}</span>
                <span class="detail-value">${accident.departure || '--'} → ${accident.destination || '--'}</span>
            </div>
            ` : ''}
            ${accident.investigationAgency ? `
            <div class="detail-item">
                <span class="detail-label">${t('table.investigationAgency')}</span>
                <span class="detail-value">${td(accident.investigationAgency)}</span>
            </div>
            ` : ''}
            <div class="detail-item full-width">
                <span class="detail-label">${t('table.description')}</span>
                <p class="detail-description">${td(accident.description)}</p>
            </div>
            ${accident.safetyActions ? `
            <div class="detail-item full-width">
                <span class="detail-label">${t('table.safetyActions')}</span>
                <p class="detail-description">${td(accident.safetyActions)}</p>
            </div>
            ` : ''}
            <div class="detail-item full-width">
                <span class="detail-label">${t('table.coordinates')}</span>
                <span class="detail-value">${accident.latitude.toFixed(4)}°, ${accident.longitude.toFixed(4)}°</span>
            </div>
            ${accident.sourceUrl ? `
            <div class="detail-item full-width">
                <span class="detail-label">${t('table.source')}</span>
                <a href="${accident.sourceUrl}" target="_blank" class="detail-link">${accident.sourceUrl}</a>
            </div>
            ` : ''}
        </div>
    `;
    
    showModal(`${td(accident.airline)} ${accident.flightNumber} - ${formatDate(accident.date)}`, content);
}
function exportCSV() {
    const data = getFilteredAndSearched();
    
    const headers = [t('table.date'), t('table.airline'), t('table.flight') + ' Number', t('table.aircraft'), t('table.location'), 'Country', t('filter.region'),
                     t('tooltip.fatalities'), t('tooltip.injured'), t('table.totalOccupants'), t('tooltip.phase'), t('tooltip.cause'), t('table.description')];
    
    const rows = data.map(a => [
        a.date,
        `"${td(a.airline)}"`,
        a.flightNumber,
        `"${td(a.aircraft)}"`,
        `"${td(a.location)}"`,
        `"${td(a.country)}"`,
        td(a.region),
        a.fatalities,
        a.injuries,
        a.totalOccupants,
        a.phase,
        a.cause,
        `"${a.description.replace(/"/g, '""')}"`
    ]);
    
    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `aviation-accidents-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    showToast(t('table.exportSuccess') || 'Export successful', 'success');
}

function exportExcel() {
    const data = getFilteredAndSearched();
    
    const headers = [t('table.date'), t('table.airline'), t('table.flight') + ' Number', t('table.aircraft'), t('table.location'), 'Country', t('filter.region'),
                     t('tooltip.fatalities'), t('tooltip.injured'), t('table.totalOccupants'), t('tooltip.phase'), t('tooltip.cause'), t('table.description')];
    
    const rows = data.map(a => [
        a.date,
        td(a.airline),
        a.flightNumber,
        td(a.aircraft),
        td(a.location),
        td(a.country),
        td(a.region),
        a.fatalities,
        a.injuries,
        a.totalOccupants,
        t('phase.' + a.phase),
        t('cause.' + a.cause),
        td(a.description)
    ]);
    
    let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#0066CC;color:white;}</style></head><body><table>';
    html += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    html += rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('');
    html += '</table></body></html>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `aviation-accidents-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    showToast(t('table.exportSuccess') || 'Export successful', 'success');
}

function exportJSON() {
    const data = getFilteredAndSearched();
    
    const exportData = data.map(a => ({
        id: a.id,
        date: a.date,
        airline: td(a.airline),
        flightNumber: a.flightNumber,
        aircraft: td(a.aircraft),
        location: td(a.location),
        country: td(a.country),
        region: td(a.region),
        latitude: a.latitude,
        longitude: a.longitude,
        fatalities: a.fatalities,
        injuries: a.injuries,
        totalOccupants: a.totalOccupants,
        phase: t('phase.' + a.phase),
        cause: t('cause.' + a.cause),
        weather: a.weather ? td(a.weather) : null,
        aircraftAge: a.aircraftAge,
        departure: a.departure,
        destination: a.destination,
        investigationAgency: a.investigationAgency ? td(a.investigationAgency) : null,
        description: td(a.description),
        safetyActions: a.safetyActions ? td(a.safetyActions) : null,
        sourceUrl: a.sourceUrl
    }));
    
    const metadata = {
        exportedAt: new Date().toISOString(),
        recordCount: exportData.length,
        dataSource: 'Aviation Safety Platform',
        sources: ['ASN', 'NTSB', 'ICAO', 'BEA', 'Natural Earth']
    };
    
    const json = JSON.stringify({ metadata, data: exportData }, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `aviation-accidents-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    showToast(t('table.exportSuccess') || 'Export successful', 'success');
}

// ===== Search Autocomplete =====
function initSearchAutocomplete(input) {
    let dropdown = document.createElement('div');
    dropdown.className = 'search-autocomplete';
    dropdown.style.display = 'none';
    input.parentNode.appendChild(dropdown);
    
    let selectedIndex = -1;
    
    function showSuggestions(term) {
        if (!term.trim()) {
            dropdown.style.display = 'none';
            return;
        }
        
        const lowerTerm = term.toLowerCase();
        const suggestions = [];
        const seen = new Set();
        
        AppState.accidents.forEach(accident => {
            const fields = [
                accident.airline,
                accident.flightNumber,
                accident.aircraft,
                accident.location,
                accident.country
            ];
            
            fields.forEach(field => {
                if (field && field.toLowerCase().includes(lowerTerm) && !seen.has(field)) {
                    seen.add(field);
                    suggestions.push({
                        value: field,
                        type: getSuggestionType(field, accident)
                    });
                }
            });
        });
        
        if (suggestions.length > 0) {
            dropdown.innerHTML = suggestions.slice(0, 6).map((s, i) => `
                <div class="autocomplete-item ${i === 0 ? 'highlighted' : ''}" data-value="${s.value}">
                    <span class="autocomplete-type">${s.type}</span>
                    <span class="autocomplete-text">${highlightText(s.value, term)}</span>
                </div>
            `).join('');
            dropdown.style.display = 'block';
            selectedIndex = -1;
        } else {
            dropdown.style.display = 'none';
        }
    }
    
    function getSuggestionType(value, accident) {
        if (accident.airline === value) return 'Airline';
        if (accident.flightNumber === value) return 'Flight';
        if (accident.aircraft === value) return 'Aircraft';
        if (accident.location === value) return 'Location';
        if (accident.country === value) return 'Country';
        return 'Other';
    }
    
    function highlightText(text, term) {
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    input.addEventListener('input', debounce((e) => {
        showSuggestions(e.target.value);
    }, 150));
    
    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.autocomplete-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateHighlight(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateHighlight(items);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            input.value = items[selectedIndex].dataset.value;
            tableSearchTerm = input.value.toLowerCase();
            currentPage = 1;
            renderTable();
            dropdown.style.display = 'none';
        } else if (e.key === 'Escape') {
            dropdown.style.display = 'none';
        }
    });
    
    function updateHighlight(items) {
        items.forEach((item, i) => {
            item.classList.toggle('highlighted', i === selectedIndex);
        });
    }
    
    dropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.autocomplete-item');
        if (item) {
            input.value = item.dataset.value;
            tableSearchTerm = input.value.toLowerCase();
            currentPage = 1;
            renderTable();
            dropdown.style.display = 'none';
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== input) {
            dropdown.style.display = 'none';
        }
    });
}

// ===== Highlight Search Results =====
function highlightSearchTerm(text, term) {
    if (!term || !text) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}