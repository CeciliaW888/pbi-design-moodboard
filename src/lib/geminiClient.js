import { GoogleGenAI } from '@google/genai';

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-3.1-pro', 'gemini-3.0-pro'];

/**
 * Generates a PBI visual spec using Gemini.
 * @param {string} apiKey
 * @param {string} description  - user's plain-text description of the visual
 * @param {object} designSystem - { colors: [{hex}], fonts, background, name }
 * @returns {Promise<object>} spec
 */
export async function generateVisualSpec(apiKey, description, designSystem) {
  const ai = new GoogleGenAI({ apiKey });

  const paletteHexes = (designSystem.colors || []).slice(0, 8).map(c => c.hex);
  const paletteStr = paletteHexes.length
    ? paletteHexes.join(', ')
    : '#0078D4, #107C10, #F2C811, #D83B01, #5C2D91, #008272, #004B1C, #004E8C';

  const prompt = `You are a Power BI report designer. Generate a realistic-looking data visualization spec for a business dashboard.

User request: "${description}"

Design system palette: ${paletteStr}
Background: ${designSystem.background || '#ffffff'}

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
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      try {
        return JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error('Gemini returned invalid JSON: ' + text.slice(0, 200));
      }
    } catch (err) {
      lastError = err;
      const status = err?.status || err?.httpStatusCode;
      const msg = (err?.message || '').toLowerCase();
      if (status === 404 || msg.includes('not found') || msg.includes('deprecated')) {
        console.warn(`[geminiClient] Model ${model} unavailable, trying next…`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
