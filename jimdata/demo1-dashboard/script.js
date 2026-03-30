// Non-standard codes in the EIA data that need mapping to ISO alpha-3
const CODE_MAP = {
    'WORL': null, // World aggregate - skip for map
    'HKNG': 'HKG', 'MACA': 'MAC', 'TAIW': 'TWN',
    'CSXX': 'CZE', 'CSK': null, 'SCG': null, 'SUN': null,
    'YUG': null, 'DDR': null, 'DEUW': null, 'HITZ': null,
    'USIQ': null, 'USOH': null, 'WAK': null, 'NLDA': null
};

let allData = {}; // { code: { name, pop: {year: val}, gdp: {year: val} } }
let worldData = { pop: {}, gdp: {} };
let currentMetric = 'population';
let currentYear = 2023;
let playing = false;
let playTimer = null;
const years = [];
for (let y = 1980; y <= 2023; y++) years.push(y);

async function loadData() {
    const resp = await fetch('../INT-Export-02-25-2026_14-58-07.csv');
    let text = await resp.text();
    // Remove BOM
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const lines = text.split(/\r?\n/);

    let currentCountry = null;
    let currentCode = null;

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = parseCSVLine(line);
        if (!cols || cols.length < 3) continue;

        const api = cols[0].trim();
        const label = cols[1].trim();

        // Country header row (empty API)
        if (!api && label) {
            currentCountry = label;
            continue;
        }

        // Data row
        if (api.startsWith('INTL.47-33-') || api.startsWith('INTL.47-34-')) {
            const codeMatch = api.match(/INTL\.47-3[34]-([A-Z]+)-/);
            if (!codeMatch) continue;
            let code = codeMatch[1];

            // Map non-standard codes
            if (CODE_MAP.hasOwnProperty(code)) {
                if (CODE_MAP[code] === null) {
                    if (code === 'WORL') {
                        // Store world data
                        const metricType = api.includes('47-33') ? 'pop' : 'gdp';
                        for (let j = 0; j < 44 && j + 2 < cols.length; j++) {
                            const v = parseVal(cols[j + 2]);
                            if (v !== null) worldData[metricType][1980 + j] = v;
                        }
                    }
                    continue;
                }
                code = CODE_MAP[code];
            }

            if (!allData[code]) allData[code] = { name: currentCountry || code, pop: {}, gdp: {} };
            const metricType = api.includes('47-33') ? 'pop' : 'gdp';

            for (let j = 0; j < 44 && j + 2 < cols.length; j++) {
                const v = parseVal(cols[j + 2]);
                if (v !== null) allData[code][metricType][1980 + j] = v;
            }
        }
    }
    renderMap();
    renderTimeline();
}

function parseVal(s) {
    if (!s) return null;
    s = s.trim().replace(/"/g, '');
    if (s === '--' || s === 'NA' || s === '' || s === '0') return null;
    const n = parseFloat(s);
    return isNaN(n) || n === 0 ? null : n;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
            else if (ch === '"') inQuotes = false;
            else current += ch;
        } else {
            if (ch === '"') inQuotes = true;
            else if (ch === ',') { result.push(current); current = ''; }
            else current += ch;
        }
    }
    result.push(current);
    return result;
}

function getMetricData(year) {
    const key = currentMetric === 'population' ? 'pop' : 'gdp';
    const codes = [], values = [], names = [];
    for (const [code, d] of Object.entries(allData)) {
        const v = d[key][year];
        if (v != null) {
            codes.push(code);
            values.push(v);
            names.push(d.name);
        }
    }
    return { codes, values, names };
}

function renderMap() {
    const { codes, values, names } = getMetricData(currentYear);
    const isPop = currentMetric === 'population';
    const unit = isPop ? 'MMBtu/person' : '1000 Btu/2015$ GDP PPP';
    const colorscale = isPop
        ? [[0, '#0c4a6e'], [0.2, '#0369a1'], [0.4, '#0ea5e9'], [0.6, '#fbbf24'], [0.8, '#f97316'], [1, '#dc2626']]
        : [[0, '#064e3b'], [0.2, '#059669'], [0.4, '#34d399'], [0.6, '#fbbf24'], [0.8, '#f97316'], [1, '#dc2626']];

    const hoverText = names.map((n, i) => `${n}<br>${values[i].toFixed(2)} ${unit}`);

    const data = [{
        type: 'choropleth',
        locationmode: 'ISO-3',
        locations: codes,
        z: values,
        text: hoverText,
        hoverinfo: 'text',
        colorscale: colorscale,
        reversescale: false,
        colorbar: {
            title: { text: unit, font: { color: '#94a3b8', size: 11 } },
            tickfont: { color: '#94a3b8' },
            bgcolor: 'rgba(0,0,0,0)',
            len: 0.6
        },
        marker: { line: { color: '#1e293b', width: 0.5 } }
    }];

    const layout = {
        geo: {
            showframe: false,
            showcoastlines: true,
            coastlinecolor: '#334155',
            showland: true,
            landcolor: '#1e293b',
            showocean: true,
            oceancolor: '#0f172a',
            showlakes: false,
            showcountries: true,
            countrycolor: '#334155',
            projection: { type: 'natural earth' },
            bgcolor: '#0f172a'
        },
        margin: { t: 0, b: 0, l: 0, r: 0 },
        paper_bgcolor: '#0f172a',
        plot_bgcolor: '#0f172a',
        height: 520
    };

    Plotly.react('map', data, layout, { responsive: true, displayModeBar: false });
    updateStats(codes, values, names);
}

