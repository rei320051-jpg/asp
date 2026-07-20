// ===== Data Loader Module =====
async function loadAllData() {
    try {
        const accidents = LocalDatabase.getAccidents();
        const airlines = LocalDatabase.getAirlines();
        const aircraft = LocalDatabase.getAircraft();
        
        AppState.accidents = accidents;
        AppState.airlines = airlines;
        AppState.aircraft = aircraft;
        AppState.filteredAccidents = [...accidents];
        
        populateFilterOptions();
        
        return { accidents, airlines, aircraft };
    } catch (error) {
        console.error('Failed to load data:', error);
        return { accidents: [], airlines: [], aircraft: [] };
    }
}
function populateFilterOptions() {
    const { accidents } = AppState;
    
    // Regions
    const regions = getUniqueValues(accidents, 'region');
    const regionSelect = document.getElementById('filter-region');
    if (regionSelect) {
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = td(region);
            regionSelect.appendChild(option);
        });
    }
    
    // Airlines
    const airlines = getUniqueValues(accidents, 'airline');
    const airlineSelect = document.getElementById('filter-airline');
    if (airlineSelect) {
        airlines.forEach(airline => {
            const option = document.createElement('option');
            option.value = airline;
            option.textContent = td(airline);
            airlineSelect.appendChild(option);
        });
    }
    
    // Aircraft models
    const aircraft = getUniqueValues(accidents, 'aircraft');
    const aircraftSelect = document.getElementById('filter-aircraft');
    if (aircraftSelect) {
        aircraft.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = td(model);
            aircraftSelect.appendChild(option);
        });
    }
    
    // Causes - tag filters
    const causes = getUniqueValues(accidents, 'cause');
    const causeContainer = document.getElementById('filter-causes');
    if (causeContainer) {
        causes.forEach(cause => {
            const tag = document.createElement('span');
            tag.className = 'filter-tag';
            tag.dataset.value = cause;
            tag.dataset.i18nKey = 'cause.' + cause;
            tag.textContent = t('cause.' + cause);
            tag.addEventListener('click', () => {
                tag.classList.toggle('active');
                updateFilterState();
            });
            causeContainer.appendChild(tag);
        });
    }
    
    // Phases - tag filters
    const phases = getUniqueValues(accidents, 'phase');
    const phaseContainer = document.getElementById('filter-phases');
    if (phaseContainer) {
        phases.forEach(phase => {
            const tag = document.createElement('span');
            tag.className = 'filter-tag';
            tag.dataset.value = phase;
            tag.dataset.i18nKey = 'phase.' + phase;
            tag.textContent = t('phase.' + phase);
            tag.addEventListener('click', () => {
                tag.classList.toggle('active');
                updateFilterState();
            });
            phaseContainer.appendChild(tag);
        });
    }
    
    // Year range slider
    const years = accidents.map(a => getYearFromDate(a.date));
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    
    const yearMin = document.getElementById('year-min');
    const yearMax = document.getElementById('year-max');
    const yearMinVal = document.getElementById('year-min-val');
    const yearMaxVal = document.getElementById('year-max-val');
    
    // Detect if a saved filter state exists (loaded by loadFilterState in common.js)
    const hasSavedState = !!sessionStorage.getItem('filterState');
    
    if (yearMin && yearMax) {
        yearMin.min = minYear;
        yearMin.max = maxYear;
        yearMax.min = minYear;
        yearMax.max = maxYear;
        // Only set defaults if no saved state; otherwise keep restored values
        if (!hasSavedState) {
            yearMin.value = minYear;
            yearMax.value = maxYear;
            AppState.filters.yearRange = [minYear, maxYear];
        }
        if (yearMinVal) yearMinVal.textContent = yearMin.value;
        if (yearMaxVal) yearMaxVal.textContent = yearMax.value;
    }
    
    // Fatality range slider
    const fatalities = accidents.map(a => a.fatalities);
    const maxFat = Math.max(...fatalities);
    
    const fatMin = document.getElementById('fat-min');
    const fatMax = document.getElementById('fat-max');
    const fatMinVal = document.getElementById('fat-min-val');
    const fatMaxVal = document.getElementById('fat-max-val');
    
    if (fatMin && fatMax) {
        fatMin.min = 0;
        fatMin.max = maxFat;
        fatMax.min = 0;
        fatMax.max = maxFat;
        // Only set defaults if no saved state; otherwise keep restored values
        if (!hasSavedState) {
            fatMin.value = 0;
            fatMax.value = maxFat;
            AppState.filters.fatalityRange = [0, maxFat];
        }
        if (fatMinVal) fatMinVal.textContent = fatMin.value;
        if (fatMaxVal) fatMaxVal.textContent = fatMax.value;
    }
    
    // Restore saved filter state to UI (if any)
    applyFilterStateToUI();
    
    // Apply current filter state to data (ensures initial render respects saved filters)
    applyFilters();
}
// ===== Apply AppState.filters back to UI elements =====
function applyFilterStateToUI() {
    const f = AppState.filters;
    
    // Multi-selects
    const setMultiSelect = (selectId, values) => {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        Array.from(sel.options).forEach(opt => {
            opt.selected = values.includes(opt.value);
        });
    };
    setMultiSelect('filter-region', f.regions);
    setMultiSelect('filter-airline', f.airlines);
    setMultiSelect('filter-aircraft', f.aircraftModels);
    
    // Tag filters
    document.querySelectorAll('#filter-causes .filter-tag').forEach(tag => {
        tag.classList.toggle('active', f.causes.includes(tag.dataset.value));
    });
    document.querySelectorAll('#filter-phases .filter-tag').forEach(tag => {
        tag.classList.toggle('active', f.phases.includes(tag.dataset.value));
    });
    
    // Year range sliders
    const yearMin = document.getElementById('year-min');
    const yearMax = document.getElementById('year-max');
    const yearMinVal = document.getElementById('year-min-val');
    const yearMaxVal = document.getElementById('year-max-val');
    if (yearMin && yearMax) {
        const lo = Math.max(parseInt(yearMin.min), f.yearRange[0]);
        const hi = Math.min(parseInt(yearMax.max), f.yearRange[1]);
        yearMin.value = lo;
        yearMax.value = hi;
        if (yearMinVal) yearMinVal.textContent = lo;
        if (yearMaxVal) yearMaxVal.textContent = hi;
    }
    
    // Fatality range sliders
    const fatMin = document.getElementById('fat-min');
    const fatMax = document.getElementById('fat-max');
    const fatMinVal = document.getElementById('fat-min-val');
    const fatMaxVal = document.getElementById('fat-max-val');
    if (fatMin && fatMax) {
        const lo = Math.max(parseInt(fatMin.min), f.fatalityRange[0]);
        const hi = Math.min(parseInt(fatMax.max), f.fatalityRange[1]);
        fatMin.value = lo;
        fatMax.value = hi;
        if (fatMinVal) fatMinVal.textContent = lo;
        if (fatMaxVal) fatMaxVal.textContent = hi;
    }
    
    // Keyword
    const keyword = document.getElementById('filter-keyword');
    if (keyword) keyword.value = f.keyword || '';
    
    // Update filter indicator based on whether any filter is non-default
    const hasActiveFilter = f.regions.length > 0 || f.airlines.length > 0 ||
        f.aircraftModels.length > 0 || f.causes.length > 0 || f.phases.length > 0 ||
        f.keyword !== '';
    AppState.filterActive = hasActiveFilter;
    const indicator = document.querySelector('.filter-indicator');
    if (indicator) indicator.classList.toggle('active', hasActiveFilter);
}
function updateFilterState() {
    // Get selected regions
    const regionSelect = document.getElementById('filter-region');
    if (regionSelect) {
        AppState.filters.regions = Array.from(regionSelect.selectedOptions).map(o => o.value);
    }
    
    // Get selected airlines
    const airlineSelect = document.getElementById('filter-airline');
    if (airlineSelect) {
        AppState.filters.airlines = Array.from(airlineSelect.selectedOptions).map(o => o.value);
    }
    
    // Get selected aircraft
    const aircraftSelect = document.getElementById('filter-aircraft');
    if (aircraftSelect) {
        AppState.filters.aircraftModels = Array.from(aircraftSelect.selectedOptions).map(o => o.value);
    }
    
    // Get active cause tags
    const causeTags = document.querySelectorAll('#filter-causes .filter-tag.active');
    AppState.filters.causes = Array.from(causeTags).map(t => t.dataset.value);
    
    // Get active phase tags
    const phaseTags = document.querySelectorAll('#filter-phases .filter-tag.active');
    AppState.filters.phases = Array.from(phaseTags).map(t => t.dataset.value);
    
    // Get year range
    const yearMin = document.getElementById('year-min');
    const yearMax = document.getElementById('year-max');
    if (yearMin && yearMax) {
        AppState.filters.yearRange = [parseInt(yearMin.value), parseInt(yearMax.value)];
    }
    
    // Get fatality range
    const fatMin = document.getElementById('fat-min');
    const fatMax = document.getElementById('fat-max');
    if (fatMin && fatMax) {
        AppState.filters.fatalityRange = [parseInt(fatMin.value), parseInt(fatMax.value)];
    }
    
    // Get keyword
    const keywordInput = document.getElementById('filter-keyword');
    if (keywordInput) {
        AppState.filters.keyword = keywordInput.value.toLowerCase();
    }
    
    // Check if any filter is active
    const f = AppState.filters;
    const yearMinEl = document.getElementById('year-min');
    const yearMaxEl = document.getElementById('year-max');
    AppState.filterActive = 
        f.regions.length > 0 ||
        f.airlines.length > 0 ||
        f.aircraftModels.length > 0 ||
        f.causes.length > 0 ||
        f.phases.length > 0 ||
        f.keyword !== '' ||
        (yearMinEl && f.yearRange[0] !== parseInt(yearMinEl.min)) ||
        (yearMaxEl && f.yearRange[1] !== parseInt(yearMaxEl.max));
    
    // Update indicator
    const indicator = document.querySelector('.filter-indicator');
    if (indicator) {
        indicator.classList.toggle('active', AppState.filterActive);
    }
    
    // Persist filter state to sessionStorage
    if (typeof saveFilterState === 'function') saveFilterState();
    
    // Apply filter
    applyFilters();
    
    // Trigger custom event for page-specific updates
    document.dispatchEvent(new CustomEvent('filtersUpdated'));
}
function applyFilters() {
    const { accidents, filters } = AppState;
    
    AppState.filteredAccidents = accidents.filter(accident => {
        const year = getYearFromDate(accident.date);
        
        // Region filter
        if (filters.regions.length > 0 && !filters.regions.includes(accident.region)) {
            return false;
        }
        
        // Airline filter
        if (filters.airlines.length > 0 && !filters.airlines.includes(accident.airline)) {
            return false;
        }
        
        // Aircraft filter
        if (filters.aircraftModels.length > 0 && !filters.aircraftModels.includes(accident.aircraft)) {
            return false;
        }
        
        // Cause filter
        if (filters.causes.length > 0 && !filters.causes.includes(accident.cause)) {
            return false;
        }
        
        // Phase filter
        if (filters.phases.length > 0 && !filters.phases.includes(accident.phase)) {
            return false;
        }
        
        // Year range
        if (year < filters.yearRange[0] || year > filters.yearRange[1]) {
            return false;
        }
        
        // Fatality range
        if (accident.fatalities < filters.fatalityRange[0] || accident.fatalities > filters.fatalityRange[1]) {
            return false;
        }
        
        return true;
    });
    
    if (filters.keyword) {
        AppState.filteredAccidents = advancedSearch(filters.keyword, AppState.filteredAccidents);
    }
}
function resetFilters() {
    // Reset selects
    ['filter-region', 'filter-airline', 'filter-aircraft'].forEach(id => {
        const select = document.getElementById(id);
        if (select) select.selectedIndex = -1;
    });
    
    // Reset tags
    document.querySelectorAll('.filter-tag.active').forEach(tag => {
        tag.classList.remove('active');
    });
    
    // Reset sliders
    const yearMin = document.getElementById('year-min');
    const yearMax = document.getElementById('year-max');
    if (yearMin) yearMin.value = yearMin.min;
    if (yearMax) yearMax.value = yearMax.max;
    
    const fatMin = document.getElementById('fat-min');
    const fatMax = document.getElementById('fat-max');
    if (fatMin) fatMin.value = fatMin.min;
    if (fatMax) fatMax.value = fatMax.max;
    
    // Update displays
    const yearMinVal = document.getElementById('year-min-val');
    const yearMaxVal = document.getElementById('year-max-val');
    if (yearMinVal && yearMin) yearMinVal.textContent = yearMin.min;
    if (yearMaxVal && yearMax) yearMaxVal.textContent = yearMax.max;
    
    const fatMinVal = document.getElementById('fat-min-val');
    const fatMaxVal = document.getElementById('fat-max-val');
    if (fatMinVal && fatMin) fatMinVal.textContent = fatMin.min;
    if (fatMaxVal && fatMax) fatMaxVal.textContent = fatMax.max;
    
    // Reset keyword
    const keyword = document.getElementById('filter-keyword');
    if (keyword) keyword.value = '';
    
    // Update state
    updateFilterState();
}
// ===== Slider Event Listeners =====
function initSliderListeners() {
    // Year sliders
    const yearMin = document.getElementById('year-min');
    const yearMax = document.getElementById('year-max');
    const yearMinVal = document.getElementById('year-min-val');
    const yearMaxVal = document.getElementById('year-max-val');
    
    if (yearMin && yearMax) {
        yearMin.addEventListener('input', () => {
            if (parseInt(yearMin.value) > parseInt(yearMax.value)) {
                yearMin.value = yearMax.value;
            }
            if (yearMinVal) yearMinVal.textContent = yearMin.value;
            updateFilterState();
        });
        
        yearMax.addEventListener('input', () => {
            if (parseInt(yearMax.value) < parseInt(yearMin.value)) {
                yearMax.value = yearMin.value;
            }
            if (yearMaxVal) yearMaxVal.textContent = yearMax.value;
            updateFilterState();
        });
    }
    
    // Fatality sliders
    const fatMin = document.getElementById('fat-min');
    const fatMax = document.getElementById('fat-max');
    const fatMinVal = document.getElementById('fat-min-val');
    const fatMaxVal = document.getElementById('fat-max-val');
    
    if (fatMin && fatMax) {
        fatMin.addEventListener('input', () => {
            if (parseInt(fatMin.value) > parseInt(fatMax.value)) {
                fatMin.value = fatMax.value;
            }
            if (fatMinVal) fatMinVal.textContent = fatMin.value;
            updateFilterState();
        });
        
        fatMax.addEventListener('input', () => {
            if (parseInt(fatMax.value) < parseInt(fatMin.value)) {
                fatMax.value = fatMin.value;
            }
            if (fatMaxVal) fatMaxVal.textContent = fatMax.value;
            updateFilterState();
        });
    }
    
    // Select elements
    ['filter-region', 'filter-airline', 'filter-aircraft'].forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.addEventListener('change', updateFilterState);
        }
    });
    
    // Keyword input
    const keyword = document.getElementById('filter-keyword');
    if (keyword) {
        keyword.addEventListener('input', debounce(updateFilterState, 300));
    }
    
    // Reset button
    const resetBtn = document.getElementById('filter-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Apply button (for UX, filters apply in real-time but button gives feedback)
    const applyBtn = document.getElementById('filter-apply');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            updateFilterState();
            // Close panel after apply
            document.querySelector('.filter-panel')?.classList.remove('open');
        });
    }
}
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initSliderListeners();
    
    // Listen for language changes to update filter options text
    document.addEventListener('languageChanged', () => {
        // Update region options text
        const regionSelect = document.getElementById('filter-region');
        if (regionSelect) {
            Array.from(regionSelect.options).forEach(opt => {
                opt.textContent = td(opt.value);
            });
        }
        // Update airline options text
        const airlineSelect = document.getElementById('filter-airline');
        if (airlineSelect) {
            Array.from(airlineSelect.options).forEach(opt => {
                opt.textContent = td(opt.value);
            });
        }
        // Update aircraft options text
        const aircraftSelect = document.getElementById('filter-aircraft');
        if (aircraftSelect) {
            Array.from(aircraftSelect.options).forEach(opt => {
                opt.textContent = td(opt.value);
            });
        }
        // Update cause/phase tags (handled by applyTranslations via data-i18n-key)
    });
});