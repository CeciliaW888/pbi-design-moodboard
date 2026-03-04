// Community Template Gallery - Data & Schema
// Ditto: The shape-shifting design studio for Power BI

/**
 * Template schema:
 * {
 *   id: string (unique),
 *   name: string,
 *   description: string,
 *   category: 'corporate' | 'creative' | 'dark' | 'minimal' | 'vibrant' | 'industry',
 *   tags: string[],
 *   author: { name: string, avatar?: string },
 *   popularity: number (0-100),
 *   downloads: number,
 *   createdAt: number (timestamp),
 *   featured: boolean,
 *   palette: ColorEntry[],
 *   fonts: { heading, body, titleSize, bodySize },
 *   background: string,
 *   sentinels: { good, neutral, bad },
 *   formatRules: any[],
 * }
 */

export const CATEGORIES = [
  { id: 'all', label: 'All Templates', emoji: '✨' },
  { id: 'corporate', label: 'Corporate', emoji: '🏢' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'dark', label: 'Dark Mode', emoji: '🌙' },
  { id: 'minimal', label: 'Minimal', emoji: '◻️' },
  { id: 'vibrant', label: 'Vibrant', emoji: '🌈' },
  { id: 'industry', label: 'Industry', emoji: '🏭' },
];

export const SORT_OPTIONS = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'newest', label: 'Newest' },
  { id: 'downloads', label: 'Most Used' },
  { id: 'name', label: 'A-Z' },
];

const now = Date.now();
const day = 86400000;

