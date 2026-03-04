import JSZip from 'jszip';

const PBI_PAGE_W = 1280;
const PBI_PAGE_H = 720;

const TYPE_MAP = {
  bar:     'barChart',
  column:  'clusteredColumnChart',
  line:    'lineChart',
  area:    'areaChart',
  combo:   'lineClusteredColumnComboChart',
  kpi:     'kpi',
  card:    'card',
  donut:   'donutChart',
  pie:     'pieChart',
  scatter: 'scatterChart',
  table:   'tableEx',
  gauge:   'gauge',
  treemap: 'treemap',
  funnel:  'funnel',
  header:  'textbox',
  filter:  'slicer',
  button:  'actionButton',
  textbox: 'textbox',
  image:   'image',
};

/**
 * Exports visuals as a zip of PBIP-compatible visual.json files.
 *
 * Output structure:
 *   visuals/
 *     <visual-id>/visual.json   ← drop into your PBIP project's
 *                                  definition/pages/<PageName>/visuals/
 *     README.md
 *
 * @param {Array}  visuals
 * @param {object} designSystem
 * @returns {Promise<Blob>}
 */
export async function exportPBIPVisuals(visuals, designSystem) {
  const readyVisuals = visuals.filter(v => v.status === 'ready' && v.spec);
  if (!readyVisuals.length) throw new Error('No ready visuals to export');

  // Normalise canvas coords → 1280×720 PBI page
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const v of readyVisuals) {
    minX = Math.min(minX, v.x);
    minY = Math.min(minY, v.y);
    maxX = Math.max(maxX, v.x + v.width);
    maxY = Math.max(maxY, v.y + v.height);
  }
  const contentW = maxX - minX || PBI_PAGE_W;
  const contentH = maxY - minY || PBI_PAGE_H;
  const scale = Math.min(PBI_PAGE_W / contentW, PBI_PAGE_H / contentH, 1);

  const zip = new JSZip();
  const folder = zip.folder('visuals');

  for (const v of readyVisuals) {
    const px = Math.round((v.x - minX) * scale);
    const py = Math.round((v.y - minY) * scale);
    const pw = Math.round(v.width  * scale);
    const ph = Math.round(v.height * scale);

    const pbiType = TYPE_MAP[v.spec.visualType] || TYPE_MAP[v.visualType] || 'barChart';

    const dataColors = (v.spec.series || []).map(s => ({
      solid: { color: s.color || '#0078D4' },
    }));

    const visualJson = {
      $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/1.0.0/schema.json',
      name: v.id,
      position: {
        x: px, y: py,
        width: pw, height: ph,
        z: v.zIndex || 1,
        tabOrder: 0,
      },
      visual: {
        visualType: pbiType,
        query: { queryState: {} },
        objects: {
          ...(dataColors.length && { dataColors }),
          background: {
            show: [{ conditions: [], value: { expr: { Literal: { Value: 'true' } } } }],
            color: [{ conditions: [], value: { expr: { Literal: { Value: `'${designSystem.background || '#ffffff'}'` } } } }],
          },
        },
        vcObjects: {
          title: {
            properties: {
              text: { expr: { Literal: { Value: `'${(v.spec.title || v.name || '').replace(/'/g, "\\'")}′` } } },
            },
          },
        },
      },
    };

    folder.folder(v.id).file('visual.json', JSON.stringify(visualJson, null, 2));
  }

  folder.file('README.md', buildReadme(readyVisuals, designSystem));

  return zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
}

/**
 * Exports a complete PBIR folder structure with report.json, page.json, and visual.json files.
 * Includes placeholder query bindings so visuals render with dummy data in PBI Desktop.
 */
export async function exportFullPBIR(visuals, designSystem, pageSettings = {}) {
  const readyVisuals = visuals.filter(v => v.spec);
  if (!readyVisuals.length) throw new Error('No visuals to export');

  const pw = pageSettings.pageWidth || PBI_PAGE_W;
  const ph = pageSettings.pageHeight || PBI_PAGE_H;

  const zip = new JSZip();
  const def = zip.folder('definition');

  // report.json
  const dataColors = (designSystem.colors || []).slice(0, 8).map(c => c.hex);
  const reportJson = {
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/report/1.0.0/schema.json',
    name: designSystem.name || 'Prototype Report',
    themeConfig: {
      dataColors: dataColors.length ? dataColors : ['#0078D4', '#E3008C', '#00B294', '#FFB900', '#D83B01', '#5C2D91'],
      textClasses: {
        title: { fontFace: designSystem.fonts?.heading || 'Segoe UI Semibold' },
        label: { fontFace: designSystem.fonts?.body || 'Segoe UI' },
      },
      background: designSystem.background || '#FFFFFF',
    },
    dataSourcePlaceholders: [
      {
        name: 'PlaceholderSource',
        description: 'Connect your real data source here',
        type: 'placeholder',
      },
    ],
  };
  def.file('report.json', JSON.stringify(reportJson, null, 2));

  // page.json
  const pageFolder = def.folder('pages').folder('ReportPage');
  const pageJson = {
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/1.0.0/schema.json',
    name: 'ReportPage',
    displayName: 'Page 1',
    width: pw,
    height: ph,
    background: {
      color: designSystem.background || '#FFFFFF',
      transparency: 0,
    },
  };
  pageFolder.file('page.json', JSON.stringify(pageJson, null, 2));

  // visual.json files
  const visualsFolder = pageFolder.folder('visuals');

  for (const v of readyVisuals) {
    const pbiType = TYPE_MAP[v.spec.visualType] || TYPE_MAP[v.visualType] || 'barChart';

    const seriesColors = (v.spec.series || []).map(s => ({
      solid: { color: s.color || '#0078D4' },
    }));

    // Build placeholder query bindings
    const queryState = buildPlaceholderQuery(v.spec);

    const visualJson = {
      $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/1.0.0/schema.json',
      name: v.id,
      position: {
        x: Math.round(v.x || 0),
        y: Math.round(v.y || 0),
        width: Math.round(v.width || 380),
        height: Math.round(v.height || 260),
        z: v.zIndex || 1,
        tabOrder: 0,
      },
      visual: {
        visualType: pbiType,
        query: { queryState },
        objects: {
          ...(seriesColors.length && { dataColors: seriesColors }),
          background: {
            show: [{ conditions: [], value: { expr: { Literal: { Value: 'true' } } } }],
            color: [{ conditions: [], value: { expr: { Literal: { Value: `'${designSystem.background || '#ffffff'}'` } } } }],
          },
        },
        vcObjects: {
          title: {
            properties: {
              text: { expr: { Literal: { Value: `'${(v.spec.title || v.name || '').replace(/'/g, "\\'")}'` } } },
            },
          },
        },
        // Inline sample data so PBI Desktop renders placeholder visuals
        sampleData: buildSampleData(v.spec),
      },
    };

    visualsFolder.folder(v.id).file('visual.json', JSON.stringify(visualJson, null, 2));
  }

  // README
  def.file('README.md', buildPBIRReadme(readyVisuals, designSystem, pw, ph));

  return zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
}