function updateStats(codes, values, names) {
    const key = currentMetric === 'population' ? 'pop' : 'gdp';
    const unit = currentMetric === 'population' ? 'MMBtu/person' : '1000 Btu/$GDP';
    const wv = worldData[key][currentYear];
    document.getElementById('statWorld').textContent = wv ? wv.toFixed(2) : '--';
    document.getElementById('statWorldUnit').textContent = unit;

    if (values.length > 0) {
        const maxIdx = values.indexOf(Math.max(...values));
        const filtered = values.filter(v => v > 0);
        const minVal = Math.min(...filtered);
        const minIdx = values.indexOf(minVal);
        document.getElementById('statMax').textContent = values[maxIdx].toFixed(2);
        document.getElementById('statMaxCountry').textContent = names[maxIdx];
        document.getElementById('statMin').textContent = minVal.toFixed(2);
        document.getElementById('statMinCountry').textContent = names[minIdx];
        document.getElementById('statCount').textContent = values.length;
    }
}

function renderTimeline() {
    const key = currentMetric === 'population' ? 'pop' : 'gdp';
    const unit = currentMetric === 'population' ? 'MMBtu/person' : '1000 Btu/2015$ GDP PPP';
    const wVals = years.map(y => worldData[key][y] || null);

    // Pick a few notable countries for reference lines
    const highlights = [
        { code: 'USA', color: '#3b82f6' },
        { code: 'CHN', color: '#ef4444' },
        { code: 'IND', color: '#22c55e' },
        { code: 'DEU', color: '#a855f7' },
        { code: 'BRA', color: '#f59e0b' }
    ];

    const traces = [{
        x: years, y: wVals,
        name: 'World',
        line: { color: '#f8fafc', width: 3 },
        mode: 'lines'
    }];

    for (const h of highlights) {
        if (allData[h.code]) {
            traces.push({
                x: years,
                y: years.map(y => allData[h.code][key][y] || null),
                name: allData[h.code].name,
                line: { color: h.color, width: 1.5, dash: 'dot' },
                mode: 'lines'
            });
        }
    }

    // Vertical line for current year
    const shapes = [{
        type: 'line', x0: currentYear, x1: currentYear, y0: 0, y1: 1,
        yref: 'paper', line: { color: '#3b82f6', width: 2, dash: 'dash' }
    }];

    const layout = {
        margin: { t: 20, b: 40, l: 60, r: 20 },
        paper_bgcolor: '#0f172a',
        plot_bgcolor: '#0f172a',
        xaxis: { color: '#64748b', gridcolor: '#1e293b', range: [1979, 2024] },
        yaxis: { color: '#64748b', gridcolor: '#1e293b', title: { text: unit, font: { size: 11, color: '#64748b' } } },
        legend: { font: { color: '#94a3b8', size: 11 }, bgcolor: 'rgba(0,0,0,0)', x: 0.01, y: 0.99 },
        shapes: shapes,
        height: 250
    };

    Plotly.react('timeline', traces, layout, { responsive: true, displayModeBar: false });
}

function setMetric(m) {
    currentMetric = m;
    document.getElementById('btn-pop').classList.toggle('active', m === 'population');
    document.getElementById('btn-gdp').classList.toggle('active', m === 'gdp');
    renderMap();
    renderTimeline();
}

function setYear(y) {
    currentYear = y;
    document.getElementById('yearSlider').value = y;
    document.getElementById('yearLabel').textContent = y;
    renderMap();
    renderTimeline();
}

function togglePlay() {
    playing = !playing;
    const btn = document.getElementById('playBtn');
    if (playing) {
        btn.textContent = '⏸ Pause';
        btn.classList.add('playing');
        if (currentYear >= 2023) setYear(1980);
        playTimer = setInterval(() => {
            if (currentYear >= 2023) { togglePlay(); return; }
            setYear(currentYear + 1);
        }, 400);
    } else {
        btn.textContent = '▶ Play';
        btn.classList.remove('playing');
        clearInterval(playTimer);
    }
}

loadData();