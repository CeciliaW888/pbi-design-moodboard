// Generates realistic placeholder data for each visual type

const CATEGORY_SETS = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
  regions: ['North', 'South', 'East', 'West', 'Central'],
  products: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
  departments: ['Sales', 'Marketing', 'Engineering', 'Finance', 'Operations'],
};

function rand(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

function pickCategories() {
  const keys = Object.keys(CATEGORY_SETS);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const set = CATEGORY_SETS[key];
  const count = Math.min(set.length, rand(4, 7));
  return set.slice(0, count);
}

const SERIES_NAMES = ['Revenue', 'Costs', 'Profit', 'Users', 'Sessions', 'Orders'];
const COLORS_DEFAULT = ['#0078D4', '#E3008C', '#00B294', '#FFB900', '#D83B01', '#5C2D91'];

function generateValues(count, min = 10, max = 100) {
  return Array.from({ length: count }, () => rand(min, max));
}

export function generatePlaceholderSpec(visualType, designSystem) {
  const colors = designSystem?.colors?.length
    ? designSystem.colors.map(c => c.hex)
    : COLORS_DEFAULT;

  switch (visualType) {
    case 'bar': {
      const categories = pickCategories();
      const seriesCount = rand(1, 3);
      return {
        visualType: 'bar',
        title: 'Sales by Category',
        categories,
        series: Array.from({ length: seriesCount }, (_, i) => ({
          name: SERIES_NAMES[i] || `Series ${i + 1}`,
          color: colors[i % colors.length],
          values: generateValues(categories.length, 20, 120),
        })),
      };
    }

    case 'column': {
      const categories = pickCategories();
      return {
        visualType: 'column',
        title: 'Revenue by Region',
        categories,
        series: [{
          name: 'Revenue',
          color: colors[0],
          values: generateValues(categories.length, 20, 120),
        }],
      };
    }

    case 'line': {
      const categories = CATEGORY_SETS.months.slice(0, rand(6, 12));
      const seriesCount = rand(1, 3);
      return {
        visualType: 'line',
        title: 'Trend Over Time',
        categories,
        series: Array.from({ length: seriesCount }, (_, i) => ({
          name: SERIES_NAMES[i] || `Series ${i + 1}`,
          color: colors[i % colors.length],
          values: generateValues(categories.length, 30, 100),
        })),
      };
    }

    case 'area': {
      const categories = CATEGORY_SETS.months.slice(0, rand(6, 12));
      return {
        visualType: 'area',
        title: 'Cumulative Growth',
        categories,
        series: [{
          name: 'Revenue',
          color: colors[0],
          values: generateValues(categories.length, 40, 150),
        }],
      };
    }

    case 'combo': {
      const categories = CATEGORY_SETS.months.slice(0, 6);
      return {
        visualType: 'combo',
        title: 'Revenue vs Profit Trend',
        categories,
        series: [
          { name: 'Revenue', color: colors[0], values: generateValues(categories.length, 40, 120), chartType: 'bar' },
          { name: 'Profit %', color: colors[1] || colors[0], values: generateValues(categories.length, 20, 80), chartType: 'line' },
        ],
      };
    }

    case 'kpi': {
      const val = rand(100, 9999);
      const change = (Math.random() * 20 - 5).toFixed(1);
      const trend = parseFloat(change) >= 0 ? 'up' : 'down';
      return {
        visualType: 'kpi',
        title: 'Total Revenue',
        kpiValue: `$${val.toLocaleString()}K`,
        kpiChange: `${change}%`,
        kpiTrend: trend,
        series: [{
          name: 'Trend',
          color: colors[0],
          values: generateValues(8, 50, 150),
        }],
      };
    }

    case 'donut': {
      const names = ['Category A', 'Category B', 'Category C', 'Category D'];
      return {
        visualType: 'donut',
        title: 'Distribution',
        series: names.map((name, i) => ({
          name,
          color: colors[i % colors.length],
          values: [rand(10, 60)],
        })),
      };
    }

    case 'pie': {
      const names = ['Segment A', 'Segment B', 'Segment C', 'Segment D', 'Segment E'];
      return {
        visualType: 'pie',
        title: 'Market Share',
        series: names.map((name, i) => ({
          name,
          color: colors[i % colors.length],
          values: [rand(10, 50)],
        })),
      };
    }

    case 'table': {
      const headers = ['Name', 'Revenue', 'Growth', 'Status'];
      const rows = CATEGORY_SETS.regions.slice(0, 4).map(region => [
        region,
        `$${rand(100, 999)}K`,
        `${(Math.random() * 30 - 5).toFixed(1)}%`,
        Math.random() > 0.3 ? 'Active' : 'Review',
      ]);
      return {
        visualType: 'table',
        title: 'Performance Summary',
        tableHeaders: headers,
        tableRows: rows,
      };
    }

    case 'scatter': {
      const count = rand(8, 15);
      return {
        visualType: 'scatter',
        title: 'Correlation Analysis',
        series: [
          { name: 'X Values', color: colors[0], values: generateValues(count, 10, 100) },
          { name: 'Y Values', color: colors[1] || colors[0], values: generateValues(count, 10, 100) },
        ],
      };
    }

    case 'gauge': {
      return {
        visualType: 'gauge',
        title: 'Performance Score',
        gaugeValue: rand(40, 95),
        gaugeMin: 0,
        gaugeMax: 100,
        gaugeTarget: 75,
        series: [{ name: 'Score', color: colors[0], values: [rand(40, 95)] }],
      };
    }

    case 'treemap': {
      const names = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F'];
      return {
        visualType: 'treemap',
        title: 'Revenue Breakdown',
        series: names.map((name, i) => ({
          name,
          color: colors[i % colors.length],
          values: [rand(10, 80)],
        })),
      };
    }

    case 'funnel': {
      const stages = ['Leads', 'Qualified', 'Proposal', 'Negotiation', 'Closed'];
      const vals = [100, 72, 48, 30, 18];
      return {
        visualType: 'funnel',
        title: 'Sales Pipeline',
        categories: stages,
        series: [{ name: 'Deals', color: colors[0], values: vals }],
      };
    }

    case 'header': {
      return {
        visualType: 'header',
        title: 'Dashboard Title',
        subtitle: 'Report subtitle or description',
      };
    }

    case 'card': {
      return {
        visualType: 'card',
        title: 'Total Sales',
        kpiValue: `$${rand(100, 9999).toLocaleString()}K`,
      };
    }

    case 'filter': {
      return {
        visualType: 'filter',
        title: 'Filter',
        filterOptions: ['All', 'Region', 'Product', 'Date Range'],
      };
    }

    case 'button': {
      return {
        visualType: 'button',
        title: 'Navigate',
        buttonText: 'View Details',
      };
    }

    case 'textbox': {
      return {
        visualType: 'textbox',
        title: 'Text',
        textContent: 'Add your commentary or annotations here. This text box supports multiple lines of descriptive text.',
      };
    }

    case 'image': {
      return {
        visualType: 'image',
        title: 'Image',
        imagePlaceholder: true,
      };
    }

    default:
      return generatePlaceholderSpec('bar', designSystem);
  }
}

// Visual type definitions for the element palette
export const VISUAL_TYPES = [
  { type: 'header', label: 'Header' },
  { type: 'filter', label: 'Filter' },
  { type: 'kpi', label: 'KPIs' },
  { type: 'button', label: 'Button' },
  { type: 'column', label: 'Column Chart' },
  { type: 'bar', label: 'Bar Chart' },
  { type: 'line', label: 'Line Chart' },
  { type: 'area', label: 'Area Chart' },
  { type: 'combo', label: 'Combo Chart' },
  { type: 'table', label: 'Simple Table' },
  { type: 'card', label: 'Card' },
  { type: 'pie', label: 'Pie Chart' },
  { type: 'donut', label: 'Donut Chart' },
  { type: 'gauge', label: 'Gauge' },
  { type: 'treemap', label: 'Treemap' },
  { type: 'funnel', label: 'Funnel Chart' },
  { type: 'scatter', label: 'Scatter Plot' },
  { type: 'textbox', label: 'TextBox' },
  { type: 'image', label: 'Image' },
];

// Default sizes per visual type
export const VISUAL_SIZES = {
  header: { w: 600, h: 80 },
  filter: { w: 240, h: 50 },
  kpi: { w: 240, h: 160 },
  card: { w: 200, h: 120 },
  button: { w: 160, h: 48 },
  textbox: { w: 400, h: 120 },
  image: { w: 300, h: 200 },
  default: { w: 380, h: 260 },
};

// Template variations per visual type
// Each template has a label, a mini SVG thumbnail, and overrides for the spec
export const VISUAL_TEMPLATES = {
  column: [
    { id: 'column-single', label: 'Single', desc: 'One series', seriesCount: 1 },
    { id: 'column-clustered', label: 'Clustered', desc: 'Side by side', seriesCount: 3 },
    { id: 'column-stacked', label: 'Stacked', desc: 'Stacked bars', seriesCount: 3, stacked: true },
  ],
  bar: [
    { id: 'bar-single', label: 'Single', desc: 'One series', seriesCount: 1 },
    { id: 'bar-clustered', label: 'Clustered', desc: 'Side by side', seriesCount: 3 },
    { id: 'bar-stacked', label: 'Stacked', desc: 'Stacked bars', seriesCount: 3, stacked: true },
  ],
  line: [
    { id: 'line-single', label: 'Single', desc: 'One line', seriesCount: 1 },
    { id: 'line-multi', label: 'Multi-line', desc: 'Multiple lines', seriesCount: 3 },
    { id: 'line-dotted', label: 'With markers', desc: 'Line + dots', seriesCount: 1, markers: true },
  ],
  area: [
    { id: 'area-single', label: 'Single', desc: 'One area', seriesCount: 1 },
    { id: 'area-stacked', label: 'Stacked', desc: 'Stacked areas', seriesCount: 3, stacked: true },
  ],
  pie: [
    { id: 'pie-default', label: 'Pie', desc: 'Standard pie', segments: 4 },
    { id: 'pie-many', label: 'Multi-slice', desc: 'Many segments', segments: 7 },
  ],
  donut: [
    { id: 'donut-default', label: 'Donut', desc: 'Standard donut', segments: 4 },
    { id: 'donut-thin', label: 'Thin ring', desc: 'Thin ring style', segments: 4, thin: true },
  ],
  kpi: [
    { id: 'kpi-trend', label: 'With trend', desc: 'KPI + sparkline' },
    { id: 'kpi-simple', label: 'Simple', desc: 'Number only', simple: true },
  ],
  table: [
    { id: 'table-default', label: 'Basic', desc: '4 columns', columns: 4 },
    { id: 'table-wide', label: 'Wide', desc: '6 columns', columns: 6 },
  ],
  gauge: [
    { id: 'gauge-default', label: 'Half gauge', desc: 'Semicircle' },
    { id: 'gauge-target', label: 'With target', desc: 'Target line', showTarget: true },
  ],
  combo: [
    { id: 'combo-default', label: 'Bar + Line', desc: 'Column + line overlay' },
    { id: 'combo-area-line', label: 'Area + Line', desc: 'Area fill + line', areaCombo: true },
  ],
  scatter: [
    { id: 'scatter-default', label: 'Scatter', desc: 'Point cloud' },
    { id: 'scatter-bubble', label: 'Bubble', desc: 'Sized circles', bubble: true },
  ],
  funnel: [
    { id: 'funnel-default', label: 'Funnel', desc: 'Pipeline stages' },
    { id: 'funnel-horizontal', label: 'Horizontal', desc: 'Left to right', horizontal: true },
  ],
  treemap: [
    { id: 'treemap-default', label: 'Treemap', desc: 'Proportional blocks' },
    { id: 'treemap-nested', label: 'Nested', desc: 'With sub-groups', nested: true },
  ],
  header: [
    { id: 'header-simple', label: 'Simple', desc: 'Title only' },
    { id: 'header-subtitle', label: 'With subtitle', desc: 'Title + description', hasSubtitle: true },
    { id: 'header-logo', label: 'With logo area', desc: 'Logo + title', hasLogo: true },
    { id: 'header-kpi', label: 'Title + KPIs', desc: 'Header with metric chips', hasKpis: true },
  ],
  filter: [
    { id: 'filter-dropdown', label: 'Dropdown', desc: 'Single select' },
    { id: 'filter-chips', label: 'Chip buttons', desc: 'Toggle chips', chipStyle: true },
    { id: 'filter-date', label: 'Date range', desc: 'Date picker', dateRange: true },
  ],
  card: [
    { id: 'card-simple', label: 'Simple', desc: 'Number only' },
    { id: 'card-change', label: 'With change', desc: 'Number + delta', showChange: true },
    { id: 'card-icon', label: 'With icon', desc: 'Icon + number', showIcon: true },
  ],
  button: [
    { id: 'button-primary', label: 'Primary', desc: 'Filled button' },
    { id: 'button-outline', label: 'Outline', desc: 'Border only', outline: true },
    { id: 'button-icon', label: 'With icon', desc: 'Icon + text', withIcon: true },
  ],
  textbox: [
    { id: 'textbox-plain', label: 'Plain', desc: 'Simple text block' },
    { id: 'textbox-callout', label: 'Callout', desc: 'Highlighted box', callout: true },
  ],
  image: [
    { id: 'image-default', label: 'Image', desc: 'Placeholder image' },
    { id: 'image-logo', label: 'Logo area', desc: 'Company logo spot', logo: true },
  ],
};

// Generate spec for a specific template variant
export function generateTemplateSpec(visualType, templateId, designSystem) {
  const templates = VISUAL_TEMPLATES[visualType];
  const template = templates?.find(t => t.id === templateId);
  if (!template) return generatePlaceholderSpec(visualType, designSystem);

  const colors = designSystem?.colors?.length
    ? designSystem.colors.map(c => c.hex)
    : COLORS_DEFAULT;

  // Apply template overrides to the base spec
  switch (visualType) {
    case 'column':
    case 'bar': {
      const categories = pickCategories();
      const sc = template.seriesCount || 1;
      return {
        visualType,
        title: visualType === 'column' ? 'Revenue by Region' : 'Sales by Category',
        categories,
        stacked: template.stacked || false,
        series: Array.from({ length: sc }, (_, i) => ({
          name: SERIES_NAMES[i] || `Series ${i + 1}`,
          color: colors[i % colors.length],
          values: generateValues(categories.length, 20, 120),
        })),
      };
    }
    case 'line': {
      const categories = CATEGORY_SETS.months.slice(0, 8);
      const sc = template.seriesCount || 1;
      return {
        visualType: 'line',
        title: 'Trend Over Time',
        categories,
        markers: template.markers || false,
        series: Array.from({ length: sc }, (_, i) => ({
          name: SERIES_NAMES[i] || `Series ${i + 1}`,
          color: colors[i % colors.length],
          values: generateValues(categories.length, 30, 100),
        })),
      };
    }
    case 'area': {
      const categories = CATEGORY_SETS.months.slice(0, 8);
      const sc = template.seriesCount || 1;
      return {
        visualType: 'area',
        title: 'Cumulative Growth',
        categories,
        stacked: template.stacked || false,
        series: Array.from({ length: sc }, (_, i) => ({
          name: SERIES_NAMES[i] || `Series ${i + 1}`,
          color: colors[i % colors.length],
          values: generateValues(categories.length, 40, 150),
        })),
      };
    }
    case 'pie': {
      const n = template.segments || 4;
      const names = Array.from({ length: n }, (_, i) => `Segment ${String.fromCharCode(65 + i)}`);
      return {
        visualType: 'pie',
        title: 'Market Share',
        series: names.map((name, i) => ({
          name, color: colors[i % colors.length], values: [rand(10, 50)],
        })),
      };
    }
    case 'donut': {
      const n = template.segments || 4;
      const names = Array.from({ length: n }, (_, i) => `Category ${String.fromCharCode(65 + i)}`);
      return {
        visualType: 'donut',
        title: 'Distribution',
        thin: template.thin || false,
        series: names.map((name, i) => ({
          name, color: colors[i % colors.length], values: [rand(10, 60)],
        })),
      };
    }
    case 'kpi': {
      const val = rand(100, 9999);
      const change = (Math.random() * 20 - 5).toFixed(1);
      return {
        visualType: 'kpi',
        title: 'Total Revenue',
        kpiValue: `$${val.toLocaleString()}K`,
        kpiChange: template.simple ? undefined : `${change}%`,
        kpiTrend: template.simple ? undefined : (parseFloat(change) >= 0 ? 'up' : 'down'),
        series: template.simple ? [] : [{ name: 'Trend', color: colors[0], values: generateValues(8, 50, 150) }],
      };
    }
    case 'table': {
      const cols = template.columns || 4;
      const baseHeaders = ['Name', 'Revenue', 'Growth', 'Status', 'Region', 'Quarter'];
      const headers = baseHeaders.slice(0, cols);
      const rows = CATEGORY_SETS.regions.slice(0, 4).map(region => {
        const row = [region, `$${rand(100, 999)}K`, `${(Math.random() * 30 - 5).toFixed(1)}%`, Math.random() > 0.3 ? 'Active' : 'Review', ['North', 'South', 'East'][rand(0, 2)], ['Q1', 'Q2', 'Q3', 'Q4'][rand(0, 3)]];
        return row.slice(0, cols);
      });
      return { visualType: 'table', title: 'Performance Summary', tableHeaders: headers, tableRows: rows };
    }
    case 'header': {
      const base = { visualType: 'header', title: 'Dashboard Title' };
      if (template.hasSubtitle) return { ...base, subtitle: 'Report subtitle or description text' };
      if (template.hasLogo) return { ...base, subtitle: 'Company Name', hasLogo: true };
      if (template.hasKpis) return { ...base, subtitle: 'Q4 2025', hasKpis: true, kpiChips: ['$4.2M Revenue', '+12.3% Growth', '1,284 Users'] };
      return base;
    }
    case 'filter': {
      if (template.chipStyle) return { visualType: 'filter', title: 'Filter', filterStyle: 'chips', filterOptions: ['All', 'Active', 'Pending', 'Closed'] };
      if (template.dateRange) return { visualType: 'filter', title: 'Date Range', filterStyle: 'date', filterOptions: ['Last 7 days', 'Last 30 days', 'Custom'] };
      return { visualType: 'filter', title: 'Filter', filterOptions: ['All', 'Region', 'Product', 'Date Range'] };
    }
    case 'card': {
      const val = `$${rand(100, 9999).toLocaleString()}K`;
      if (template.showChange) return { visualType: 'card', title: 'Total Sales', kpiValue: val, cardChange: '+12.3%', cardTrend: 'up' };
      if (template.showIcon) return { visualType: 'card', title: 'Total Sales', kpiValue: val, cardIcon: true };
      return { visualType: 'card', title: 'Total Sales', kpiValue: val };
    }
    case 'button': {
      if (template.outline) return { visualType: 'button', title: 'Navigate', buttonText: 'View Details', buttonStyle: 'outline' };
      if (template.withIcon) return { visualType: 'button', title: 'Navigate', buttonText: 'View Details', buttonStyle: 'icon' };
      return { visualType: 'button', title: 'Navigate', buttonText: 'View Details' };
    }
    case 'textbox': {
      if (template.callout) return { visualType: 'textbox', title: 'Note', textContent: 'Important: This section highlights key findings from the analysis.', textStyle: 'callout' };
      return { visualType: 'textbox', title: 'Text', textContent: 'Add your commentary or annotations here. This text box supports multiple lines of descriptive text.' };
    }
    case 'image': {
      if (template.logo) return { visualType: 'image', title: 'Logo', imagePlaceholder: true, imageStyle: 'logo' };
      return { visualType: 'image', title: 'Image', imagePlaceholder: true };
    }
    case 'combo': {
      const categories = CATEGORY_SETS.months.slice(0, 6);
      if (template.areaCombo) return {
        visualType: 'combo', title: 'Revenue vs Target', categories,
        series: [
          { name: 'Revenue', color: colors[0], values: generateValues(categories.length, 40, 120), chartType: 'area' },
          { name: 'Target', color: colors[1] || colors[0], values: generateValues(categories.length, 50, 100), chartType: 'line' },
        ],
      };
      return generatePlaceholderSpec('combo', designSystem);
    }
    case 'scatter': {
      const count = rand(8, 15);
      if (template.bubble) return {
        visualType: 'scatter', title: 'Bubble Analysis', bubble: true,
        series: [
          { name: 'X', color: colors[0], values: generateValues(count, 10, 100) },
          { name: 'Y', color: colors[1] || colors[0], values: generateValues(count, 10, 100) },
          { name: 'Size', color: colors[0], values: generateValues(count, 5, 40) },
        ],
      };
      return generatePlaceholderSpec('scatter', designSystem);
    }
    case 'funnel': {
      return generatePlaceholderSpec('funnel', designSystem);
    }
    case 'treemap': {
      return generatePlaceholderSpec('treemap', designSystem);
    }
    default:
      return generatePlaceholderSpec(visualType, designSystem);
  }
}
