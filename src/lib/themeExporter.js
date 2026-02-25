/**
 * Export design system as Power BI Theme JSON
 */
export function exportPBITheme(designSystem) {
  const { name = 'Custom Theme', colors = [], fonts = {}, background } = designSystem;

  const dataColors = colors.slice(0, 10).map(c => c.hex);
  while (dataColors.length < 6) dataColors.push('#cccccc');

  const theme = {
    name,
    dataColors,
    background: background || (colors[0] ? colors[0].hex : '#ffffff'),
    foreground: getForeground(colors),
    tableAccent: dataColors[0],
    visualStyles: {
      "*": {
        "*": {
          background: [{ color: { solid: { color: background || '#ffffff' } } }],
          ...(fonts.body ? {
            labels: [{
              fontFamily: fonts.body,
              fontSize: 10
            }]
          } : {})
        }
      },
      page: {
        "*": {
          background: [{
            color: { solid: { color: background || '#ffffff' } },
            transparency: 0
          }]
        }
      }
    },
    textClasses: {
      label: { fontFace: fonts.body || "'Segoe UI'", fontSize: 10 },
      header: { fontFace: fonts.heading || "'Segoe UI Semibold'", fontSize: 14 },
      title: { fontFace: fonts.heading || "'Segoe UI Semibold'", fontSize: 18 },
      largeTitle: { fontFace: fonts.heading || "'Segoe UI Light'", fontSize: 24 },
      callout: { fontFace: fonts.body || "'Segoe UI'", fontSize: 16 }
    }
  };

  return JSON.stringify(theme, null, 2);
}

/**
 * Export as Format Specification (human-readable markdown)
 */
export function exportFormatSpec(designSystem) {
  const { name = 'Custom Theme', colors = [], fonts = {}, background, formatRules = [] } = designSystem;

  let spec = `# ${name} — Format Specification\n\n`;
  spec += `## Color Palette\n\n`;
  colors.forEach((c, i) => {
    spec += `- **Color ${i + 1}:** ${c.hex} (RGB: ${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})\n`;
  });

  spec += `\n## Typography\n\n`;
  spec += `- **Heading Font:** ${fonts.heading || 'Segoe UI Semibold'}\n`;
  spec += `- **Body Font:** ${fonts.body || 'Segoe UI'}\n`;
  spec += `- **Title Size:** ${fonts.titleSize || 18}pt\n`;
  spec += `- **Body Size:** ${fonts.bodySize || 10}pt\n`;

  if (background) spec += `\n## Background\n\n- **Page Background:** ${background}\n`;

  if (formatRules.length) {
    spec += `\n## Format Rules\n\n`;
    formatRules.forEach(r => { spec += `- ${r}\n`; });
  }

  return spec;
}

/**
 * Export as PBIP Visual Config snippet
 */
export function exportPBIPConfig(designSystem) {
  const { colors = [], fonts = {} } = designSystem;

  return JSON.stringify({
    "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/1.0.0/schema.json",
    config: {
      singleVisual: {
        objects: {
          labels: [{
            properties: {
              fontFamily: { expr: { Literal: { Value: `'${fonts.body || 'Segoe UI'}'` } } },
              fontSize: { expr: { Literal: { Value: `${fonts.bodySize || 10}D` } } },
              color: { solid: { color: colors[0]?.hex || '#333333' } }
            }
          }],
          title: [{
            properties: {
              fontFamily: { expr: { Literal: { Value: `'${fonts.heading || 'Segoe UI Semibold'}'` } } },
              fontSize: { expr: { Literal: { Value: `${fonts.titleSize || 14}D` } } },
              fontColor: { solid: { color: colors[0]?.hex || '#333333' } }
            }
          }]
        }
      }
    }
  }, null, 2);
}

function getForeground(colors) {
  if (!colors.length) return '#333333';
  const avg = colors.reduce((s, c) => s + c.hsl.l, 0) / colors.length;
  return avg > 50 ? '#333333' : '#ffffff';
}
