// ===== Common Utilities =====
const AppState = {
    accidents: [],
    airlines: [],
    aircraft: [],
    filteredAccidents: [],
    currentLang: 'en',
    filters: {
        regions: [],
        countries: [],
        yearRange: [1974, 2025],
        airlines: [],
        aircraftModels: [],
        causes: [],
        fatalityRange: [0, 500],
        phases: [],
        keyword: ''
    },
    filterActive: false
};
// ===== Internationalization (i18n) =====
const i18n = {
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.dataTable': 'Data Table',
        'nav.airlineRating': 'Airline Rating',
        'nav.brand': 'AVIATION SAFETY',
        // Filter Panel
        'filter.region': 'Region',
        'filter.yearRange': 'Year Range',
        'filter.airline': 'Airline',
        'filter.aircraft': 'Aircraft',
        'filter.accidentCause': 'Accident Cause',
        'filter.flightPhase': 'Flight Phase',
        'filter.fatalityRange': 'Fatality Range',
        'filter.keywordSearch': 'Keyword Search',
        'filter.keywordPlaceholder': 'Search flights, locations...',
        'filter.resetAll': 'Reset All',
        'filter.applyFilter': 'Apply Filter',
        'filter.advancedFilters': 'ADVANCED FILTERS',
        // Dashboard
        'page.accidentOverview': 'ACCIDENT OVERVIEW',
        'page.accidentOverviewSub': 'Global aviation safety data visualization & analysis platform',
        'map.title': 'GLOBAL INCIDENT MAP',
        'map.subtitle': 'Scroll to zoom · Drag to pan · Hover for details',
        'map.loading': 'Loading world map',
        'map.zoomIn': 'Zoom in',
        'map.zoomOut': 'Zoom out',
        'map.resetView': 'Reset view',
        'pageTitle': 'Aviation Safety Analytics | Dashboard',
        'pageTitleTable': 'Aviation Safety Analytics | Data Table',
        'pageTitleRating': 'Aviation Safety Analytics | Airline Rating',
        'stats.dataRange': 'Data Range',
        'stats.regionsCovered': 'Regions Covered',
        'stats.airlinesTracked': 'Airlines Tracked',
        'stats.aircraftTypes': 'Aircraft Types',
        'card.totalAccidents': 'Total Accidents',
        'card.recordedIncidents': 'Recorded incidents',
        'card.totalFatalities': 'Total Fatalities',
        'card.cumulativeDeaths': 'Cumulative deaths',
        'card.safestYear': 'Safest Year',
        'card.lowestAccidentCount': 'Lowest accident count',
        'card.highRiskAirline': 'High Risk Airline',
        'card.mostIncidents': 'Most incidents',
        'chart.accidentTrend': 'Accident Trend',
        'chart.causeDistribution': 'Cause Distribution',
        'chart.fatalitiesByAirline': 'Fatalities by Airline (Top 10)',
        'chart.regionalDistribution': 'Regional Distribution',
        'chart.flightPhaseAnalysis': 'Flight Phase Analysis',
        'chart.survivalRateOverview': 'Survival Rate Overview',
        'chart.fatal': 'Fatal',
        'chart.injured': 'Injured',
        'chart.uninjured': 'Uninjured',
        // Tooltip
        'tooltip.date': 'Date',
        'tooltip.location': 'Location',
        'tooltip.aircraft': 'Aircraft',
        'tooltip.fatalities': 'Fatalities',
        'tooltip.injured': 'Injured',
        'tooltip.survival': 'Survival',
        'tooltip.cause': 'Cause',
        'tooltip.phase': 'Phase',
        // Data Table
        'page.accidentDatabase': 'ACCIDENT DATABASE',
        'page.accidentDatabaseSub': 'Comprehensive aviation accident records with detailed information',
        'hero.databaseTitle': 'Accident Database',
        'hero.databaseSub': 'Comprehensive Records from 1974 to Present',
        'table.quickSearch': 'Quick search: airline, flight, location...',
        'table.records': 'records',
        'table.export': 'Export',
        'table.exportCsv': 'Export CSV',
        'table.exportExcel': 'Export Excel',
        'table.exportJson': 'Export JSON',
        'table.exportSuccess': 'Export successful',
        'table.date': 'Date',
        'table.airline': 'Airline',
        'table.flight': 'Flight',
        'table.aircraft': 'Aircraft',
        'table.location': 'Location',
        'table.fatalities': 'Fatalities',
        'table.cause': 'Cause',
        'table.phase': 'Phase',
        'table.prev': '← Prev',
        'table.next': 'Next →',
        'table.perPage': '/ page',
        'table.totalOccupants': 'Total Occupants',
        'table.description': 'Description',
        'table.coordinates': 'Coordinates',
        'table.source': 'Source',
        'table.noResults': 'No accident records match the current filters. Try adjusting or resetting the filters.',
        'table.aircraftAge': 'Aircraft Age',
        'table.weather': 'Weather',
        'table.route': 'Route',
        'table.investigationAgency': 'Investigation Agency',
        'table.safetyActions': 'Safety Actions',
        'table.years': 'years',
        // Airline Rating
        'page.airlineSafetyRating': 'AIRLINE SAFETY RATING',
        'page.airlineSafetyRatingSub': 'Comprehensive safety rankings and multi-dimensional comparison',
        'hero.ratingTitle': 'Airline Safety Ratings',
        'hero.ratingSub': 'Multi-dimensional Analysis & Comparison',
        'rating.multiDimensionalComparison': 'Multi-Dimensional Safety Comparison',
        'rating.selectAirlines': 'Select Airlines to Compare',
        'rating.maxAirline': 'Max 5 airlines',
        'rating.safetyRankings': 'Safety Rankings',
        'rating.basedOnMetrics': 'Based on comprehensive safety metrics',
        'rating.rank': 'Rank',
        'rating.airline': 'Airline',
        'rating.country': 'Country',
        'rating.safetyScore': 'Safety Score',
        'rating.accidents': 'Accidents',
        'rating.fatalities': 'Fatalities',
        'rating.iosaCertified': 'IOSA Certified',
        'rating.trend': 'Trend',
        'rating.fleetSize': 'Fleet Size',
        'rating.experience': 'Experience',
        'rating.lowFatalities': 'Low Fatalities',
        'rating.improvingTrend': 'Improving Trend',
        'rating.fatalityRate': 'Fatality Rate',
        'rating.totalBuilt': 'Total Built',
        'rating.hullLosses': 'Hull Losses',
        'rating.established': 'Est.',
        'rating.visitWebsite': 'Visit official website',
        'rating.aircraftFatalityRate': 'Aircraft Fatality Rate by Model',
        'rating.aircraftComparison': 'Aircraft Comparison',
        'rating.aircraftComparisonDesc': 'Modern commercial airliners comparison',
        'rating.externalResources': 'External Safety Resources',
        'rating.icaoDesc': 'International Civil Aviation Organization',
        'rating.iasaDesc': 'International Aviation Safety Assessment',
        'rating.airsafeDesc': 'Airline Safety & Fatal Event Rates',
        'rating.ntsbDesc': 'National Transportation Safety Board',
        'rating.beaDesc': 'Bureau of Enquiry & Analysis for Civil Aviation',
        'rating.asnDesc': 'Aviation Safety Network Database',
        // Aircraft Comparison
        'nav.safetyKnowledge': 'Safety Knowledge',
        'nav.aircraftCompare': 'Aircraft Compare',
        'pageTitleCompare': 'Aviation Safety Analytics | Aircraft Comparison',
        'page.aircraftComparison': 'AIRCRAFT COMPARISON',
        'page.aircraftComparisonSub': 'Comparative analysis of aircraft type safety performance',
        'compare.selectAircraft': 'Select Aircraft to Compare',
        'compare.aircraftA': 'Aircraft A',
        'compare.aircraftB': 'Aircraft B',
        'compare.overview': 'Comparison Overview',
        'compare.specs': 'Specifications',
        'compare.safetyStats': 'Safety Statistics',
        'compare.capacity': 'Passenger Capacity',
        'compare.pax': ' pax',
        'compare.cargoOnly': 'Cargo Only',
        'compare.length': 'Length',
        'compare.wingspan': 'Wingspan',
        'compare.range': 'Range',
        'compare.cruiseSpeed': 'Cruise Speed',
        'compare.engines': 'Engines',
        'compare.manufacturer': 'Manufacturer',
        'compare.firstFlight': 'First Flight',
        'compare.serviceYears': 'Service Years',
        'compare.totalBuilt': 'Total Built',
        'compare.accidents': 'Accidents',
        'compare.hullLosses': 'Hull Losses',
        'compare.fatalityRate': 'Fatality Rate',
        'compare.radarTitle': 'Multi-Dimensional Radar Comparison',
        'compare.radarSubtitle': 'Normalized metrics across 5 dimensions',
        'compare.barTitle': 'Accidents & Hull Losses Comparison',
        'compare.barSubtitle': 'Side-by-side accident statistics',
        'compare.safetyScoreTitle': 'Safety Score',
        'compare.safetyScoreSubtitle': 'Calculated from fatality rate and accident count',
        'compare.accidentListTitle': 'Major Accidents',
        'compare.accidentListSubtitle': 'Top 5 accidents by fatalities',
        'compare.noAccidents': 'No accident records found',
        'compare.date': 'Date',
        'compare.airline': 'Airline',
        'compare.location': 'Location',
        'compare.fatalities': 'Fatalities',
        'compare.vs': 'VS',
        'compare.totalBuiltShort': 'Total Built',
        'compare.accidentsShort': 'Accidents',
        'compare.hullLossesShort': 'Hull Losses',
        'compare.fatalityRateShort': 'Fatality Rate × 100',
        'compare.serviceYearsShort': 'Service Years',
        // Safety Knowledge
        'pageTitleKnowledge': 'Aviation Safety Analytics | Safety Knowledge',
        'page.safetyKnowledge': 'SAFETY KNOWLEDGE',
        'page.safetyKnowledgeSub': 'Comprehensive aviation safety education and awareness',
        'knowledge.introTitle': 'Understanding Aviation Safety',
        'knowledge.introDesc': 'Aviation is one of the safest modes of transportation. Learn about safety protocols, emergency procedures, and risk mitigation strategies.',
        'knowledge.safetyRate': 'Safety Rate',
        'knowledge.fatalAccidentsPerMillion': 'Fatal Accidents per Million Flights',
        'knowledge.deathsPerBillionMiles': 'Deaths per Billion Passenger Miles',
        'knowledge.emergencySurvivalRate': 'Emergency Survival Rate',
        'knowledge.learnMore': 'Learn More',
        'knowledge.flightPhaseTitle': 'Flight Phase Safety',
        'knowledge.flightPhaseDesc': 'Safety considerations during different flight phases',
        'knowledge.preflight': 'Pre-Flight',
        'knowledge.preflight1': 'Pilot briefings and crew coordination',
        'knowledge.preflight2': 'System checks and weather review',
        'knowledge.preflight3': 'Emergency equipment verification',
        'knowledge.preflight4': 'Passenger safety briefing',
        'knowledge.takeoff': 'Takeoff',
        'knowledge.takeoff1': 'Keep seatbelt fastened until cruising',
        'knowledge.takeoff2': 'Store all loose items securely',
        'knowledge.takeoff3': 'Follow crew instructions immediately',
        'knowledge.takeoff4': 'Be aware of emergency exits',
        'knowledge.cruise': 'Cruise',
        'knowledge.cruise1': 'Maintain awareness of exit locations',
        'knowledge.cruise2': 'Keep seatbelt loosely fastened',
        'knowledge.cruise3': 'Follow turbulence procedures',
        'knowledge.cruise4': 'Review safety card if time permits',
        'knowledge.descent': 'Descent & Landing',
        'knowledge.descent1': 'Stow tray tables and raise seatbacks',
        'knowledge.descent2': 'Secure all carry-on items',
        'knowledge.descent3': 'Return to seat and fasten seatbelt',
        'knowledge.descent4': 'Prepare for landing impact',
        'knowledge.checklistTitle': 'Pre-Flight Safety Checklist',
        'knowledge.checklistDesc': 'Before boarding, ensure your safety preparedness',
        'knowledge.check1': 'Locate your nearest emergency exit',
        'knowledge.check1Desc': 'Count the rows between you and the exit',
        'knowledge.check2': 'Read the safety briefing card',
        'knowledge.check2Desc': 'Familiarize yourself with safety equipment locations',
        'knowledge.check3': 'Secure your personal items',
        'knowledge.check3Desc': 'Store bags under seats or in overhead bins',
        'knowledge.check4': 'Fasten seatbelt correctly',
        'knowledge.check4Desc': 'Adjust to fit snugly across your lap',
        'knowledge.check5': 'Know brace position',
        'knowledge.check5Desc': 'Practice the brace position before takeoff',
        'knowledge.check6': 'Turn on flight mode',
        'knowledge.check6Desc': 'Prevent potential interference with navigation',
        'knowledge.faqTitle': 'Frequently Asked Questions',
        'knowledge.faqDesc': 'Common questions about aviation safety',
        'knowledge.faqQ1': 'What is the safest seat on a plane?',
        'knowledge.faqA1': 'Studies suggest that seats near the exit rows or at the back of the plane may have slightly higher survival rates. However, the most important factor is following crew instructions and being prepared for emergencies.',
        'knowledge.faqQ2': 'How often do planes undergo maintenance?',
        'knowledge.faqA2': 'Commercial aircraft undergo routine maintenance every 200-300 flight hours or every 30 days, whichever comes first. Major inspections occur at regular intervals based on manufacturer recommendations and regulatory requirements.',
        'knowledge.faqQ3': 'Is it safe to fly during thunderstorms?',
        'knowledge.faqA3': 'Modern aircraft are designed to withstand lightning strikes and turbulence. Pilots receive real-time weather updates and will either fly around storms or delay takeoff/landing until conditions improve.',
        'knowledge.faqQ4': 'What happens if there is an engine failure?',
        'knowledge.faqA4': 'Commercial jets can safely fly with just one engine. Pilots are trained to handle engine failures and will divert to the nearest suitable airport. The remaining engine provides sufficient power for a safe landing.',
        'knowledge.faqQ5': 'Why do we need to put our seats upright for takeoff and landing?',
        'knowledge.faqA5': 'Upright seats allow passengers behind you to exit more quickly in an emergency. They also help maintain the structural integrity of the cabin and provide better protection in case of sudden deceleration.',
        'knowledge.faqQ6': 'Why must electronic devices be in flight mode?',
        'knowledge.faqA6': 'Electronic devices emit electromagnetic signals that may interfere with aircraft navigation and communication systems. Flight mode disables wireless transmissions while allowing you to use your device. Modern aircraft are better shielded, but flight mode remains a regulatory requirement as a precaution.',
        'knowledge.faqQ7': 'How do oxygen masks work and when are they deployed?',
        'knowledge.faqA7': 'Oxygen masks automatically deploy when cabin pressure drops below safe levels, typically above 14,000 feet. Pull the mask down firmly to start the oxygen flow, place it over your nose and mouth, and secure the elastic band. Always secure your own mask before helping others, including children.',
        'knowledge.faqQ8': 'What is clear-air turbulence and is it dangerous?',
        'knowledge.faqA8': 'Clear-air turbulence (CAT) occurs in cloudless skies, often near jet streams, and cannot be detected by radar. While unsettling, modern aircraft are built to withstand forces far exceeding any turbulence. Keeping your seatbelt fastened while seated is the best protection against unexpected turbulence injuries.',
        'knowledge.faqQ9': 'How are flight crews trained for emergencies?',
        'knowledge.faqA9': 'Pilots undergo rigorous recurrent training every six months in full-motion simulators, practicing engine failures, fires, decompression, and other emergencies. Cabin crew receive annual safety and evacuation training. All crew members must pass proficiency checks to maintain their qualifications.',
        'knowledge.faqQ10': 'What is the black box and how does it help improve safety?',
        'knowledge.faqA10': 'The "black box" consists of the Flight Data Recorder (FDR) and Cockpit Voice Recorder (CVR), both painted bright orange for visibility. They record flight parameters and cockpit audio, surviving crashes in crash-survivable memory units. Analysis of this data drives safety improvements across the entire aviation industry.',
        'knowledge.faqQ11': 'Why do accident counts spike in certain years?',
        'knowledge.faqA11': 'Spikes often reflect regulatory gaps, new technology adoption issues, or geopolitical events. For example, the 1970s saw high accident rates due to the rapid introduction of wide-body jets and less sophisticated weather radar. The 2014-2015 spike included MH370, MH17, and Germanwings—three unrelated rare events. Spikes drive industry-wide safety reviews.',
        'knowledge.faqQ12': 'How is the safety score calculated?',
        'knowledge.faqA12': 'Safety scores combine multiple weighted factors: fatality rate per million flights (40%), accident frequency over 10 years (25%), IOSA certification status (15%), fleet modernization (10%), and trend direction (10%). No single metric determines the score—a carrier with rare but severe accidents may still score well if overall operations are sound.',
        'knowledge.faqQ13': 'Why does IOSA certification matter?',
        'knowledge.faqA13': 'The IATA Operational Safety Audit (IOSA) is a globally recognized safety standard. Airlines must pass rigorous audits covering organization, flight operations, and maintenance. Statistics show IOSA-registered airlines have a 4-5x lower accident rate than non-IOSA carriers. Major alliances require IOSA for membership.',
        'knowledge.faqQ14': "What's the difference between accident rate and fatality rate?",
        'knowledge.faqA14': 'Accident rate counts incidents per million departures regardless of severity. Fatality rate counts deaths per billion passenger-kilometers. A regional airline with many minor incidents may have a high accident rate but low fatality rate, while a carrier with one catastrophic event shows the opposite pattern. Both metrics together give a complete picture.',
        'knowledge.faqQ15': 'Why were the 1970s-1980s so much more dangerous than today?',
        'knowledge.faqA15': 'Several factors: (1) Cockpit Resource Management (CRM) was not standardized until after Tenerife 1977; (2) Ground Proximity Warning Systems (GPWS) only became mandatory in the 1980s, eliminating many CFIT accidents; (3) Weather radar and wind shear detection were primitive; (4) Aircraft reliability was lower. Each major accident drove specific safety improvements that cumulatively reduced fatal accident rates by over 80%.',
        'knowledge.timelineTitle': 'Aviation Safety Milestones',
        'knowledge.timelineDesc': 'Key events that shaped modern aviation safety',
        'knowledge.t1944Title': 'Chicago Convention & ICAO Established',
        'knowledge.t1944Desc': '52 nations signed the Convention on International Civil Aviation, establishing the International Civil Aviation Organization (ICAO) to set global aviation standards.',
        'knowledge.t1958Title': 'FAA Established',
        'knowledge.t1958Desc': 'The Federal Aviation Act created the Federal Aviation Agency (later FAA) in the United States, centralizing civil aviation regulation after a series of mid-air collisions.',
        'knowledge.t1977Title': 'Tenerife Disaster',
        'knowledge.t1977Desc': 'The deadliest accident in aviation history (583 fatalities) led to major changes in CRM (Crew Resource Management) and standardized English aviation phraseology.',
        'knowledge.t1996Title': 'Aviation Safety Action Program (ASAP)',
        'knowledge.t1996Desc': 'FAA launched ASAP to encourage voluntary reporting of safety issues by employees without fear of punishment, fundamentally changing safety culture.',
        'knowledge.t2003Title': 'EASA Established',
        'knowledge.t2003Desc': 'The European Union Aviation Safety Agency was founded to unify safety regulation across EU member states, replacing national Joint Aviation Authorities.',
        'knowledge.t2013Title': 'ICAO Mandates SMS',
        'knowledge.t2013Desc': 'ICAO Annex 19 required Safety Management Systems (SMS) for airlines and airports, shifting from reactive investigation to proactive risk management.',
        'knowledge.t2017Title': 'GADSS Proposed',
        'knowledge.t2017Desc': 'After MH370 disappearance, ICAO proposed the Global Aeronautical Distress and Safety System (GADSS), requiring autonomous distress tracking for commercial aircraft.',
        'knowledge.t2019Title': 'Boeing 737 MAX Grounding',
        'knowledge.t2019Desc': 'After two fatal accidents (Lion Air JT610 and Ethiopian ET302), the 737 MAX was grounded worldwide, prompting reviews of aircraft certification and MCAS software.',
        'knowledge.t2024Title': 'GADS & Next-Gen Safety',
        'knowledge.t2024Desc': "ICAO's Global Aviation Data System (GADS) aggregates safety data worldwide, enabling predictive analytics and data-driven safety improvements across the industry.",
        'knowledge.accidentByPhase': 'Accidents by Flight Phase',
        'knowledge.accidentByPhaseDesc': 'Distribution of accidents across different flight phases',
        'knowledge.safetyStatsTitle': 'Safety Statistics',
        'knowledge.safetyStatsDesc': 'Facts and figures about aviation safety',
        'knowledge.safetyMythsTitle': 'Safety Myths & Facts',
        'knowledge.safetyMythsDesc': 'Debunk common misconceptions about air travel',
        'knowledge.emergencyTitle': 'Emergency Procedures',
        'knowledge.emergencyDesc': 'What to do in different emergency situations',
        'knowledge.airlineSafetyTitle': 'Airline Safety Standards',
        'knowledge.airlineSafetyDesc': 'Global safety regulations and certifications',
        'knowledge.cabinSafetyTitle': 'Cabin Safety',
        'knowledge.cabinSafetyDesc': 'Safety equipment and procedures on board',
        'knowledge.tip': 'Safety Tip',
        'knowledge.myth': 'Myth',
        'knowledge.fact': 'Fact',
        'knowledge.myth1': 'Turbulence can crash a plane',
        'knowledge.fact1': 'Modern aircraft are designed to withstand severe turbulence. Turbulence rarely causes structural damage.',
        'knowledge.myth2': 'Small planes are less safe than large jets',
        'knowledge.fact2': 'Safety depends on maintenance and pilot training, not size. Many small aircraft have excellent safety records.',
        'knowledge.myth3': 'Cell phones cause crashes',
        'knowledge.fact3': 'No documented evidence links cell phone use to crashes. Flight mode rules are about interference with navigation systems.',
        'knowledge.myth4': 'Oxygen masks provide unlimited oxygen',
        'knowledge.fact4': 'Oxygen masks provide about 15-20 minutes of oxygen, enough time for the plane to descend to a safe altitude.',
        'knowledge.myth5': 'Emergency landings mean certain death',
        'knowledge.fact5': 'Emergency landings have high survival rates. Crew training and safety equipment greatly increase chances of survival.',
        'knowledge.evacuation': 'Emergency Evacuation',
        'knowledge.evacuationDesc': 'In case of emergency, follow crew instructions immediately.',
        'knowledge.brace': 'Brace Position',
        'knowledge.braceDesc': 'The brace position reduces impact forces and protects vital organs.',
        'knowledge.oxygen': 'Oxygen System',
        'knowledge.oxygenDesc': 'Drop-down oxygen masks deploy automatically if cabin pressure drops.',
        'knowledge.lifeJacket': 'Life Jacket',
        'knowledge.lifeJacketDesc': 'Life jackets are located under your seat. Don\'t inflate until outside the aircraft.',
        'knowledge.exitRow': 'Exit Row Responsibilities',
        'knowledge.exitRowDesc': 'If seated in an exit row, you must be able to operate the emergency exit.',
        'knowledge.icao': 'ICAO Standards',
        'knowledge.icaoDesc': 'International Civil Aviation Organization sets global safety standards.',
        'knowledge.faa': 'FAA Regulations',
        'knowledge.faaDesc': 'Federal Aviation Administration regulates US aviation safety.',
        'knowledge.easa': 'EASA Standards',
        'knowledge.easaDesc': 'European Union Aviation Safety Agency standards for Europe.',
        'knowledge.iosa': 'IOSA Certification',
        'knowledge.iosaDesc': 'IATA Operational Safety Audit - global airline safety certification.',
        'knowledge.seatbelt': 'Always Wear Your Seatbelt',
        'knowledge.seatbeltDesc': 'Keep your seatbelt fastened whenever seated, even when the seatbelt sign is off.',
        'knowledge.carryOn': 'Secure Carry-on Items',
        'knowledge.carryOnDesc': 'Loose items can become dangerous projectiles during turbulence.',
        'knowledge.aisle': 'Keep Aisles Clear',
        'knowledge.aisleDesc': 'Emergency exits and aisles must remain unobstructed at all times.',
        'knowledge.landing': 'Prepare for Landing',
        'knowledge.landingDesc': 'Stow tray tables, raise seat backs, and secure all personal items before landing.',
        // Data Source
        'dataSource.title': 'Data Sources',
        'dataSource.asnDesc': 'Accident database & statistics',
        'dataSource.ntsbDesc': 'Aviation accident investigations',
        'dataSource.icaoDesc': 'Global aviation standards & data',
        'dataSource.beaDesc': 'Civil aviation safety investigations',
        'dataSource.neDesc': 'Map vector data (public domain)',
        // Causes
        'cause.Human Error': 'Human Error',
        'cause.Mechanical Failure': 'Mechanical Failure',
        'cause.Weather': 'Weather',
        'cause.Sabotage': 'Sabotage',
        'cause.Unknown': 'Unknown',
        'cause.Hijacking': 'Hijacking',
        'cause.Bombing': 'Bombing',
        'cause.Shootdown': 'Shootdown',
        'cause.Bird Strike': 'Bird Strike',
        'cause.Fuel Exhaustion': 'Fuel Exhaustion',
        'cause.ATC Error': 'ATC Error',
        'cause.CFIT': 'CFIT',
        'cause.Cargo Fire': 'Cargo Fire',
        'cause.Loss of Control': 'Loss of Control',
        'cause.Severe Icing': 'Severe Icing',
        // Phases
        'phase.Takeoff': 'Takeoff',
        'phase.Landing': 'Landing',
        'phase.Cruise': 'Cruise',
        'phase.Taxi': 'Taxi',
        'phase.Parked': 'Parked',
        // Common
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.improving': 'Improving',
        'common.declining': 'Declining',
        'common.stable': 'Stable',
        'lang.switch': '中文'
    },
    zh: {
        // Navigation
        'nav.dashboard': '仪表盘',
        'nav.dataTable': '数据表格',
        'nav.airlineRating': '航空公司评级',
        'nav.brand': '航空安全分析',
        // Filter Panel
        'filter.region': '地区',
        'filter.yearRange': '年份范围',
        'filter.airline': '航空公司',
        'filter.aircraft': '机型',
        'filter.accidentCause': '事故原因',
        'filter.flightPhase': '飞行阶段',
        'filter.fatalityRange': '死亡人数范围',
        'filter.keywordSearch': '关键词搜索',
        'filter.keywordPlaceholder': '搜索航班、地点...',
        'filter.resetAll': '重置全部',
        'filter.applyFilter': '应用筛选',
        'filter.advancedFilters': '高级筛选',
        // Dashboard
        'page.accidentOverview': '事故概览',
        'page.accidentOverviewSub': '全球航空安全数据可视化与分析平台',
        'map.title': '全球事故地图',
        'map.subtitle': '滚轮缩放 · 拖动平移 · 悬停查看详情',
        'map.loading': '正在加载世界地图',
        'map.zoomIn': '放大',
        'map.zoomOut': '缩小',
        'map.resetView': '重置视图',
        'pageTitle': '航空安全分析平台 | 仪表盘',
        'pageTitleTable': '航空安全分析平台 | 数据表格',
        'pageTitleRating': '航空安全分析平台 | 航空公司评级',
        'stats.dataRange': '数据范围',
        'stats.regionsCovered': '覆盖地区',
        'stats.airlinesTracked': '追踪航司',
        'stats.aircraftTypes': '机型种类',
        'card.totalAccidents': '事故总数',
        'card.recordedIncidents': '已记录事故',
        'card.totalFatalities': '死亡人数',
        'card.cumulativeDeaths': '累计死亡',
        'card.safestYear': '最安全年份',
        'card.lowestAccidentCount': '事故数量最少',
        'card.highRiskAirline': '高风险航司',
        'card.mostIncidents': '事故数量最多',
        'chart.accidentTrend': '事故趋势',
        'chart.causeDistribution': '原因分布',
        'chart.fatalitiesByAirline': '航空公司死亡人数（前10名）',
        'chart.regionalDistribution': '地区分布',
        'chart.flightPhaseAnalysis': '飞行阶段分析',
        'chart.survivalRateOverview': '生存率概览',
        'chart.fatal': '死亡',
        'chart.injured': '受伤',
        'chart.uninjured': '未受伤',
        // Tooltip
        'tooltip.date': '日期',
        'tooltip.location': '地点',
        'tooltip.aircraft': '机型',
        'tooltip.fatalities': '死亡人数',
        'tooltip.injured': '受伤人数',
        'tooltip.survival': '生存率',
        'tooltip.cause': '原因',
        'tooltip.phase': '阶段',
        // Data Table
        'page.accidentDatabase': '事故数据库',
        'page.accidentDatabaseSub': '全面的航空事故记录及详细信息',
        'hero.databaseTitle': '事故数据库',
        'hero.databaseSub': '1974年至今的完整记录',
        'table.quickSearch': '快速搜索：航空公司、航班、地点...',
        'table.records': '条记录',
        'table.export': '导出',
        'table.exportCsv': '导出CSV',
        'table.exportExcel': '导出Excel',
        'table.exportJson': '导出JSON',
        'table.exportSuccess': '导出成功',
        'table.date': '日期',
        'table.airline': '航空公司',
        'table.flight': '航班号',
        'table.aircraft': '机型',
        'table.location': '地点',
        'table.fatalities': '死亡人数',
        'table.cause': '原因',
        'table.phase': '阶段',
        'table.prev': '← 上一页',
        'table.next': '下一页 →',
        'table.perPage': '条/页',
        'table.totalOccupants': '机上总人数',
        'table.description': '事件描述',
        'table.coordinates': '坐标',
        'table.source': '数据来源',
        'table.noResults': '没有符合当前筛选条件的事故记录。请调整或重置筛选条件。',
        'table.aircraftAge': '机龄',
        'table.weather': '天气',
        'table.route': '航线',
        'table.investigationAgency': '调查机构',
        'table.safetyActions': '安全改进措施',
        'table.years': '年',
        // Airline Rating
        'page.airlineSafetyRating': '航空公司安全评级',
        'page.airlineSafetyRatingSub': '综合安全排名与多维度对比',
        'hero.ratingTitle': '航空公司安全评级',
        'hero.ratingSub': '多维度分析与对比',
        'rating.multiDimensionalComparison': '多维度安全对比',
        'rating.selectAirlines': '选择航空公司进行对比',
        'rating.maxAirline': '最多5家',
        'rating.safetyRankings': '安全排名',
        'rating.basedOnMetrics': '基于综合安全指标',
        'rating.rank': '排名',
        'rating.airline': '航空公司',
        'rating.country': '国家',
        'rating.safetyScore': '安全评分',
        'rating.accidents': '事故数',
        'rating.fatalities': '死亡人数',
        'rating.iosaCertified': 'IOSA认证',
        'rating.trend': '趋势',
        'rating.fleetSize': '机队规模',
        'rating.experience': '运营经验',
        'rating.lowFatalities': '低死亡率',
        'rating.improvingTrend': '趋势改善',
        'rating.fatalityRate': '死亡率',
        'rating.totalBuilt': '总生产数',
        'rating.hullLosses': '全机损失',
        'rating.established': '成立于',
        'rating.visitWebsite': '访问官方网站',
        'rating.aircraftFatalityRate': '机型事故死亡率',
        'rating.aircraftComparison': '机型对比',
        'rating.aircraftComparisonDesc': '现代商用客机对比',
        'rating.externalResources': '外部安全资源',
        'rating.icaoDesc': '国际民用航空组织',
        'rating.iasaDesc': '国际航空安全评估',
        'rating.airsafeDesc': '航空公司安全与致命事件率',
        'rating.ntsbDesc': '美国国家运输安全委员会',
        'rating.beaDesc': '法国民用航空调查与分析局',
        'rating.asnDesc': '航空安全网络数据库',
        // Aircraft Comparison
        'nav.safetyKnowledge': '安全知识',
        'nav.aircraftCompare': '机型对比',
        'pageTitleCompare': '航空安全分析平台 | 机型对比',
        'page.aircraftComparison': '机型对比分析',
        'page.aircraftComparisonSub': '不同机型安全性数据对比分析',
        'compare.selectAircraft': '选择机型进行对比',
        'compare.aircraftA': '机型 A',
        'compare.aircraftB': '机型 B',
        'compare.overview': '对比概要',
        'compare.specs': '规格参数',
        'compare.safetyStats': '安全统计',
        'compare.capacity': '载客量',
        'compare.pax': ' 人',
        'compare.cargoOnly': '仅货运',
        'compare.length': '机身长度',
        'compare.wingspan': '翼展',
        'compare.range': '航程',
        'compare.cruiseSpeed': '巡航速度',
        'compare.engines': '发动机数',
        'compare.manufacturer': '制造商',
        'compare.firstFlight': '首飞年份',
        'compare.serviceYears': '服役年限',
        'compare.totalBuilt': '总产量',
        'compare.accidents': '事故数',
        'compare.hullLosses': '全机损失',
        'compare.fatalityRate': '死亡率',
        'compare.radarTitle': '多维度雷达对比',
        'compare.radarSubtitle': '5项指标的标准化对比',
        'compare.barTitle': '事故数与全损数对比',
        'compare.barSubtitle': '并排事故统计',
        'compare.safetyScoreTitle': '安全评分',
        'compare.safetyScoreSubtitle': '根据死亡率和事故数计算',
        'compare.accidentListTitle': '重大事故',
        'compare.accidentListSubtitle': '按死亡人数排序的前5起事故',
        'compare.noAccidents': '未找到事故记录',
        'compare.date': '日期',
        'compare.airline': '航空公司',
        'compare.location': '地点',
        'compare.fatalities': '死亡人数',
        'compare.vs': '对比',
        'compare.totalBuiltShort': '总产量',
        'compare.accidentsShort': '事故数',
        'compare.hullLossesShort': '全损数',
        'compare.fatalityRateShort': '死亡率 × 100',
        'compare.serviceYearsShort': '服役年限',
        // Aircraft Models - 机型中文翻译
        'aircraft.AirbusA220-300': '空客 A220-300',
        'aircraft.AirbusA320': '空客 A320',
        'aircraft.AirbusA320neo': '空客 A320neo',
        'aircraft.AirbusA321': '空客 A321',
        'aircraft.AirbusA330-200': '空客 A330-200',
        'aircraft.AirbusA330-300': '空客 A330-300',
        'aircraft.AirbusA350-900': '空客 A350-900',
        'aircraft.AirbusA380-800': '空客 A380-800',
        'aircraft.AntonovAn-12': '安东诺夫 An-12',
        'aircraft.AntonovAn-148': '安东诺夫 An-148',
        'aircraft.Boeing737-200': '波音 737-200',
        'aircraft.Boeing737-800': '波音 737-800',
        'aircraft.Boeing737-900ER': '波音 737-900ER',
        'aircraft.Boeing737MAX8': '波音 737 MAX 8',
        'aircraft.Boeing737MAX9': '波音 737 MAX 9',
        'aircraft.Boeing757-200F': '波音 757-200F',
        'aircraft.Boeing777-200': '波音 777-200',
        'aircraft.Boeing777-300ER': '波音 777-300ER',
        'aircraft.Boeing787-9Dreamliner': '波音 787-9 梦想客机',
        'aircraft.BombardierCRJ-200': '庞巴迪 CRJ-200',
        'aircraft.COMACC919': '中国商飞 C919',
        'aircraft.deHavillandTwinOtter': '德哈维兰双水獭',
        'aircraft.Embraer190': '安博威 E190',
        'aircraft.EmbraerE190-E2': '安博威 E190-E2',
        'aircraft.Fokker100': '福克 100',
        // Safety Knowledge
        'pageTitleKnowledge': '航空安全分析平台 | 安全知识',
        'page.safetyKnowledge': '安全知识科普',
        'page.safetyKnowledgeSub': '全面的航空安全教育与意识提升',
        'knowledge.introTitle': '了解航空安全',
        'knowledge.introDesc': '航空是最安全的交通方式之一。了解安全规程、应急程序和风险缓解策略。',
        'knowledge.safetyRate': '安全率',
        'knowledge.fatalAccidentsPerMillion': '每百万航班致命事故数',
        'knowledge.deathsPerBillionMiles': '每十亿客运里程死亡数',
        'knowledge.emergencySurvivalRate': '紧急情况生存率',
        'knowledge.learnMore': '了解更多',
        'knowledge.flightPhaseTitle': '飞行阶段安全',
        'knowledge.flightPhaseDesc': '不同飞行阶段的安全注意事项',
        'knowledge.preflight': '起飞前',
        'knowledge.preflight1': '飞行员简报和机组协调',
        'knowledge.preflight2': '系统检查和天气审查',
        'knowledge.preflight3': '应急设备验证',
        'knowledge.preflight4': '乘客安全简报',
        'knowledge.takeoff': '起飞',
        'knowledge.takeoff1': '巡航前保持系好安全带',
        'knowledge.takeoff2': '妥善存放所有松散物品',
        'knowledge.takeoff3': '立即遵循机组指令',
        'knowledge.takeoff4': '了解紧急出口位置',
        'knowledge.cruise': '巡航',
        'knowledge.cruise1': '保持对出口位置的警觉',
        'knowledge.cruise2': '安全带保持松弛系紧',
        'knowledge.cruise3': '遵循颠簸应对程序',
        'knowledge.cruise4': '如有时间复习安全卡',
        'knowledge.descent': '下降与着陆',
        'knowledge.descent1': '收起小桌板并调直座椅靠背',
        'knowledge.descent2': '固定所有随身物品',
        'knowledge.descent3': '返回座位并系好安全带',
        'knowledge.descent4': '准备着陆冲击',
        'knowledge.checklistTitle': '起飞前安全检查清单',
        'knowledge.checklistDesc': '登机前，确保您的安全准备',
        'knowledge.check1': '找到最近的紧急出口',
        'knowledge.check1Desc': '数一下您与出口之间的排数',
        'knowledge.check2': '阅读安全简报卡',
        'knowledge.check2Desc': '熟悉安全设备位置',
        'knowledge.check3': '固定个人物品',
        'knowledge.check3Desc': '将包放在座位下方或头顶行李架',
        'knowledge.check4': '正确系好安全带',
        'knowledge.check4Desc': '调整至贴身舒适的松紧度',
        'knowledge.check5': '了解防冲击姿势',
        'knowledge.check5Desc': '起飞前练习防冲击姿势',
        'knowledge.check6': '开启飞行模式',
        'knowledge.check6Desc': '防止干扰导航系统',
        'knowledge.faqTitle': '常见问题解答',
        'knowledge.faqDesc': '关于航空安全的常见问题',
        'knowledge.faqQ1': '飞机上最安全的座位在哪里？',
        'knowledge.faqA1': '研究表明，靠近出口排或飞机后部的座位可能有略高的生存率。然而，最重要的因素是遵循机组人员的指示并做好应急准备。',
        'knowledge.faqQ2': '飞机多久进行一次维护？',
        'knowledge.faqA2': '商用飞机每200-300飞行小时或每30天进行例行维护，以先到者为准。大型检查按制造商建议和法规要求定期进行。',
        'knowledge.faqQ3': '雷雨天气飞行安全吗？',
        'knowledge.faqA3': '现代飞机设计能够承受雷击和颠簸。飞行员会收到实时天气更新，并会绕过风暴或在条件改善前推迟起飞/降落。',
        'knowledge.faqQ4': '发动机故障会发生什么？',
        'knowledge.faqA4': '商用喷气式飞机可以仅用一台发动机安全飞行。飞行员接受过处理发动机故障的训练，并将转向最近的合适机场。剩余的发动机提供足够的动力进行安全降落。',
        'knowledge.faqQ5': '为什么起飞和降落时需要将座椅调直？',
        'knowledge.faqA5': '调直的座椅允许后排乘客在紧急情况下更快撤离。它们还有助于保持客舱的结构完整性，并在突然减速时提供更好的保护。',
        'knowledge.faqQ6': '为什么电子设备必须开启飞行模式？',
        'knowledge.faqA6': '电子设备发出的电磁信号可能干扰飞机的导航和通信系统。飞行模式会关闭无线传输功能，同时允许您继续使用设备。现代飞机的屏蔽能力更强，但飞行模式作为预防措施仍是法规要求。',
        'knowledge.faqQ7': '氧气面罩如何工作？何时会放下？',
        'knowledge.faqA7': '当客舱压力降至不安全水平（通常在14000英尺以上）时，氧气面罩会自动放下。用力向下拉面罩启动氧气流，将其罩在口鼻上并固定弹性带。请务必先为自己戴好面罩，再帮助他人（包括儿童）。',
        'knowledge.faqQ8': '什么是晴空颠簸？它危险吗？',
        'knowledge.faqA8': '晴空颠簸（CAT）出现在无云的天空中，通常靠近急流，雷达无法探测。虽然令人不安，但现代飞机的结构强度远超任何颠簸所产生的力。就座时系好安全带是防止意外颠簸受伤的最佳方法。',
        'knowledge.faqQ9': '机组人员如何接受应急培训？',
        'knowledge.faqA9': '飞行员每六个月在全动模拟器中进行严格的复训，演练发动机故障、火灾、失压等紧急情况。客舱机组每年接受安全和撤离培训。所有机组成员必须通过能力考核才能保持资质。',
        'knowledge.faqQ10': '什么是黑匣子？它如何帮助提升安全？',
        'knowledge.faqA10': '"黑匣子"由飞行数据记录器（FDR）和驾驶舱语音记录器（CVR）组成，两者均涂成亮橙色以便识别。它们记录飞行参数和驾驶舱音频，在抗坠毁存储单元中保存数据。对此类数据的分析推动了整个航空业的安全改进。',
        'knowledge.faqQ11': '为什么某些年份的事故数量会激增？',
        'knowledge.faqA11': '事故激增往往反映了监管空白、新技术应用问题或地缘政治事件。例如，1970年代因宽体客机快速引入和气象雷达不够先进，事故率较高。2014-2015年的激增包括MH370、MH17和德国之翼——三起互不相关的罕见事件。每次激增都会推动全行业安全审查。',
        'knowledge.faqQ12': '安全评级是如何计算的？',
        'knowledge.faqA12': '安全评级综合多个加权因素：每百万航班死亡率（40%）、10年内事故频率（25%）、IOSA认证状态（15%）、机队现代化程度（10%）和趋势方向（10%）。没有单一指标能决定评级——一家运营良好但偶发严重事故的航空公司仍可能获得较高评分。',
        'knowledge.faqQ13': '为什么IOSA认证很重要？',
        'knowledge.faqA13': 'IATA运行安全审计（IOSA）是全球认可的安全标准。航空公司必须通过涵盖组织、飞行操作和维修的严格审计。统计显示，IOSA注册航空公司的事故率比非IOSA航空公司低4-5倍。主要航空联盟要求成员必须通过IOSA认证。',
        'knowledge.faqQ14': '事故率和死亡率有什么区别？',
        'knowledge.faqA14': '事故率统计每百万次起飞的事件数，不考虑严重程度。死亡率统计每十亿客公里死亡人数。一家小型航司可能事故率高但死亡率低（多为轻微事件），而一家发生过灾难性事故的航司则呈现相反模式。两个指标结合才能给出完整图景。',
        'knowledge.faqQ15': '为什么1970-1980年代比今天危险得多？',
        'knowledge.faqA15': '原因包括：（1）直到1977年特内里费空难后，机组资源管理（CRM）才标准化；（2）地面近地警告系统（GPWS）1980年代才强制安装，消除了许多CFIT事故；（3）气象雷达和风切变探测原始；（4）飞机可靠性较低。每起重大事故都推动了特定安全改进，累计使致命事故率降低超过80%。',
        'knowledge.timelineTitle': '航空安全里程碑',
        'knowledge.timelineDesc': '塑造现代航空安全的关键事件',
        'knowledge.t1944Title': '芝加哥公约与国际民航组织成立',
        'knowledge.t1944Desc': '52个国家签署《国际民用航空公约》，成立国际民用航空组织（ICAO），制定全球航空标准。',
        'knowledge.t1958Title': '美国联邦航空局成立',
        'knowledge.t1958Desc': '《联邦航空法》在美国创立联邦航空局（后改为FAA），在一系列空中相撞事故后统一民航监管。',
        'knowledge.t1977Title': '特内里费空难',
        'knowledge.t1977Desc': '航空史上最严重事故（583人遇难）促使机组资源管理（CRM）重大改革，并标准化航空英语用语。',
        'knowledge.t1996Title': '航空安全行动计划（ASAP）',
        'knowledge.t1996Desc': 'FAA启动ASAP，鼓励员工自愿报告安全问题而不受处罚，从根本上改变了安全文化。',
        'knowledge.t2003Title': '欧洲航空安全局成立',
        'knowledge.t2003Desc': '欧盟航空安全局（EASA）成立，统一欧盟成员国的安全监管，取代各国联合航空当局。',
        'knowledge.t2013Title': 'ICAO强制要求SMS',
        'knowledge.t2013Desc': 'ICAO附件19要求航空公司和机场实施安全管理体系（SMS），从被动调查转向主动风险管理。',
        'knowledge.t2017Title': 'GADSS提出',
        'knowledge.t2017Desc': 'MH370失联后，ICAO提出全球航空遇险与安全系统（GADSS），要求商业飞机具备自主遇险追踪能力。',
        'knowledge.t2019Title': '波音737 MAX全球停飞',
        'knowledge.t2019Desc': '两起致命事故（狮航JT610和埃塞俄比亚航空ET302）后，737 MAX在全球停飞，引发飞机认证和MCAS软件审查。',
        'knowledge.t2024Title': 'GADS与下一代安全',
        'knowledge.t2024Desc': 'ICAO全球航空数据系统（GADS）聚合全球安全数据，支持预测性分析和数据驱动的安全改进。',
        'knowledge.accidentByPhase': '各飞行阶段事故分布',
        'knowledge.accidentByPhaseDesc': '不同飞行阶段的事故分布情况',
        'knowledge.safetyStatsTitle': '安全统计',
        'knowledge.safetyStatsDesc': '航空安全相关事实和数据',
        'knowledge.safetyMythsTitle': '安全误区与真相',
        'knowledge.safetyMythsDesc': '揭穿关于航空旅行的常见误解',
        'knowledge.emergencyTitle': '应急程序',
        'knowledge.emergencyDesc': '不同紧急情况下的应对措施',
        'knowledge.airlineSafetyTitle': '航空公司安全标准',
        'knowledge.airlineSafetyDesc': '全球安全法规与认证',
        'knowledge.cabinSafetyTitle': '客舱安全',
        'knowledge.cabinSafetyDesc': '机上安全设备与程序',
        'knowledge.tip': '安全提示',
        'knowledge.myth': '误区',
        'knowledge.fact': '真相',
        'knowledge.myth1': '颠簸会导致飞机坠毁',
        'knowledge.fact1': '现代飞机设计可承受严重颠簸。颠簸极少造成结构损坏。',
        'knowledge.myth2': '小型飞机比大型客机更不安全',
        'knowledge.fact2': '安全性取决于维护和飞行员训练，而非机型大小。许多小型飞机拥有出色的安全记录。',
        'knowledge.myth3': '手机会导致空难',
        'knowledge.fact3': '没有记录证据表明手机使用与空难有关。飞行模式规定是为了避免干扰导航系统。',
        'knowledge.myth4': '氧气面罩提供无限氧气',
        'knowledge.fact4': '氧气面罩提供约15-20分钟氧气，足够飞机下降到安全高度。',
        'knowledge.myth5': '紧急降落意味着必死无疑',
        'knowledge.fact5': '紧急降落的存活率很高。机组训练和安全设备大大提高了生存几率。',
        'knowledge.evacuation': '紧急撤离',
        'knowledge.evacuationDesc': '紧急情况下，请立即跟随机组人员指示行动。',
        'knowledge.brace': '防冲击姿势',
        'knowledge.braceDesc': '防冲击姿势可减少冲击力，保护重要器官。',
        'knowledge.oxygen': '氧气系统',
        'knowledge.oxygenDesc': '客舱失压时，自动落下的氧气面罩会自动展开。',
        'knowledge.lifeJacket': '救生衣',
        'knowledge.lifeJacketDesc': '救生衣位于座椅下方。在离开飞机前不要充气。',
        'knowledge.exitRow': '紧急出口座位责任',
        'knowledge.exitRowDesc': '如果坐在紧急出口座位，您必须能够操作紧急出口。',
        'knowledge.icao': 'ICAO标准',
        'knowledge.icaoDesc': '国际民用航空组织制定全球安全标准。',
        'knowledge.faa': 'FAA法规',
        'knowledge.faaDesc': '美国联邦航空管理局监管美国航空安全。',
        'knowledge.easa': 'EASA标准',
        'knowledge.easaDesc': '欧洲航空安全局为欧洲制定的标准。',
        'knowledge.iosa': 'IOSA认证',
        'knowledge.iosaDesc': '国际航协运行安全审计——全球航空公司安全认证。',
        'knowledge.seatbelt': '始终系好安全带',
        'knowledge.seatbeltDesc': '无论何时就座，请系好安全带，即使安全带指示灯已熄灭。',
        'knowledge.carryOn': '妥善放置随身物品',
        'knowledge.carryOnDesc': '飞行颠簸时，松散物品可能变成危险的抛射物。',
        'knowledge.aisle': '保持过道畅通',
        'knowledge.aisleDesc': '紧急出口和过道必须始终保持畅通。',
        'knowledge.landing': '准备降落',
        'knowledge.landingDesc': '降落前收起小桌板，调直座椅靠背，并妥善放置所有个人物品。',
        // Data Source
        'dataSource.title': '数据来源',
        'dataSource.asnDesc': '航空事故数据库与统计',
        'dataSource.ntsbDesc': '航空事故调查机构',
        'dataSource.icaoDesc': '全球航空标准与数据',
        'dataSource.beaDesc': '民用航空安全调查',
        'dataSource.neDesc': '地图矢量数据（公共领域）',
        // Causes
        'cause.Human Error': '人为失误',
        'cause.Mechanical Failure': '机械故障',
        'cause.Weather': '天气原因',
        'cause.Sabotage': '人为破坏',
        'cause.Unknown': '未知原因',
        'cause.Hijacking': '劫机',
        'cause.Bombing': '炸弹爆炸',
        'cause.Shootdown': '被击落',
        'cause.Bird Strike': '鸟击',
        'cause.Fuel Exhaustion': '燃油耗尽',
        'cause.ATC Error': '空管失误',
        'cause.CFIT': '受控飞行撞地',
        'cause.Cargo Fire': '货舱火灾',
        'cause.Loss of Control': '失去控制',
        'cause.Severe Icing': '严重结冰',
        // Phases
        'phase.Takeoff': '起飞',
        'phase.Landing': '降落',
        'phase.Cruise': '巡航',
        'phase.Taxi': '滑行',
        'phase.Parked': '停放',
        // Common
        'common.yes': '是',
        'common.no': '否',
        'common.improving': '改善',
        'common.declining': '恶化',
        'common.stable': '稳定',
        'lang.switch': 'English'
    }
};
// ===== Data Translation Dictionaries =====
// Separate from UI translations; keyed by the original English value
const i18nData = {
    en: {},  // English values are the keys themselves, no mapping needed
    zh: {
        // Regions
        'Africa': '非洲',
        'Asia': '亚洲',
        'Europe': '欧洲',
        'North America': '北美洲',
        'Oceania': '大洋洲',
        'South America': '南美洲',
        // Countries
        'Australia': '澳大利亚',
        'Brazil': '巴西',
        'Canada': '加拿大',
        'China': '中国',
        'Colombia': '哥伦比亚',
        'Costa Rica': '哥斯达黎加',
        'Cuba': '古巴',
        'Ethiopia': '埃塞俄比亚',
        'France': '法国',
        'Germany': '德国',
        'Greece': '希腊',
        'Hong Kong': '中国香港',
        'India': '印度',
        'Indonesia': '印度尼西亚',
        'Iran': '伊朗',
        'Ireland': '爱尔兰',
        'Japan': '日本',
        'Kazakhstan': '哈萨克斯坦',
        'Micronesia': '密克罗尼西亚',
        'Nepal': '尼泊尔',
        'Netherlands': '荷兰',
        'New Zealand': '新西兰',
        'Pakistan': '巴基斯坦',
        'Peru': '秘鲁',
        'Philippines': '菲律宾',
        'Russia': '俄罗斯',
        'Saudi Arabia': '沙特阿拉伯',
        'Singapore': '新加坡',
        'South Korea': '韩国',
        'Spain': '西班牙',
        'Suriname': '苏里南',
        'Thailand': '泰国',
        'UAE': '阿联酋',
        'Ukraine': '乌克兰',
        'United Kingdom': '英国',
        'United States': '美国',
        'Yugoslavia': '南斯拉夫',
        // Airlines (accident data)
        'Aeroflot': '俄罗斯航空',
        'Air Canada': '加拿大航空',
        'Air China': '中国国际航空',
        'Air France': '法国航空',
        'Air India': '印度航空',
        'Air India Express': '印度航空快运',
        'Air Niugini': '新几内亚航空',
        'Alaska Airlines': '阿拉斯加航空',
        'American Airlines': '美国航空',
        'Asiana Airlines': '韩亚航空',
        'Avianca': '哥伦比亚航空',
        'Azerbaijan Airlines': '阿塞拜疆航空',
        'Bek Air': '贝克航空',
        'British Airways / Inex-Adria': '英国航空 / 伊内克斯亚德里亚航空',
        'China Eastern Airlines': '中国东方航空',
        'China General Aviation': '中国通用航空',
        'Cubana de Aviación': '古巴航空',
        'DHL Aviation': 'DHL航空',
        'EgyptAir': '埃及航空',
        'Ethiopian Airlines': '埃塞俄比亚航空',
        'Garuda Indonesia': '印尼鹰航',
        'Germanwings': '德国之翼',
        'Hawaiian Airlines': '夏威夷航空',
        'Helios Airways': '赫利俄斯航空',
        'Iran Air': '伊朗航空',
        'Japan Airlines': '日本航空',
        'Jeju Air': '济州航空',
        'JetBlue Airways': '捷蓝航空',
        'KLM / Pan Am': '荷兰皇家航空 / 泛美航空',
        'KLM CityHopper': '荷兰皇家城市短途航空',
        'Korean Air': '大韩航空',
        'LATAM Airlines Brasil': '拉塔姆巴西航空',
        'LATAM Airlines Peru': '拉塔姆秘鲁航空',
        'LaMia': '拉米亚航空',
        'Lauda Air': '劳达航空',
        'Lion Air': '狮子航空',
        'Malaysia Airlines': '马来西亚航空',
        'Northwest Airlines': '西北航空',
        'Pakistan International Airlines': '巴基斯坦国际航空',
        'Pan Am': '泛美航空',
        'RusLine': '俄罗斯线航空',
        'Saratov Airlines': '萨拉托夫航空',
        'Saudi Arabian Airlines': '沙特阿拉伯航空',
        'Saudi Arabian Airlines / Kazakhstan Airlines': '沙特阿拉伯航空 / 哈萨克斯坦航空',
        'Surinam Airways': '苏里南航空',
        'Swissair': '瑞士航空',
        'TWA': '环球航空',
        'Tara Air': '塔拉航空',
        'Turkish Airlines': '土耳其航空',
        'USAir': '全美航空',
        'Ukraine Air Alliance': '乌克兰航空联盟',
        'Ukraine International Airlines': '乌克兰国际航空',
        'United Airlines': '联合航空',
        'Ural Airlines': '乌拉尔航空',
        'Utair': '乌塔航空',
        'Yeti Airlines': '雪人航空',
        'Voepass Linhas Aéreas': '沃帕斯航空',
        'China Northwest Airlines': '中国西北航空',
        'China Southwest Airlines': '中国西南航空',
        'Henan Airlines': '河南航空',
        'US Airways': '全美航空',
        'Xiamen Airlines': '厦门航空',
        'Sichuan Airlines': '四川航空',
        // Airline names (rating page)
        'Qantas Airways': '澳洲航空',
        'Air New Zealand': '新西兰航空',
        'Emirates': '阿联酋航空',
        'Etihad Airways': '阿提哈德航空',
        'Singapore Airlines': '新加坡航空',
        'British Airways': '英国航空',
        'Lufthansa': '汉莎航空',
        'Delta Air Lines': '达美航空',
        'Cathay Pacific': '国泰航空',
        'All Nippon Airways': '全日空',
        'Air China': '中国国际航空',
        'China Southern Airlines': '中国南方航空',
        'Hainan Airlines': '海南航空',
        'Xiamen Air': '厦门航空',
        'Sichuan Airlines': '四川航空',
        // Aircraft manufacturers & models
        'Boeing': '波音',
        'Airbus': '空客',
        'Embraer': '安博威',
        'Bombardier': '庞巴迪',
        'Antonov': '安东诺夫',
        'McDonnell Douglas': '麦道',
        'Fokker': '福克',
        'de Havilland': '德哈维兰',
        'Tupolev': '图波列夫',
        'Ilyushin': '伊留申',
        'Lockheed': '洛克希德',
        'Saab': '萨博',
        'Avro': '阿弗罗',
        'Xian': '西安',
        'Hawker Siddeley': '霍克·西德利',
        'Aérospatiale-BAC': '法宇航-BAC',
        'COMAC': '中国商飞',
        'Sukhoi': '苏霍伊',
        'ATR': 'ATR',
        'Boeing 737-800': '波音 737-800',
        'Boeing 737 MAX 8': '波音 737 MAX 8',
        'Boeing 737 MAX 9': '波音 737 MAX 9',
        'Boeing 777-200': '波音 777-200',
        'Boeing 777-200ER': '波音 777-200ER',
        'Boeing 777-300ER': '波音 777-300ER',
        'Boeing 757-200F': '波音 757-200F',
        'Boeing 757-223': '波音 757-223',
        'Boeing 737-900ER': '波音 737-900ER',
        'Boeing 737-200': '波音 737-200',
        'Boeing 737-300': '波音 737-300',
        'Boeing 737-3B7': '波音 737-3B7',
        'Airbus A320': '空客 A320',
        'Airbus A320neo': '空客 A320neo',
        'Airbus A320-211': '空客 A320-211',
        'Airbus A321': '空客 A321',
        'Airbus A330-200': '空客 A330-200',
        'Airbus A330-203': '空客 A330-203',
        'Airbus A330-300': '空客 A330-300',
        'Airbus A380-800': '空客 A380-800',
        'Airbus A300B2-203': '空客 A300B2-203',
        'Airbus A300B4-220': '空客 A300B4-220',
        'Bombardier CRJ-200': '庞巴迪 CRJ-200',
        'Embraer 190': '安博威 E190',
        'Embraer E190-E2': '安博威 E190-E2',
        'Airbus A220-300': '空客 A220-300',
        'de Havilland Twin Otter': '德哈维兰双水獭',
        'Antonov An-12': '安东诺夫 An-12',
        'Antonov An-148': '安东诺夫 An-148',
        'Fokker 100': '福克 100',
        'COMAC C919': '中国商飞 C919',
        'Boeing 787-9 Dreamliner': '波音 787-9 梦想客机',
        'Boeing 747-400': '波音 747-400',
        'Airbus A350-900': '空客 A350-900',
        'Boeing 747-200B': '波音 747-200B',
        'Boeing 747-100': '波音 747-100',
        'Boeing 747-100B / Ilyushin Il-76': '波音 747-100B / 伊留申 Il-76',
        'Boeing 747SR-46': '波音 747SR-46',
        'Boeing 767-222': '波音 767-222',
        'Boeing 767-223ER': '波音 767-223ER',
        'Boeing 767-2J6ER': '波音 767-2J6ER',
        'Boeing 767-366ER': '波音 767-366ER',
        'Boeing 767-3Z9ER': '波音 767-3Z9ER',
        'Boeing 707-321B': '波音 707-321B',
        'Boeing 727-231': '波音 727-231',
        'Boeing 727-235': '波音 727-235',
        'McDonnell Douglas DC-10-10': '麦道 DC-10-10',
        'McDonnell Douglas DC-8-61': '麦道 DC-8-61',
        'McDonnell Douglas DC-8-62': '麦道 DC-8-62',
        'McDonnell Douglas MD-11': '麦道 MD-11',
        'McDonnell Douglas MD-82': '麦道 MD-82',
        'Tupolev Tu-154B-2': '图波列夫 Tu-154B-2',
        'Avro RJ85': '阿弗罗 RJ85',
        'Saab 340B': '萨博 340B',
        'Xian Y-7-100': '西安 Y-7-100',
        'Lockheed L-1011-200': '洛克希德 L-1011-200',
        'Hawker Siddeley Trident / McDonnell Douglas DC-9': '霍克·西德利 三叉戟 / 麦道 DC-9',
        'Aérospatiale-BAC Concorde': '协和号',
        'Boeing 777-200ER': '波音 777-200ER',
        // Accident descriptions
        'Aircraft broke up in flight due to pitot tube icing and crew error. All 71 on board killed.': '飞机因皮托管结冰和机组失误在空中解体。机上71人全部遇难。',
        'Aircraft collided with fire truck on runway during takeoff. Two firefighters killed. Aircraft destroyed by fire. All passengers and crew survived.': '飞机起飞时在跑道上与消防车相撞。两名消防员殉职。飞机被大火烧毁。所有乘客和机组人员生还。',
        'Aircraft crashed after attempting go-around with landing gear retracted. 97 on board killed, 1 ground fatality.': '飞机在收起起落架尝试复飞后坠毁。机上97人遇难，地面1人遇难。',
        'Aircraft crashed into mountain in poor weather conditions. All 22 on board killed.': '飞机在恶劣天气条件下撞山坠毁。机上22人全部遇难。',
        'Aircraft crashed into residential area after failed go-around attempt. Pilot error cited as primary cause. 97 fatalities on board plus 1 on ground.': '飞机复飞失败后坠入居民区。飞行员失误被认定为主要原因。机上97人遇难，地面1人遇难。',
        'Aircraft crashed shortly after takeoff due to improper weight distribution. 112 fatalities, 1 survivor.': '飞机因载重分布不当在起飞后不久坠毁。112人遇难，1人生还。',
        'Aircraft entered rapid descent from cruise altitude and crashed into mountainous terrain. All 132 occupants perished. Investigation ongoing.': '飞机从巡航高度快速下降并撞入山区。机上132人全部遇难。调查进行中。',
        'Aircraft landed short of runway in lagoon due to poor visibility. One passenger drowned.': '飞机因能见度差降落在跑道前方的泻湖中。一名乘客溺水身亡。',
        'Aircraft lost altitude during takeoff, crashed into building. 13 fatalities.': '飞机起飞时失去高度，撞上建筑物。13人遇难。',
        'Aircraft nearly landed on taxiway with four aircraft lined up. Descended to 59 feet before go-around. Narrowly avoided major disaster.': '飞机几乎降落在排列着四架飞机的滑行道上。下降至59英尺后才复飞。险些酿成重大灾难。',
        'Aircraft overran runway during landing in poor weather. No injuries. Aircraft written off.': '飞机在恶劣天气降落时冲出跑道。无人伤亡。飞机报废。',
        'Aircraft overran runway during landing in thunderstorm and caught fire. 18 injured during evacuation.': '飞机在雷暴天气降落时冲出跑道并起火。疏散过程中18人受伤。',
        'Aircraft overran tabletop runway during landing in heavy rain and fell into valley. 21 fatalities including both pilots.': '飞机在大雨中降落时冲出桌面跑道并坠入山谷。21人遇难，包括两名飞行员。',
        'Aircraft overran the runway during landing in heavy rain. All passengers evacuated safely with minor injuries reported.': '飞机在大雨中降落时冲出跑道。所有乘客安全疏散，有轻微受伤报告。',
        'Aircraft shot down by Iranian surface-to-air missile shortly after takeoff. All 176 occupants killed. Iran admitted to accidental shootdown.': '飞机起飞后不久被伊朗地对空导弹击落。机上176人全部遇难。伊朗承认系误击。',
        'Aircraft skidded off runway during landing in snowstorm. No injuries reported. Aircraft sustained substantial damage.': '飞机在暴风雪中降落时滑出跑道。无人伤亡。飞机严重受损。',
        'Aircraft struck ground power unit during taxi. Minor damage only.': '飞机滑行时撞上地面电源车。仅轻微受损。',
        'Aircraft veered off runway during landing in heavy rain. All evacuated safely.': '飞机在大雨中降落时偏离跑道。所有人员安全疏散。',
        'Cargo aircraft crashed short of runway due to fuel exhaustion. 5 crew members killed.': '货机因燃油耗尽在跑道前方坠毁。5名机组人员遇难。',
        'Cargo aircraft overran runway and broke in two. Crew of two uninjured.': '货机冲出跑道并断成两截。两名机组人员未受伤。',
        'Door plug blowout at 16,000 feet causing rapid decompression. Aircraft made safe emergency landing. Boeing 737 MAX 9 fleet grounded for inspection.': '门塞在16000英尺高空脱落导致快速失压。飞机安全紧急降落。波音737 MAX 9机队停飞接受检查。',
        'Engine failure during takeoff roll. Crew aborted takeoff safely. One passenger injured during evacuation.': '起飞滑跑时发动机故障。机组安全中断起飞。疏散时一名乘客受伤。',
        'Engine failure shortly after takeoff with debris falling over residential area. Aircraft returned safely. No injuries.': '起飞后不久发动机故障，碎片掉落居民区。飞机安全返航。无人伤亡。',
        'Extreme turbulence encounter 30 minutes before landing. 36 people injured, 11 seriously. Aircraft landed safely.': '降落前30分钟遭遇严重颠簸。36人受伤，11人重伤。飞机安全降落。',
        'Landing gear collapse during rollout. Aircraft veered off runway. No injuries reported.': '着陆滑跑时起落架坍塌。飞机偏离跑道。无人伤亡。',
        'MCAS system malfunction caused aircraft to crash shortly after takeoff. All 157 occupants killed. Led to worldwide 737 MAX grounding.': 'MCAS系统故障导致飞机起飞后不久坠毁。机上157人全部遇难。导致全球737 MAX停飞。',
        'MCAS system malfunction caused crash into Java Sea 13 minutes after takeoff. All 189 occupants perished.': 'MCAS系统故障导致飞机起飞13分钟后坠入爪哇海。机上189人全部遇难。',
        'Number 4 engine suffered uncontained failure over Atlantic. Diverted safely to Goose Bay. No injuries.': '4号发动机在大西洋上空发生非包容性故障。安全备降古斯贝。无人伤亡。',
        'Severe turbulence encounter at 36,000 feet. Two flight attendants injured. Aircraft continued to destination safely.': '在36000英尺高空遭遇严重颠簸。两名乘务员受伤。飞机继续安全飞往目的地。',
        'Severe turbulence encounter. One passenger injured. Aircraft diverted safely.': '遭遇严重颠簸。一名乘客受伤。飞机安全备降。',
        // Investigation Agencies - 调查机构
        'MAK': '俄罗斯航空事故调查委员会',
        'KAIB': '韩国航空事故调查委员会',
        'DGCA India': '印度民航总局',
        'NTSB': '美国国家运输安全委员会',
        'CENIPA': '巴西航空事故调查中心',
        'GACA Saudi Arabia': '沙特阿拉伯民航总局',
        'CAA Pakistan': '巴基斯坦民航局',
        'CAAC': '中国民用航空局',
        'CIAA Peru': '秘鲁民航事故调查委员会',
        'CAAP Philippines': '菲律宾民航局',
        'AAIC Nepal': '尼泊尔航空事故调查委员会',
        'DGAC Costa Rica': '哥斯达黎加民航总局',
        'KNKT Indonesia': '印度尼西亚国家运输安全委员会',
        'CAO.IRI': '伊朗民航组织',
        'NBAAII Ukraine': '乌克兰国家航空事故调查局',
        'EACC Ethiopia': '埃塞俄比亚民航事故调查局',
        'FSM NTSB': '密克罗尼西亚联邦国家运输安全委员会',
        'IACC Cuba': '古巴民航事故调查委员会',
        'BEA France': '法国民用航空事故调查与分析局',
        'TSB Canada': '加拿大运输安全委员会',
        'CIAAC Spain': '西班牙民航事故调查委员会',
        'ICAO': '国际民用航空组织',
        'JTSB': '日本运输安全委员会',
        'Canadian Aviation Safety Board': '加拿大航空安全委员会',
        'AAIB UK': '英国航空事故调查局',
        'AAIASB Greece': '希腊航空事故调查与航空安全委员会',
        'Court of Inquiry India': '印度调查法庭',
        'ATSB Australia/CAAC': '澳大利亚运输安全局/中国民用航空局',
        'Dutch Safety Board': '荷兰安全委员会',
        'GRI Colombia': '哥伦比亚航空事故调查委员会',
        'Yugoslav Federal Aviation Administration': '南斯拉夫联邦民航管理局',
        'Saudi Arabian Presidency of Civil Aviation': '沙特阿拉伯民航总局',
        'NTSB/Thai DCA': '美国国家运输安全委员会/泰国民航局',
        'NTSB/Colombia': '美国国家运输安全委员会/哥伦比亚',
        'NTSC Indonesia': '印度尼西亚国家运输安全委员会',
        'KAIB South Korea': '韩国航空事故调查委员会',
        // Weather Conditions - 天气状况
        'IMC': '仪表气象条件',
        'VMC': '目视气象条件',
        'Night VMC': '夜间目视气象条件',
        'Heavy Rain': '大雨',
        'Snowstorm': '暴风雪',
        'Thunderstorm': '雷暴',
        'Fog': '雾',
        'Smoke Haze': '烟雾',
        'Severe Icing': '严重结冰',
        'Light Snow': '小雪',
        // Additional descriptions - 补充描述
        'Rear cargo door blew open causing explosive decompression and severing control cables. Aircraft crashed into forest near Paris. All 346 occupants perished in the deadliest single-aircraft accident at the time.': '后货舱门突然打开导致爆炸减压并切断控制电缆。飞机坠毁在巴黎附近的森林中。当时最严重的单机事故，机上346人全部遇难。',
        'Two Boeing 747s collided on foggy runway. KLM aircraft started takeoff without clearance, striking Pan Am aircraft taxiing on same runway. 583 fatalities in the deadliest aviation accident in history.': '两架波音747在大雾跑道上相撞。荷航飞机未经许可开始起飞，撞上在同一跑道滑行的泛美飞机。583人遇难，这是历史上最严重的航空事故。',
        'Left engine and pylon separated from wing during takeoff, damaging hydraulic systems. Aircraft rolled and crashed. 271 on board and 2 on ground killed, totaling 273 fatalities.': '起飞时左发动机和挂架与机翼分离，损坏液压系统。飞机翻滚坠毁。机上271人和地面2人遇难，共273人死亡。',
        'Strayed into Soviet airspace and was shot down by a Soviet fighter jet near Sakhalin Island. All 269 occupants killed, including a U.S. congressman.': '误入苏联领空，在萨哈林岛附近被苏联战斗机击落。机上269人全部遇难，包括一名美国国会议员。',
        'Improperly repaired tail strike caused explosive decompression and loss of hydraulics. Aircraft crashed into mountainside. 520 killed, 4 survivors. Deadliest single-aircraft accident in history.': '尾翼撞击维修不当导致爆炸减压和液压系统失效。飞机撞山坠毁。520人遇难，4人生还。历史上最严重的单机事故。',
        'Bomb hidden in suitcase exploded over the Atlantic Ocean. Aircraft broke up and crashed into the sea off the coast of Ireland. All 329 on board killed in the deadliest terrorist attack involving aircraft.': '藏在行李箱中的炸弹在大西洋上空爆炸。飞机解体并坠入爱尔兰海岸附近海域。机上329人全部遇难，这是涉及飞机的最严重恐怖袭击。',
        'Bomb in luggage detonated over Scotland, destroying aircraft which fell on Lockerbie. All 259 on board and 11 residents on ground killed, totaling 270 fatalities.': '行李中的炸弹在苏格兰上空引爆，摧毁了飞机，飞机坠落至洛克比。机上259人和地面11名居民遇难，共270人死亡。',
        'Commercial airliner was shot down by a U.S. Navy guided missile cruiser over the Strait of Hormuz. All 290 passengers and crew were killed.': '商用客机在霍尔木兹海峡上空被美国海军导弹巡洋舰击落。机上290名乘客和机组人员全部遇难。',
        'Center wing fuel tank exploded shortly after takeoff, causing aircraft to break apart and crash into the Atlantic Ocean near Long Island. All 230 on board killed.': '中央机翼油箱在起飞后不久爆炸，导致飞机解体并坠入长岛附近的大西洋。机上230人全部遇难。',
        'Mid-air collision between Saudi Arabian 747 and Kazakhstan Airlines Il-76 near Delhi. ATC error and language issues cited. All 349 on both aircraft killed. Deadliest mid-air collision in history.': '沙特阿拉伯航空747与哈萨克斯坦航空伊尔-76在德里附近空中相撞。空管失误和语言问题被认定为原因。两架飞机上共349人全部遇难。历史上最严重的空中相撞事故。',
        'In-flight fire in the ceiling area, likely from faulty wiring, caused smoke and system failures. Aircraft crashed into the Atlantic Ocean off Nova Scotia. All 229 on board killed.': '天花板区域发生飞行中火灾，可能由线路故障引起，导致烟雾和系统故障。飞机坠入新斯科舍附近的大西洋。机上229人全部遇难。',
        'Hijacked by terrorists and flown into the North Tower of the World Trade Center. All 92 occupants killed. Part of the September 11 attacks.': '被恐怖分子劫持并撞向世界贸易中心北塔。机上92人全部遇难。9·11袭击事件的一部分。',
        'Hijacked by terrorists and flown into the South Tower of the World Trade Center. All 65 occupants killed. Part of the September 11 attacks.': '被恐怖分子劫持并撞向世界贸易中心南塔。机上65人全部遇难。9·11袭击事件的一部分。',
        'Cabin pressurization failure went unnoticed by crew, leading to hypoxia. Aircraft flew on autopilot until fuel exhaustion and crashed near Athens. All 121 on board killed.': '客舱增压系统故障未被机组察觉，导致缺氧。飞机在自动驾驶状态下飞行直到燃油耗尽，在雅典附近坠毁。机上121人全部遇难。',
        'Pitot tube icing caused autopilot disconnection in storm. Crew mishandled stall recovery, causing aircraft to crash into Atlantic Ocean. All 228 on board killed.': '皮托管结冰导致自动驾驶在风暴中断开。机组错误处理失速恢复，导致飞机坠入大西洋。机上228人全部遇难。',
        'Overshot tabletop runway during landing, plunged into ravine and burst into flames. 158 killed, 8 survivors. Pilot error cited as primary cause.': '降落时冲出桌面跑道，坠入峡谷并起火。158人遇难，8人生还。飞行员失误被认定为主要原因。',
        'Came in short and slow, tail struck seawall and broke off. Aircraft spun and caught fire. 3 fatalities among passengers, 187 injured. Pilot error in automated systems management.': '进近过低过慢，尾部撞上防波堤并断裂。飞机旋转起火。3名乘客遇难，187人受伤。飞行员在自动化系统管理方面失误。',
        'Disappeared from radar during flight from Kuala Lumpur to Beijing. Debris found on islands and African coast indicated crash in southern Indian Ocean. All 239 presumed dead. Cause remains unknown.': '从吉隆坡飞往北京的途中从雷达上消失。在岛屿和非洲海岸发现的残骸表明飞机在南印度洋坠毁。239人全部推定死亡。原因仍未确定。',
        'Shot down by a surface-to-air missile over eastern Ukraine while flying over conflict zone. All 298 passengers and crew killed. Russian-backed separatists widely blamed.': '在飞越冲突地区时于乌克兰东部上空被地对空导弹击落。机上298名乘客和机组人员全部遇难。俄罗斯支持的分离主义者被广泛指责。',
        'Co-pilot deliberately crashed aircraft into the French Alps while captain was locked out of cockpit. All 150 on board killed. Led to changes in cockpit access rules.': '副驾驶在机长被锁在驾驶舱外时故意将飞机撞向法国阿尔卑斯山。机上150人全部遇难。导致驾驶舱准入规则的改变。',
        'Ran out of fuel on approach to Medellín while carrying Brazilian football team Chapecoense. Aircraft crashed into mountainside. 71 killed, 6 survivors.': '在飞往麦德林途中燃油耗尽，当时机上载有巴西沙佩科恩斯足球队。飞机撞山坠毁。71人遇难，6人生还。',
        'Descended below minimum safe altitude during approach in mountainous terrain. Crashed into Mount Weather. All 92 on board killed.': '在山区进近时下降至最低安全高度以下。撞上Weather山。机上92人全部遇难。',
        'Mid-air collision between British Airways Trident and Inex-Adria DC-9 near Zagreb. ATC error cited. All 176 on both aircraft killed.': '英国航空三叉戟与伊内克斯亚德里亚航空DC-9在萨格勒布附近空中相撞。空管失误被认定为原因。两架飞机上共176人全部遇难。',
        'Crew became preoccupied with landing gear issue and failed to monitor fuel levels. Aircraft crashed short of runway after fuel exhaustion. 10 killed, 179 survived.': '机组专注于起落架问题，未能监控燃油量。飞机因燃油耗尽在跑道前方坠毁。10人遇难，179人生还。',
        'In-flight fire in rear cargo hold. Aircraft landed safely but evacuation was delayed. All 301 on board died from smoke inhalation and fire.': '后货舱发生飞行中火灾。飞机安全降落但疏散延迟。机上301人全部因吸入烟雾和火灾遇难。',
        'Microburst-induced wind shear during takeoff caused rapid loss of altitude. Crashed into residential area near airport. All 146 on board and several on ground killed.': '起飞时微暴流引起的风切变导致高度骤降。坠毁在机场附近的居民区。机上146人和地面数人遇难。',
        'Fire broke out in cargo hold during approach. Crew attempted emergency landing but aircraft broke up and crashed near Krasnoyarsk. All 110 on board killed.': '进近时货舱起火。机组尝试紧急降落但飞机解体并在克拉斯诺亚尔斯克附近坠毁。机上110人全部遇难。',
        'Took off with flaps and slats retracted due to crew distraction. Crashed onto highway near airport. 154 on board killed, 1 child survivor, plus 2 ground fatalities.': '由于机组分心，飞机在襟翼和缝翼收起的状态下起飞。坠毁在机场附近的高速公路上。机上154人遇难，1名儿童生还，地面2人遇难。',
        'Approached too low in foggy conditions and crashed into trees short of runway. 176 killed, 11 survivors. Crew inexperience cited.': '在大雾条件下进近过低，在跑道前方撞树坠毁。176人遇难，11人生还。机组经验不足被认定为原因。'
    }
};
// 翻译数据值（航空公司、国家、机型等）
function td(value) {
    if (!value) return value;
    const lang = AppState.currentLang || 'en';
    return (i18nData[lang] && i18nData[lang][value]) || value;
}
// ===== i18n Helper Functions =====
function t(key) {
    const lang = AppState.currentLang || 'en';
    return i18n[lang] && i18n[lang][key] ? i18n[lang][key] : (i18n.en[key] || key);
}
function setLanguage(lang) {
    if (!i18n[lang]) lang = 'en';
    AppState.currentLang = lang;
    localStorage.setItem('preferredLang', lang);
    document.documentElement.lang = lang;
    applyTranslations();
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}
function toggleLanguage() {
    const next = AppState.currentLang === 'zh' ? 'en' : 'zh';
    setLanguage(next);
}
// 翻译所有带 data-i18n 属性的元素
function applyTranslations() {
    // 文本内容
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    // 动态生成的标签（带 data-i18n-key 属性）
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.getAttribute('data-i18n-key');
        el.textContent = t(key);
    });
    // placeholder
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        el.placeholder = t(key);
    });
    // title/tooltip
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(key);
    });
    // data-text 属性 (glitch effect)
    document.querySelectorAll('[data-i18n-glitch]').forEach(el => {
        const key = el.getAttribute('data-i18n-glitch');
        const text = t(key);
        el.textContent = text;
        el.setAttribute('data-text', text);
    });
    // 页面标题
    const titleEl = document.querySelector('title');
    if (titleEl && titleEl.getAttribute('data-i18n-title')) {
        titleEl.textContent = t(titleEl.getAttribute('data-i18n-title'));
    }
}
// 初始化语言（从 localStorage 读取）
function initLanguage() {
    const saved = localStorage.getItem('preferredLang');
    const browserLang = navigator.language && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    AppState.currentLang = saved || browserLang;
    document.documentElement.lang = AppState.currentLang;
}
// ===== Utility Functions =====
function formatNumber(num) {
    return num.toLocaleString('en-US');
}
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
function getYearFromDate(dateStr) {
    return parseInt(dateStr.split('-')[0]);
}
function getCauseClass(cause) {
    const map = {
        'Human Error': 'human',
        'Mechanical Failure': 'mechanical',
        'Weather': 'weather',
        'Sabotage': 'sabotage',
        'Unknown': 'unknown',
        'Hijacking': 'sabotage',
        'Bombing': 'sabotage',
        'Shootdown': 'sabotage',
        'Bird Strike': 'weather',
        'Fuel Exhaustion': 'human',
        'ATC Error': 'human',
        'CFIT': 'human',
        'Cargo Fire': 'mechanical',
        'Loss of Control': 'mechanical',
        'Severe Icing': 'weather'
    };
    return map[cause] || 'unknown';
}
function getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    return 'poor';
}
function getRankClass(rank) {
    if (rank === 1) return 'top-1';
    if (rank === 2) return 'top-2';
    if (rank === 3) return 'top-3';
    return 'normal';
}
function getTrendArrow(trend) {
    if (trend === 'improving') return '↑';
    if (trend === 'declining') return '↓';
    return '→';
}
// ===== Number Animation =====
function animateNumber(element, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeProgress);
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}
// ===== Filter Panel Toggle =====
function initFilterPanel() {
    const toggle = document.querySelector('.filter-toggle');
    const panel = document.querySelector('.filter-panel');
    
    if (toggle && panel) {
        toggle.addEventListener('click', () => {
            panel.classList.toggle('open');
        });
    }
}
// ===== Modal System =====
function showModal(title, content) {
    let overlay = document.querySelector('.modal-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <span class="modal-title"></span>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        overlay.querySelector('.modal-close').addEventListener('click', () => {
            overlay.classList.remove('active');
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    }
    
    overlay.querySelector('.modal-title').textContent = title;
    overlay.querySelector('.modal-body').innerHTML = content;
    overlay.classList.add('active');
}
// ===== Chart.js Default Configuration =====
function getChartDefaults() {
    const styles = getComputedStyle(document.documentElement);
    return {
        color: styles.getPropertyValue('--color-primary').trim() || '#0066CC',
        gridColor: styles.getPropertyValue('--border-color').trim() || 'rgba(0, 102, 204, 0.12)',
        textColor: styles.getPropertyValue('--text-secondary').trim() || '#555566',
        fontFamily: styles.getPropertyValue('--font-body').trim() || "'Segoe UI', sans-serif"
    };
}
function applyChartTheme() {
    if (typeof Chart !== 'undefined') {
        const defaults = getChartDefaults();
        Chart.defaults.color = defaults.textColor;
        Chart.defaults.borderColor = defaults.gridColor;
        Chart.defaults.font.family = defaults.fontFamily;
        Chart.defaults.font.size = 12;
    }
}
// ===== Unique Values Extractor =====
function getUniqueValues(data, key) {
    return [...new Set(data.map(item => item[key]))].sort();
}

