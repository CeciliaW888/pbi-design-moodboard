import { GoogleGenAI } from '@google/genai';
import { auth } from '../firebase';

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-3.1-pro', 'gemini-3.0-pro'];
const REQUEST_TIMEOUT_MS = 30_000;

const VISION_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-3.1-pro'];

const VALID_VISUAL_TYPES = ['bar', 'line', 'kpi', 'table', 'donut', 'area', 'scatter'];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function sanitizeString(str, maxLen = 200) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '').slice(0, maxLen);
}

function validateSpec(spec) {
  if (!spec || typeof spec !== 'object') throw new Error('Invalid spec: not an object');

  const visualType = VALID_VISUAL_TYPES.includes(spec.visualType) ? spec.visualType : 'bar';

  const series = Array.isArray(spec.series)
    ? spec.series.slice(0, 20).map(s => ({
        name: sanitizeString(s.name || '', 100),
        color: HEX_RE.test(s.color) ? s.color : '#0078D4',
        values: Array.isArray(s.values) ? s.values.filter(v => typeof v === 'number').slice(0, 50) : [],
      }))
    : [];

  const categories = Array.isArray(spec.categories)
    ? spec.categories.slice(0, 50).map(c => sanitizeString(String(c), 100))
    : [];

  const tableHeaders = Array.isArray(spec.tableHeaders)
    ? spec.tableHeaders.slice(0, 10).map(h => sanitizeString(String(h), 100))
    : [];

  const tableRows = Array.isArray(spec.tableRows)
    ? spec.tableRows.slice(0, 50).map(row =>
        Array.isArray(row) ? row.slice(0, 10).map(v => sanitizeString(String(v), 200)) : []
      )
    : [];

  return {
    visualType,
    title: sanitizeString(spec.title || '', 150),
    subtitle: sanitizeString(spec.subtitle || '', 200),
    measureUnit: sanitizeString(spec.measureUnit || '', 20),
    series,
    categories,
    kpiValue: sanitizeString(spec.kpiValue || '', 50),
    kpiTrend: ['up', 'down', 'neutral'].includes(spec.kpiTrend) ? spec.kpiTrend : 'neutral',
    kpiChange: sanitizeString(spec.kpiChange || '', 50),
    tableHeaders,
    tableRows,
  };
}

/**
 * Try the serverless proxy first (no API key needed).
 * Falls back to BYOK if proxy unavailable (e.g., local dev without Vercel).
 */
async function generateViaProxy(description, designSystem) {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to use AI generation');

  const token = await user.getIdToken();

  const res = await fetch('/api/generate-visual', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ description, designSystem }),
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || `Server error (${res.status})`);
    err.status = res.status;
    err.remaining = res.headers.get('X-RateLimit-Remaining');
    throw err;
  }

  return { spec: data.spec, remaining: res.headers.get('X-RateLimit-Remaining') };
}

