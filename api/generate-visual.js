import admin from 'firebase-admin';
import { GoogleGenAI } from '@google/genai';

// --- Firebase Admin (lazy init) ---
function getAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
  }
  return admin;
}

// --- Rate limiting via Firestore (20 requests/day per user) ---
const DAILY_LIMIT = 20;

async function checkRateLimit(uid) {
  const db = getAdmin().firestore();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const ref = db.collection('rateLimits').doc(`${uid}_${today}`);

  const snap = await ref.get();
  const count = snap.exists ? snap.data().count : 0;

  if (count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  await ref.set({ count: count + 1, uid, date: today }, { merge: true });
  return { allowed: true, remaining: DAILY_LIMIT - count - 1 };
}

// --- Gemini generation (mirrors client logic but with server-side key) ---
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite'];
const REQUEST_TIMEOUT_MS = 30_000;
const VALID_VISUAL_TYPES = ['bar', 'line', 'kpi', 'table', 'donut', 'area', 'scatter'];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function sanitizeString(str, maxLen = 200) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '').slice(0, maxLen);
}

function validateSpec(spec) {
  if (!spec || typeof spec !== 'object') throw new Error('Invalid spec');
  return {
    visualType: VALID_VISUAL_TYPES.includes(spec.visualType) ? spec.visualType : 'bar',
    title: sanitizeString(spec.title || '', 150),
    subtitle: sanitizeString(spec.subtitle || '', 200),
    measureUnit: sanitizeString(spec.measureUnit || '', 20),
    series: Array.isArray(spec.series)
      ? spec.series.slice(0, 20).map(s => ({
          name: sanitizeString(s.name || '', 100),
          color: HEX_RE.test(s.color) ? s.color : '#0078D4',
          values: Array.isArray(s.values) ? s.values.filter(v => typeof v === 'number').slice(0, 50) : [],
        }))
      : [],
    categories: Array.isArray(spec.categories)
      ? spec.categories.slice(0, 50).map(c => sanitizeString(String(c), 100))
      : [],
    kpiValue: sanitizeString(spec.kpiValue || '', 50),
    kpiTrend: ['up', 'down', 'neutral'].includes(spec.kpiTrend) ? spec.kpiTrend : 'neutral',
    kpiChange: sanitizeString(spec.kpiChange || '', 50),
    tableHeaders: Array.isArray(spec.tableHeaders)
      ? spec.tableHeaders.slice(0, 10).map(h => sanitizeString(String(h), 100))
      : [],
    tableRows: Array.isArray(spec.tableRows)
      ? spec.tableRows.slice(0, 50).map(row =>
          Array.isArray(row) ? row.slice(0, 10).map(v => sanitizeString(String(v), 200)) : []
        )
      : [],
  };
}

async function callGemini(description, designSystem) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured on server');

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

User request: "${sanitizeString(description, 500)}"

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
        setTimeout(() => reject(new Error(`Timed out (${model})`)), REQUEST_TIMEOUT_MS);
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
      if (!text) throw new Error('Empty response from Gemini');

      let spec;
      try {
        spec = JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) spec = JSON.parse(match[0]);
        else throw new Error('Invalid JSON from Gemini');
      }
      return validateSpec(spec);
    } catch (err) {
      lastError = err;
      const msg = (err?.message || '').toLowerCase();
      if (err?.status === 404 || msg.includes('not found') || msg.includes('deprecated')) continue;
      if (msg.includes('timed out')) throw err;
      throw err;
    }
  }
  throw lastError ?? new Error('All Gemini models failed');
}

// --- Vercel serverless handler ---
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verify Firebase auth token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sign in to use AI generation' });
  }

  let uid;
  try {
    const token = authHeader.slice(7);
    const decoded = await getAdmin().auth().verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }

  // Rate limit
  try {
    const { allowed, remaining } = await checkRateLimit(uid);
    res.setHeader('X-RateLimit-Remaining', remaining);
    if (!allowed) {
      return res.status(429).json({
        error: `Daily limit reached (${DAILY_LIMIT} generations/day). Resets at midnight UTC.`,
      });
    }
  } catch (err) {
    console.error('Rate limit check failed:', err);
    // Don't block if rate limiting fails — allow the request
  }

  // Validate request body
  const { description, designSystem } = req.body || {};
  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Missing description' });
  }

  // Generate
  try {
    const spec = await callGemini(description, designSystem || {});
    return res.status(200).json({ spec });
  } catch (err) {
    console.error('Gemini error:', err);
    const msg = err.message || 'Generation failed';
    const status = msg.includes('timed out') ? 504 : 500;
    return res.status(status).json({ error: msg });
  }
}