// 初始化语言切换按钮
function initLangSwitch() {
    const btn = document.getElementById('langSwitch');
    if (btn) {
        btn.addEventListener('click', () => toggleLanguage());
    }
}
// ===== Dark Mode =====
function initThemeToggle() {
    let saved = localStorage.getItem('theme');
    
    if (!saved) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        saved = prefersDark ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
    
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            
            document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            document.documentElement.setAttribute('data-theme', next);
            
            localStorage.setItem('theme', next);
            updateThemeIcon(next);
            applyChartTheme();
            
            document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: next } }));
            
            setTimeout(() => {
                document.documentElement.style.transition = '';
            }, 300);
        });
    }
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const saved = localStorage.getItem('theme');
        if (!saved) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
            applyChartTheme();
        }
    });
}
function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀' : '☾';
}
// ===== Hamburger Menu =====
function initHamburgerMenu() {
    const hamburger = document.querySelector('.nav-hamburger');
    const nav = document.querySelector('.navbar-nav');
    const overlay = document.querySelector('.nav-overlay');
    if (!hamburger || !nav) return;
    
    function toggle(isOpen) {
        const shouldOpen = isOpen !== undefined ? isOpen : !nav.classList.contains('open');
        hamburger.classList.toggle('open', shouldOpen);
        nav.classList.toggle('open', shouldOpen);
        if (overlay) overlay.classList.toggle('active', shouldOpen);
        
        hamburger.setAttribute('aria-expanded', shouldOpen);
        
        if (shouldOpen) {
            nav.querySelector('a')?.focus();
        } else {
            hamburger.focus();
        }
    }
    
    hamburger.addEventListener('click', () => toggle());
    if (overlay) overlay.addEventListener('click', () => toggle(false));
    
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('open')) toggle(false);
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
            toggle(false);
        }
    });
    
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0 && nav.classList.contains('open')) {
                toggle(false);
            } else if (diffX < 0 && window.innerWidth <= 768 && !nav.classList.contains('open')) {
                toggle(true);
            }
        }
    }, { passive: true });
}
// ===== Filter State Persistence =====
function saveFilterState() {
    try {
        sessionStorage.setItem('filterState', JSON.stringify(AppState.filters));
    } catch(e) {}
}
function loadFilterState() {
    try {
        const saved = sessionStorage.getItem('filterState');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(AppState.filters, parsed);
            return true;
        }
    } catch(e) {}
    return false;
}
// ===== Image Lazy Loading =====
let imageObserver = null;

