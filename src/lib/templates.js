// Starter templates matching DEFAULT_STATE shape
// Each has a predefined palette, fonts, and name

export const TEMPLATES = [
  {
    id: 'template-financial-report',
    name: 'Financial Report',
    description: 'Clean, professional theme for financial dashboards with corporate blues and greens',
    screenshots: [],
    visuals: [],
    palette: [
      { hex: '#003B73', rgb: { r: 0, g: 59, b: 115 }, hsl: { h: 209, s: 100, l: 23 } },
      { hex: '#0074D9', rgb: { r: 0, g: 116, b: 217 }, hsl: { h: 208, s: 100, l: 43 } },
      { hex: '#7FDBFF', rgb: { r: 127, g: 219, b: 255 }, hsl: { h: 197, s: 100, l: 75 } },
      { hex: '#2ECC40', rgb: { r: 46, g: 204, b: 64 }, hsl: { h: 127, s: 63, l: 49 } },
      { hex: '#FF4136', rgb: { r: 255, g: 65, b: 54 }, hsl: { h: 3, s: 100, l: 61 } },
      { hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 }, hsl: { h: 0, s: 0, l: 96 } },
    ],
    fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 20, bodySize: 10 },
    background: '#FFFFFF',
    formatRules: [],
    sentinels: { good: '#2ECC40', neutral: '#FFDC00', bad: '#FF4136' },
  },
  {
    id: 'template-marketing-dashboard',
    name: 'Marketing Dashboard',
    description: 'Bold, vibrant theme for marketing analytics with energetic accent colors',
    screenshots: [],
    visuals: [],
    palette: [
      { hex: '#6C5CE7', rgb: { r: 108, g: 92, b: 231 }, hsl: { h: 247, s: 75, l: 63 } },
      { hex: '#FD79A8', rgb: { r: 253, g: 121, b: 168 }, hsl: { h: 339, s: 97, l: 73 } },
      { hex: '#00CEC9', rgb: { r: 0, g: 206, b: 201 }, hsl: { h: 179, s: 100, l: 40 } },
      { hex: '#FDCB6E', rgb: { r: 253, g: 203, b: 110 }, hsl: { h: 39, s: 98, l: 71 } },
      { hex: '#2D3436', rgb: { r: 45, g: 52, b: 54 }, hsl: { h: 193, s: 9, l: 19 } },
      { hex: '#DFE6E9', rgb: { r: 223, g: 230, b: 233 }, hsl: { h: 198, s: 16, l: 89 } },
    ],
    fonts: { heading: 'DIN', body: 'Segoe UI', titleSize: 22, bodySize: 11 },
    background: '#FAFAFA',
    formatRules: [],
    sentinels: { good: '#00CEC9', neutral: '#FDCB6E', bad: '#FD79A8' },
  },
  {
    id: 'template-sales-analysis',
    name: 'Sales Analysis',
    description: 'Warm, results-driven theme for sales performance tracking',
    screenshots: [],
    visuals: [],
    palette: [
      { hex: '#E17055', rgb: { r: 225, g: 112, b: 85 }, hsl: { h: 12, s: 72, l: 61 } },
      { hex: '#00B894', rgb: { r: 0, g: 184, b: 148 }, hsl: { h: 168, s: 100, l: 36 } },
      { hex: '#0984E3', rgb: { r: 9, g: 132, b: 227 }, hsl: { h: 206, s: 92, l: 46 } },
      { hex: '#636E72', rgb: { r: 99, g: 110, b: 114 }, hsl: { h: 196, s: 7, l: 42 } },
      { hex: '#2D3436', rgb: { r: 45, g: 52, b: 54 }, hsl: { h: 193, s: 9, l: 19 } },
      { hex: '#F8F9FA', rgb: { r: 248, g: 249, b: 250 }, hsl: { h: 210, s: 17, l: 98 } },
    ],
    fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 18, bodySize: 10 },
    background: '#FFFFFF',
    formatRules: [],
    sentinels: { good: '#00B894', neutral: '#FDCB6E', bad: '#E17055' },
  },
];

export function getTemplateById(id) {
  return TEMPLATES.find(t => t.id === id) || null;
}

export function createProjectFromTemplate(template) {
  return {
    ...template,
    id: crypto.randomUUID(),
    name: template.name,
    screenshots: [],
    visuals: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