function buildPlaceholderQuery(spec) {
  const type = spec.visualType;
  if (type === 'kpi') {
    return {
      Value: {
        projections: [{ field: { Column: { Property: 'KPI_Value' } } }],
      },
    };
  }
  if (type === 'table') {
    return {
      Values: {
        projections: (spec.tableHeaders || []).map(h => ({
          field: { Column: { Property: h.replace(/\s/g, '_') } },
        })),
      },
    };
  }
  // Bar, line, area, donut, scatter
  const qs = {};
  if (spec.categories?.length) {
    qs.Category = {
      projections: [{ field: { Column: { Property: 'Category' } } }],
    };
  }
  if (spec.series?.length) {
    qs.Y = {
      projections: spec.series.map((s, i) => ({
        field: { Column: { Property: s.name?.replace(/\s/g, '_') || `Measure_${i}` } },
      })),
    };
  }
  return qs;
}

function buildSampleData(spec) {
  const type = spec.visualType;
  if (type === 'table') {
    return {
      headers: spec.tableHeaders || [],
      rows: spec.tableRows || [],
    };
  }
  if (type === 'kpi') {
    return {
      value: spec.kpiValue,
      change: spec.kpiChange,
      trend: spec.kpiTrend,
    };
  }
  return {
    categories: spec.categories || [],
    series: (spec.series || []).map(s => ({
      name: s.name,
      values: s.values || [],
    })),
  };
}

function buildPBIRReadme(visuals, ds, pageW, pageH) {
  return [
    `# PBIR Report Definition`,
    ``,
    `Generated by **${ds.name || 'PBI Design Moodboard'}** on ${new Date().toLocaleDateString()}.`,
    ``,
    `## How to use`,
    ``,
    `1. Extract this ZIP into a new folder ending in \`.Report\``,
    `2. Open the folder in Power BI Desktop (File → Open → Browse folder)`,
    `3. Visuals will render with placeholder data at their designed positions`,
    `4. Connect your real data source to replace placeholder bindings`,
    `5. Adjust field mappings in each visual as needed`,
    ``,
    `## Page Settings`,
    ``,
    `- **Width:** ${pageW}px`,
    `- **Height:** ${pageH}px`,
    `- **Background:** ${ds.background || '#FFFFFF'}`,
    ``,
    `## Visuals (${visuals.length})`,
    ``,
    ...visuals.map(v => [
      `### ${v.spec.title || v.name}`,
      `- **Type:** \`${v.spec.visualType}\``,
      `- **Position:** (${Math.round(v.x || 0)}, ${Math.round(v.y || 0)}) — ${Math.round(v.width || 380)} × ${Math.round(v.height || 260)}`,
      `- **ID:** \`${v.id}\``,
      ``,
    ].join('\n')),
  ].join('\n');
}

function buildReadme(visuals, ds) {
  return [
    `# PBIP Visual Definitions`,
    ``,
    `Generated by **${ds.name || 'PBI Design Moodboard'}** on ${new Date().toLocaleDateString()}.`,
    ``,
    `## How to use`,
    ``,
    `1. Open your Power BI project folder (ends in \`.Report\`)`,
    `2. Navigate to \`definition/pages/<YourPage>/visuals/\``,
    `3. Copy each \`<visual-id>/\` folder from this zip into that directory`,
    `4. Reload in Power BI Desktop — visuals appear at their positions`,
    `5. Replace placeholder queries with your real data fields`,
    ``,
    `Visual positions are normalised to **1280 × 720**. Set your page to this size in PBI: View → Page view → Page size → Custom.`,
    ``,
    `## Visuals`,
    ``,
    ...visuals.map(v => [
      `### ${v.spec.title || v.name}`,
      `- **Type:** \`${v.spec.visualType}\``,
      `- **ID:** \`${v.id}\``,
      v.description ? `- **Prompt:** ${v.description}` : null,
      ``,
    ].filter(Boolean).join('\n')),
  ].join('\n');
}