function initImageLazyLoading() {
    imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                const srcset = img.getAttribute('data-srcset');
                
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                }
                if (srcset) {
                    img.srcset = srcset;
                    img.removeAttribute('data-srcset');
                }
                
                img.onload = () => {
                    img.classList.add('loaded');
                };
                
                img.onerror = () => {
                    img.classList.add('loaded');
                    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23e0e0e0" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage%20not%20found%3C/text%3E%3C/svg%3E';
                };
                
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '100px',
        threshold: 0.01
    });
    
    observeLazyImages();
}

function observeLazyImages() {
    if (!imageObserver) return;
    
    document.querySelectorAll('img[data-src], img.lazy-image[data-src]').forEach(img => {
        if (!img.src && img.dataset.src) {
            imageObserver.observe(img);
        }
    });
}

function refreshLazyImages() {
    observeLazyImages();
}

// ===== Back to Top Button =====
function initBackToTop() {
    let btn = document.getElementById('backToTop');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'backToTop';
        btn.className = 'back-to-top';
        btn.innerHTML = '↑';
        btn.setAttribute('aria-label', 'Back to top');
        btn.style.display = 'none';
        document.body.appendChild(btn);
    }
    
    function toggleVisibility() {
        btn.style.display = window.scrollY > 300 ? 'block' : 'none';
    }
    
    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility();
}

