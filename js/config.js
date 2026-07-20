// ===== Theme Configuration =====
export const ThemeConfig = {
    colors: {
        primary: '#0066CC',
        secondary: '#ff3344',
        accent: '#ffb800',
        success: '#00cc88',
        warning: '#ffb800',
        danger: '#ff3344',
        purple: '#a855f7',
        blue: '#3b82f6',
        gray: '#555566',
        lightGray: '#888899',
        white: '#ffffff',
        dark: '#1a1a2e'
    },
    chartColors: {
        accidents: '#0066CC',
        fatalities: '#ff3344',
        injured: '#ffb800',
        uninjured: '#00cc88',
        humanError: '#ffb800',
        mechanicalFailure: '#3b82f6',
        weather: '#a855f7',
        sabotage: '#ff3344',
        unknown: '#555566'
    },
    gradients: {
        primary: 'linear-gradient(135deg, #0066CC, #3b82f6)',
        danger: 'linear-gradient(135deg, #ff3344, #ff5566)',
        success: 'linear-gradient(135deg, #00cc88, #10b981)',
        warning: 'linear-gradient(135deg, #ffb800, #f59e0b)'
    },
    shadows: {
        card: '0 2px 12px rgba(0, 102, 204, 0.1)',
        hover: '0 4px 20px rgba(0, 102, 204, 0.15)',
        glow: '0 0 20px rgba(0, 102, 204, 0.3)'
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    },
    borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px'
    },
    animation: {
        duration: {
            fast: '200ms',
            normal: '300ms',
            slow: '500ms',
            page: '800ms'
        },
        easing: {
            easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }
    },
    zIndex: {
        tooltip: 100,
        modal: 200,
        dropdown: 300,
        overlay: 400
    }
};
// ===== Chart Configuration =====
export const ChartConfig = {
    defaults: {
        gridColor: 'rgba(0, 0, 0, 0.05)',
        responsive: true,
        maintainAspectRatio: false
    },
    tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#0066CC',
        bodyColor: '#333333',
        borderColor: 'rgba(0, 102, 204, 0.3)',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: "'Segoe UI', sans-serif", size: 11 }
    },
    legend: {
        boxWidth: 12,
        padding: 15,
        font: { size: 11 }
    }
};
// ===== Map Configuration =====
export const MapConfig = {
    zoom: {
        min: 0.5,
        max: 5,
        default: 1
    },
    accidentMarker: {
        thresholdLarge: 50,
        thresholdMedium: 10,
        sizeLarge: 5,
        sizeMedium: 3,
        sizeSmall: 2,
        hoverIncrease: 2,
        pulseRange: 3,
        hoverThreshold: 15
    },
    animation: {
        pulseSpeed: 0.02,
        sweepSpeed: 0.5,
        sweepWidth: 160
    }
};
// ===== Application Configuration =====
export const AppConfig = {
    data: {
        sources: ['ASN', 'NTSB', 'ICAO', 'BEA', 'Natural Earth'],
        timeRange: [1974, 2025],
        defaultItemsPerPage: 10
    },
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'zh']
    },
    storage: {
        filterKey: 'filterState',
        themeKey: 'theme',
        langKey: 'language'
    },
    debounce: {
        search: 300,
        resize: 200
    }
};