async function generateViaBYOK(apiKey, description, designSystem) {
  const ai = new GoogleGenAI({ apiKey });

  const paletteHexes = (designSystem.colors || []).slice(0, 8).map(c => c.hex);
  const paletteStr = paletteHexes.length
    ? paletteHexes.join(', ')
    : '#0078D4, #107C10, #F2C811, #D83B01, #5C2D91, #008272, #004B1C, #004E8C';

  const sentimentStr = designSystem.sentiment ? `\nDesign sentiment/style: ${designSystem.sentiment}` : '';
  const fontStr = designSystem.fonts
    ? `\nFonts: heading="${designSystem.fonts.heading || 'Segoe UI'}", body="${designSystem.fonts.body || 'Segoe UI'}"`
    : '';

  const prompt = `You are a Power BI report designer. Generate a realistic-looking data visualization spec for a business dashboard.

User request: "${description}"

Design system palette: ${paletteStr}
Background: ${designSystem.background || '#ffffff'}${sentimentStr}${fontStr}

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "visualType": "<one of: bar|line|kpi|table|donut|area|scatter>",
  "title": "<short visual title>",
  "subtitle": "<optional subtitle or date range>",
  "measureUnit": "<e.g. £, $, %, units — or empty string>",
  "series": [
    {
      "name": "<series name>",
      "color": "<hex from palette>",
      "values": [<6-12 realistic business numbers, NOT 1 2 3>]
    }
  ],
  "categories": ["<label1>", "<label2>", ...],
  "kpiValue": "<formatted value if visualType=kpi, e.g. £2.4M>",
  "kpiTrend": "<up|down|neutral>",
  "kpiChange": "<e.g. +12.3% vs last period>",
  "tableHeaders": ["<col1>", "<col2>", "<col3>"],
  "tableRows": [["<val>", "<val>", "<val>"], ...]
}

Rules:
- Choose the most appropriate visualType for the description
- Use colors from the palette for series; cycle if more series than colors
- Generate realistic business data (revenue in thousands/millions, rates as percentages, etc.)
- series[0] values must align 1-to-1 with categories
- For kpi type: still provide a short series with trend data for sparkline
- For scatter: series[0].values = X coordinates, series[1].values = Y coordinates (both same length)
- For table: provide 4-6 rows, 3-4 columns
- categories should have 6-12 labels (months, quarters, product names, regions, etc.)
- Return only the JSON object, nothing else`;

  let lastError;
  for (const model of MODELS) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Gemini request timed out after ${REQUEST_TIMEOUT_MS / 1000}s (model: ${model})`)), REQUEST_TIMEOUT_MS);
      });

      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        }),
        timeoutPromise,
      ]);

      const text = response.text;
      if (!text) throw new Error('Gemini returned an empty response');

      let spec;
      try {
        spec = JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) spec = JSON.parse(match[0]);
        else throw new Error('Gemini returned invalid JSON: ' + text.slice(0, 200));
      }
      return validateSpec(spec);
    } catch (err) {
      lastError = err;
      const status = err?.status || err?.httpStatusCode;
      const msg = (err?.message || '').toLowerCase();
      if (status === 404 || msg.includes('not found') || msg.includes('deprecated')) continue;
      if (msg.includes('timed out')) throw err;
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('econnrefused')) {
        throw new Error('Network error: could not reach Gemini API. Check your connection and try again.');
      }
      throw err;
    }
  }
  throw lastError ?? new Error('All Gemini models failed. Please try again later.');
}

/**
 * Main entry point for visual generation.
 * Tries the server proxy first (free for users, rate-limited).
 * Falls back to BYOK if proxy is unavailable.
 */
export async function generateVisualSpec(byokApiKey, description, designSystem) {
  // Try proxy first
  try {
    const result = await generateViaProxy(description, designSystem);
    return result.spec;
  } catch (err) {
    // If it's a real user-facing error (auth, rate limit), throw it
    if (err.status === 401 || err.status === 429) throw err;

    // Proxy unavailable (local dev, network issue) — try BYOK fallback
    if (byokApiKey) {
      console.warn('[geminiClient] Proxy unavailable, falling back to BYOK:', err.message);
      return generateViaBYOK(byokApiKey, description, designSystem);
    }

    // No proxy and no BYOK key
    throw new Error('AI generation is currently unavailable. Please try again later.');
  }
}

const ALLOWED_FONTS = [
  'Segoe UI', 'Segoe UI Semibold', 'Segoe UI Light', 'Segoe UI Bold',
  'Arial', 'Calibri', 'Cambria', 'Courier New', 'Georgia',
  'Lucida Sans', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
  'DIN', 'Poppins', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'
];

/**
 * Analyzes a dashboard screenshot to extract a complete design system.
 * Uses Gemini vision to identify fonts, background, layout style, and sentiment.
 * @param {string} apiKey
 * @param {string} imageBase64 - base64-encoded image (without data URL prefix)
 * @param {string} mimeType - e.g. 'image/png' or 'image/jpeg'
 * @returns {Promise<object>} { headingFont, bodyFont, background, sentiment, layoutStyle, suggestions }
 */
export async function analyzeDesignSystem(apiKey, imageBase64, mimeType = 'image/png') {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a Power BI dashboard design expert. Analyze this dashboard screenshot and extract the design system.

Look at the typography, background colors, layout patterns, and overall visual style.

Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "headingFont": "<closest match from this list: ${ALLOWED_FONTS.join(', ')}>",
  "bodyFont": "<closest match from the same list>",
  "background": "<hex color of the page/canvas background, e.g. #ffffff or #1a1a2e>",
  "isDarkTheme": <true if the dashboard uses a dark background, false otherwise>,
  "sentiment": "<one of: corporate|modern|minimal|bold|elegant|playful|technical>",
  "layoutStyle": "<one of: grid|freeform|dashboard-cards|narrative|kpi-focused>",
  "titleSize": <estimated heading font size 12-36>,
  "bodySize": <estimated body font size 8-14>,
  "suggestions": "<one sentence describing the overall design approach>"
}

Rules:
- Match fonts to the CLOSEST option in the allowed list based on visual appearance (serif vs sans-serif, weight, style)
- For background, extract the actual page/canvas color (not a visual's background)
- Be specific about sentiment - look at spacing, color usage, font weight
- suggestions should describe what makes this design effective`;

  const contents = [
    {
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType, data: imageBase64 } },
      ],
    },
  ];

  let lastError;
  for (const model of VISION_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { responseMimeType: 'application/json' },
      });

      const text = response.text;
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) result = JSON.parse(match[0]);
        else throw new Error('Gemini returned invalid JSON');
      }

      // Validate and sanitize
      return {
        headingFont: ALLOWED_FONTS.includes(result.headingFont) ? result.headingFont : 'Segoe UI Semibold',
        bodyFont: ALLOWED_FONTS.includes(result.bodyFont) ? result.bodyFont : 'Segoe UI',
        background: HEX_RE.test(result.background) ? result.background : '#ffffff',
        isDarkTheme: typeof result.isDarkTheme === 'boolean' ? result.isDarkTheme : false,
        sentiment: sanitizeString(result.sentiment || 'corporate', 50),
        layoutStyle: sanitizeString(result.layoutStyle || 'grid', 50),
        titleSize: Math.min(36, Math.max(12, Number(result.titleSize) || 18)),
        bodySize: Math.min(14, Math.max(8, Number(result.bodySize) || 10)),
        suggestions: sanitizeString(result.suggestions || '', 300),
      };
    } catch (err) {
      lastError = err;
      const status = err?.status || err?.httpStatusCode;
      const msg = (err?.message || '').toLowerCase();
      if (status === 404 || msg.includes('not found') || msg.includes('deprecated')) {
        console.warn(`[geminiClient] Vision model ${model} unavailable, trying next…`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