// ===== Keyboard Navigation for Modal =====
function initModalKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        const overlay = document.querySelector('.modal-overlay.active');
        if (!overlay) return;
        
        if (e.key === 'Escape') {
            overlay.classList.remove('active');
        }
        
        if (e.key === 'Tab') {
            const modal = overlay.querySelector('.modal');
            const focusable = modal.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
}

// ===== User Feedback / Toast System =====
function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${getToastIcon(type)}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast(toast);
    });
    
    if (duration > 0) {
        setTimeout(() => removeToast(toast), duration);
    }
    
    return toast;
}

function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'i'
    };
    return icons[type] || icons.info;
}

function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        toast.remove();
    }, 300);
}



// ===== Error Handling & Safe Execution =====
function safeExecute(fn, fallback = null) {
    try {
        return fn();
    } catch (error) {
        console.error('Safe execute error:', error);
        return fallback;
    }
}

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showToast(t('error.global') || 'An error occurred. Please refresh the page.', 'error', 5000);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showToast(t('error.promise') || 'An unexpected error occurred.', 'error', 5000);
});

// ===== Enhanced Search Functions =====
function fuzzySearch(query, items, fields = ['airline', 'aircraft', 'flightNumber', 'location', 'description']) {
    if (!query || !query.trim()) return items;
    
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    
    return items.filter(item => {
        const searchText = fields
            .map(field => item[field] || '')
            .join(' ')
            .toLowerCase();
        
        return terms.every(term => searchText.includes(term));
    });
}

function searchWithTranslations(query, items) {
    if (!query || !query.trim()) return items;
    
    const searchStr = query.toLowerCase();
    const translatedStr = td(query).toLowerCase();
    
    return items.filter(item => {
        const text = `${item.airline} ${td(item.airline)} ${item.aircraft} ${td(item.aircraft)} ${item.location} ${item.flightNumber} ${item.description}`.toLowerCase();
        return text.includes(searchStr) || text.includes(translatedStr);
    });
}

function advancedSearch(query, items) {
    if (!query || !query.trim()) return items;
    
    const results = new Set();
    
    searchWithTranslations(query, items).forEach(item => results.add(item));
    
    const parts = query.split(' ');
    if (parts.length > 1) {
        parts.forEach(part => {
            if (part.length > 2) {
                fuzzySearch(part, items).forEach(item => results.add(item));
            }
        });
    }
    
    return Array.from(results);
}

// ===== Initialize on Page Load =====
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    loadFilterState();
    applyTranslations();
    initFilterPanel();
    applyChartTheme();
    initLangSwitch();
    initThemeToggle();
    initHamburgerMenu();
    initImageLazyLoading();
    initBackToTop();
    initModalKeyboardNav();
});