export const COMMUNITY_TEMPLATES = [
  // Corporate
  {
    id: 'ct-executive-blue',
    name: 'Executive Blue',
    description: 'Clean corporate theme with trustworthy navy and sky blue tones. Perfect for board presentations.',
    category: 'corporate',
    tags: ['corporate', 'professional', 'finance', 'board'],
    author: { name: 'Ditto Team' },
    popularity: 95,
    downloads: 1243,
    createdAt: now - 30 * day,
    featured: true,
    palette: [
      { hex: '#1B365D', rgb: { r: 27, g: 54, b: 93 }, hsl: { h: 215, s: 55, l: 24 } },
      { hex: '#2E6DB4', rgb: { r: 46, g: 109, b: 180 }, hsl: { h: 212, s: 59, l: 44 } },
      { hex: '#5BA4E6', rgb: { r: 91, g: 164, b: 230 }, hsl: { h: 209, s: 73, l: 63 } },
      { hex: '#A8D5F2', rgb: { r: 168, g: 213, b: 242 }, hsl: { h: 204, s: 76, l: 80 } },
      { hex: '#E8E8E8', rgb: { r: 232, g: 232, b: 232 }, hsl: { h: 0, s: 0, l: 91 } },
      { hex: '#333333', rgb: { r: 51, g: 51, b: 51 }, hsl: { h: 0, s: 0, l: 20 } },
    ],
    fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 20, bodySize: 10 },
    background: '#FFFFFF',
    formatRules: [],
    sentinels: { good: '#2ECC40', neutral: '#F2C811', bad: '#D83B01' },
  },
  {
    id: 'ct-consulting-slate',
    name: 'Consulting Slate',
    description: 'Sophisticated grey-blue palette inspired by McKinsey-style reports. Understated elegance.',
    category: 'corporate',
    tags: ['corporate', 'consulting', 'professional', 'grey'],
    author: { name: 'Ditto Team' },
    popularity: 82,
    downloads: 876,
    createdAt: now - 25 * day,
    featured: false,
    palette: [
      { hex: '#2C3E50', rgb: { r: 44, g: 62, b: 80 }, hsl: { h: 210, s: 29, l: 24 } },
      { hex: '#34495E', rgb: { r: 52, g: 73, b: 94 }, hsl: { h: 210, s: 29, l: 29 } },
      { hex: '#7F8C8D', rgb: { r: 127, g: 140, b: 141 }, hsl: { h: 184, s: 6, l: 53 } },
      { hex: '#BDC3C7', rgb: { r: 189, g: 195, b: 199 }, hsl: { h: 204, s: 8, l: 76 } },
      { hex: '#ECF0F1', rgb: { r: 236, g: 240, b: 241 }, hsl: { h: 192, s: 15, l: 94 } },
      { hex: '#E74C3C', rgb: { r: 231, g: 76, b: 60 }, hsl: { h: 6, s: 78, l: 57 } },
    ],
    fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 18, bodySize: 10 },
    background: '#FFFFFF',
    formatRules: [],
    sentinels: { good: '#27AE60', neutral: '#F39C12', bad: '#E74C3C' },
  },

  // Creative
  {
    id: 'ct-sunset-gradient',
    name: 'Sunset Gradient',
    description: 'Warm orange-to-pink palette that brings energy and creativity to dashboards.',
    category: 'creative',
    tags: ['creative', 'warm', 'gradient', 'modern'],
    author: { name: 'Ditto Team' },
    popularity: 91,
    downloads: 1087,
    createdAt: now - 20 * day,
    featured: true,
    palette: [
      { hex: '#FF6B6B', rgb: { r: 255, g: 107, b: 107 }, hsl: { h: 0, s: 100, l: 71 } },
      { hex: '#FFA07A', rgb: { r: 255, g: 160, b: 122 }, hsl: { h: 17, s: 100, l: 74 } },
      { hex: '#FFD93D', rgb: { r: 255, g: 217, b: 61 }, hsl: { h: 48, s: 100, l: 62 } },
      { hex: '#6BCB77', rgb: { r: 107, g: 203, b: 119 }, hsl: { h: 128, s: 47, l: 61 } },
      { hex: '#4D96FF', rgb: { r: 77, g: 150, b: 255 }, hsl: { h: 215, s: 100, l: 65 } },
      { hex: '#2D2D2D', rgb: { r: 45, g: 45, b: 45 }, hsl: { h: 0, s: 0, l: 18 } },
    ],
    fonts: { heading: 'DIN', body: 'Segoe UI', titleSize: 22, bodySize: 11 },
    background: '#FFF9F0',
    formatRules: [],
    sentinels: { good: '#6BCB77', neutral: '#FFD93D', bad: '#FF6B6B' },
  },
  {
    id: 'ct-neon-pop',
    name: 'Neon Pop',
    description: 'Bold neon accents on clean white. For dashboards that demand attention.',
    category: 'creative',
    tags: ['creative', 'bold', 'neon', 'modern'],
    author: { name: 'Community' },
    popularity: 78,
    downloads: 654,
    createdAt: now - 15 * day,
    featured: false,
    palette: [
      { hex: '#FF00FF', rgb: { r: 255, g: 0, b: 255 }, hsl: { h: 300, s: 100, l: 50 } },
      { hex: '#00FFFF', rgb: { r: 0, g: 255, b: 255 }, hsl: { h: 180, s: 100, l: 50 } },
      { hex: '#FFFF00', rgb: { r: 255, g: 255, b: 0 }, hsl: { h: 60, s: 100, l: 50 } },
      { hex: '#FF4444', rgb: { r: 255, g: 68, b: 68 }, hsl: { h: 0, s: 100, l: 63 } },
      { hex: '#1A1A2E', rgb: { r: 26, g: 26, b: 46 }, hsl: { h: 240, s: 28, l: 14 } },
      { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    ],
    fonts: { heading: 'DIN', body: 'Segoe UI', titleSize: 24, bodySize: 11 },
    background: '#FFFFFF',
    formatRules: [],
    sentinels: { good: '#00FFFF', neutral: '#FFFF00', bad: '#FF4444' },
  },

  // Dark Mode
  {
    id: 'ct-midnight',
    name: 'Midnight',
    description: 'Deep dark theme with electric blue accents. Easy on the eyes, stunning on screens.',
    category: 'dark',
    tags: ['dark', 'blue', 'modern', 'night'],
    author: { name: 'Ditto Team' },
    popularity: 97,
    downloads: 1567,
    createdAt: now - 28 * day,
    featured: true,
    palette: [
      { hex: '#0D1B2A', rgb: { r: 13, g: 27, b: 42 }, hsl: { h: 211, s: 53, l: 11 } },
      { hex: '#1B2838', rgb: { r: 27, g: 40, b: 56 }, hsl: { h: 213, s: 35, l: 16 } },
      { hex: '#00B4D8', rgb: { r: 0, g: 180, b: 216 }, hsl: { h: 190, s: 100, l: 42 } },
      { hex: '#90E0EF', rgb: { r: 144, g: 224, b: 239 }, hsl: { h: 189, s: 78, l: 75 } },
      { hex: '#CAF0F8', rgb: { r: 202, g: 240, b: 248 }, hsl: { h: 190, s: 79, l: 88 } },
      { hex: '#48CAE4', rgb: { r: 72, g: 202, b: 228 }, hsl: { h: 190, s: 73, l: 59 } },
    ],
    fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 20, bodySize: 10 },
    background: '#0D1B2A',
    formatRules: [],
    sentinels: { good: '#00F5D4', neutral: '#FEE440', bad: '#F15BB5' },
  },
  {
    id: 'ct-charcoal-ember',
    name: 'Charcoal & Ember',
    description: 'Dark grey base with warm amber accents. Sophisticated and modern.',
    category: 'dark',
    tags: ['dark', 'warm', 'amber', 'sophisticated'],
    author: { name: 'Community' },
    popularity: 85,
    downloads: 923,
    createdAt: now - 18 * day,
    featured: false,
    palette: [
      { hex: '#1A1A1A', rgb: { r: 26, g: 26, b: 26 }, hsl: { h: 0, s: 0, l: 10 } },
      { hex: '#2D2D2D', rgb: { r: 45, g: 45, b: 45 }, hsl: { h: 0, s: 0, l: 18 } },
      { hex: '#FF8C42', rgb: { r: 255, g: 140, b: 66 }, hsl: { h: 23, s: 100, l: 63 } },
      { hex: '#FFD166', rgb: { r: 255, g: 209, b: 102 }, hsl: { h: 42, s: 100, l: 70 } },
      { hex: '#E8E8E8', rgb: { r: 232, g: 232, b: 232 }, hsl: { h: 0, s: 0, l: 91 } },
      { hex: '#4A4A4A', rgb: { r: 74, g: 74, b: 74 }, hsl: { h: 0, s: 0, l: 29 } },
    ],
    fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 20, bodySize: 10 },
    background: '#1A1A1A',
    formatRules: [],
    sentinels: { good: '#06D6A0', neutral: '#FFD166', bad: '#EF476F' },
  },

  // Minimal
  {
    id: 'ct-paper-white',
    name: 'Paper White',
    description: 'Ultra-clean monochrome with a single accent. When less is more.',
    category: 'minimal',
    tags: ['minimal', 'clean', 'monochrome', 'simple'],
    author: { name: 'Ditto Team' },
    popularity: 88,
    downloads: 1102,
    createdAt: now - 22 * day,
    featured: true,
    palette: [
      { hex: '#111111', rgb: { r: 17, g: 17, b: 17 }, hsl: { h: 0, s: 0, l: 7 } },
      { hex: '#555555', rgb: { r: 85, g: 85, b: 85 }, hsl: { h: 0, s: 0, l: 33 } },
      { hex: '#999999', rgb: { r: 153, g: 153, b: 153 }, hsl: { h: 0, s: 0, l: 60 } },
      { hex: '#CCCCCC', rgb: { r: 204, g: 204, b: 204 }, hsl: { h: 0, s: 0, l: 80 } },
      { hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 }, hsl: { h: 0, s: 0, l: 96 } },
      { hex: '#0066FF', rgb: { r: 0, g: 102, b: 255 }, hsl: { h: 216, s: 100, l: 50 } },
    ],
    fonts: { heading: 'Segoe UI Light', body: 'Segoe UI', titleSize: 18, bodySize: 10 },
    background: '#FFFFFF',
    formatRules: [],
    sentinels: { good: '#111111', neutral: '#999999', bad: '#0066FF' },
  },
  {
    id: 'ct-scandinavian',
    name: 'Scandinavian',
    description: 'Muted pastels and gentle tones inspired by Nordic design principles.',
    category: 'minimal',
    tags: ['minimal', 'pastel', 'nordic', 'calm'],
    author: { name: 'Community' },
    popularity: 76,
    downloads: 589,
    createdAt: now - 12 * day,
    featured: false,
    palette: [
      { hex: '#5C6B73', rgb: { r: 92, g: 107, b: 115 }, hsl: { h: 201, s: 11, l: 41 } },
      { hex: '#9DB4C0', rgb: { r: 157, g: 180, b: 192 }, hsl: { h: 201, s: 22, l: 68 } },
      { hex: '#C2DFE3', rgb: { r: 194, g: 223, b: 227 }, hsl: { h: 187, s: 33, l: 83 } },
      { hex: '#E0FBFC', rgb: { r: 224, g: 251, b: 252 }, hsl: { h: 182, s: 82, l: 93 } },
      { hex: '#253237', rgb: { r: 37, g: 50, b: 55 }, hsl: { h: 197, s: 20, l: 18 } },
      { hex: '#D4A574', rgb: { r: 212, g: 165, b: 116 }, hsl: { h: 31, s: 52, l: 64 } },
    ],
    fonts: { heading: 'Segoe UI Light', body: 'Segoe UI', titleSize: 18, bodySize: 10 },
    background: '#F8F9FA',
    formatRules: [],
    sentinels: { good: '#5C6B73', neutral: '#D4A574', bad: '#9DB4C0' },
  },

  // Vibrant
  {
    id: 'ct-rainbow-data',
    name: 'Rainbow Data',
    description: 'Full spectrum palette for multi-category data visualization. Max contrast, max clarity.',
    category: 'vibrant',
    tags: ['vibrant', 'colorful', 'data-heavy', 'categories'],
    author: { name: 'Ditto Team' },
    popularity: 84,
    downloads: 978,
    createdAt: now - 24 * day,
    featured: false,
    palette: [
      { hex: '#FF6384', rgb: { r: 255, g: 99, b: 132 }, hsl: { h: 347, s: 100, l: 69 } },
      { hex: '#36A2EB', rgb: { r: 54, g: 162, b: 235 }, hsl: { h: 204, s: 82, l: 57 } },
      { hex: '#FFCE56', rgb: { r: 255, g: 206, b: 86 }, hsl: { h: 43, s: 100, l: 67 } },
      { hex: '#4BC0C0', rgb: { r: 75, g: 192, b: 192 }, hsl: { h: 180, s: 47, l: 52 } },
      { hex: '#9966FF', rgb: { r: 153, g: 102, b: 255 }, hsl: { h: 260, s: 100, l: 70 } },
      { hex: '#FF9F40', rgb: { r: 255, g: 159, b: 64 }, hsl: { h: 30, s: 100, l: 63 } },
    ],
    fonts: { heading: 'DIN', body: 'Segoe UI', titleSize: 20, bodySize: 11 },
    background: '#FFFFFF',
    formatRules: [],
    sentinels: { good: '#4BC0C0', neutral: '#FFCE56', bad: '#FF6384' },
  },
  {
    id: 'ct-electric-dreams',
    name: 'Electric Dreams',
    description: 'Cyberpunk-inspired vivid purples, pinks, and teals. Dashboard as art.',
    category: 'vibrant',
    tags: ['vibrant', 'cyberpunk', 'modern', 'bold'],
    author: { name: 'Community' },
    popularity: 89,
    downloads: 1045,
    createdAt: now - 10 * day,
    featured: true,
    palette: [
      { hex: '#7B2FBE', rgb: { r: 123, g: 47, b: 190 }, hsl: { h: 272, s: 60, l: 46 } },
      { hex: '#E040FB', rgb: { r: 224, g: 64, b: 251 }, hsl: { h: 291, s: 96, l: 62 } },
      { hex: '#00E5FF', rgb: { r: 0, g: 229, b: 255 }, hsl: { h: 186, s: 100, l: 50 } },
      { hex: '#1DE9B6', rgb: { r: 29, g: 233, b: 182 }, hsl: { h: 165, s: 82, l: 51 } },
      { hex: '#0A0A1A', rgb: { r: 10, g: 10, b: 26 }, hsl: { h: 240, s: 44, l: 7 } },
      { hex: '#F0F0FF', rgb: { r: 240, g: 240, b: 255 }, hsl: { h: 240, s: 100, l: 97 } },
    ],
    fonts: { heading: 'DIN', body: 'Segoe UI', titleSize: 22, bodySize: 11 },
    background: '#0A0A1A',
    formatRules: [],
    sentinels: { good: '#1DE9B6', neutral: '#00E5FF', bad: '#E040FB' },
  },

  // Industry
  {
    id: 'ct-healthcare',
    name: 'Healthcare',
    description: 'Calming blues and greens used in medical and health analytics dashboards.',
    category: 'industry',
    tags: ['industry', 'healthcare', 'medical', 'calm'],
    author: { name: 'Ditto Team' },
    popularity: 80,
    downloads: 734,
    createdAt: now - 26 * day,
    featured: false,
    palette: [
      { hex: '#005B96', rgb: { r: 0, g: 91, b: 150 }, hsl: { h: 204, s: 100, l: 29 } },
      { hex: '#03A9F4', rgb: { r: 3, g: 169, b: 244 }, hsl: { h: 199, s: 98, l: 48 } },
      { hex: '#4DB6AC', rgb: { r: 77, g: 182, b: 172 }, hsl: { h: 174, s: 42, l: 51 } },
      { hex: '#81C784', rgb: { r: 129, g: 199, b: 132 }, hsl: { h: 123, s: 38, l: 64 } },
      { hex: '#E0F7FA', rgb: { r: 224, g: 247, b: 250 }, hsl: { h: 187, s: 72, l: 93 } },
      { hex: '#37474F', rgb: { r: 55, g: 71, b: 79 }, hsl: { h: 200, s: 18, l: 26 } },
    ],
    fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 18, bodySize: 10 },
    background: '#FAFFFE',
    formatRules: [],
    sentinels: { good: '#81C784', neutral: '#FFB74D', bad: '#E57373' },
  },
  {
    id: 'ct-fintech',
    name: 'Fintech',
    description: 'Modern fintech palette with deep navy, mint green accents. Trust meets innovation.',
    category: 'industry',
    tags: ['industry', 'fintech', 'banking', 'modern'],
    author: { name: 'Community' },
    popularity: 86,
    downloads: 891,
    createdAt: now - 8 * day,
    featured: false,
    palette: [
      { hex: '#0A2342', rgb: { r: 10, g: 35, b: 66 }, hsl: { h: 213, s: 74, l: 15 } },
      { hex: '#126E82', rgb: { r: 18, g: 110, b: 130 }, hsl: { h: 191, s: 76, l: 29 } },
      { hex: '#51C4D3', rgb: { r: 81, g: 196, b: 211 }, hsl: { h: 187, s: 56, l: 57 } },
      { hex: '#D6F8D6', rgb: { r: 214, g: 248, b: 214 }, hsl: { h: 120, s: 68, l: 91 } },
      { hex: '#132E32', rgb: { r: 19, g: 46, b: 50 }, hsl: { h: 188, s: 45, l: 14 } },
      { hex: '#00E676', rgb: { r: 0, g: 230, b: 118 }, hsl: { h: 151, s: 100, l: 45 } },
    ],
    fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 20, bodySize: 10 },
    background: '#FFFFFF',
    formatRules: [],
    sentinels: { good: '#00E676', neutral: '#FFD600', bad: '#FF1744' },
  },
];

// Helper to search/filter templates
export function filterTemplates(templates, { category = 'all', search = '', sort = 'popular' } = {}) {
  let filtered = [...templates];

  if (category !== 'all') {
    filtered = filtered.filter(t => t.category === category);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.includes(q))
    );
  }

  switch (sort) {
    case 'popular':
      filtered.sort((a, b) => b.popularity - a.popularity);
      break;
    case 'newest':
      filtered.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case 'downloads':
      filtered.sort((a, b) => b.downloads - a.downloads);
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return filtered;
}
