import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function isLight(hex) {
  if (!hex || hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function lighten(hex, amount) {
  if (!hex || hex.length < 7) return '#f0f0f0';
  let r = parseInt(hex.slice(1, 3), 16) + amount;
  let g = parseInt(hex.slice(3, 5), 16) + amount;
  let b = parseInt(hex.slice(5, 7), 16) + amount;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function PBIVisualRenderer({ spec, designSystem, width, height }) {
  if (!spec) return <EmptyState />;

  const bg = designSystem?.background || '#ffffff';
  const fg = isLight(bg) ? '#222' : '#eee';
  const fgMuted = isLight(bg) ? '#888' : '#aaa';
  const cardBg = isLight(bg) ? lighten(bg, -8) : lighten(bg, 20);
  const fonts = designSystem?.fonts || {};
  const headingFont = fonts.heading || 'Segoe UI Semibold';
  const bodyFont = fonts.body || 'Segoe UI';

  const ctx = { bg, fg, fgMuted, cardBg, headingFont, bodyFont, spec };

  const type = spec.visualType || 'bar';

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden rounded-xl"
      style={{ background: bg, color: fg, fontFamily: bodyFont }}
    >
      {/* Title row */}
      <div className="flex-shrink-0 px-3 pt-2.5 pb-1.5">
        <p style={{ fontFamily: headingFont, fontSize: 11, fontWeight: 600, color: fg, margin: 0, lineHeight: 1.2 }}>
          {spec.title || 'Visual'}
        </p>
        {spec.subtitle && (
          <p style={{ fontSize: 9, color: fgMuted, margin: '1px 0 0' }}>{spec.subtitle}</p>
        )}
      </div>

      {/* Chart body */}
      <div className="flex-1 min-h-0 px-3 pb-2.5">
        {type === 'bar'     && <HorizontalBarChart ctx={ctx} />}
        {type === 'column'  && <BarChart ctx={ctx} />}
        {type === 'line'    && <LineChart ctx={ctx} />}
        {type === 'area'    && <AreaChart ctx={ctx} />}
        {type === 'combo'   && <ComboChart ctx={ctx} />}
        {type === 'kpi'     && <KPIVisual ctx={ctx} />}
        {type === 'card'    && <CardVisual ctx={ctx} />}
        {type === 'donut'   && <DonutChart ctx={ctx} />}
        {type === 'pie'     && <PieChart ctx={ctx} />}
        {type === 'table'   && <TableVisual ctx={ctx} />}
        {type === 'scatter' && <ScatterChart ctx={ctx} />}
        {type === 'gauge'   && <GaugeVisual ctx={ctx} />}
        {type === 'treemap' && <TreemapVisual ctx={ctx} />}
        {type === 'funnel'  && <FunnelVisual ctx={ctx} />}
        {type === 'header'  && <HeaderVisual ctx={ctx} />}
        {type === 'filter'  && <FilterVisual ctx={ctx} />}
        {type === 'button'  && <ButtonVisual ctx={ctx} />}
        {type === 'textbox' && <TextboxVisual ctx={ctx} />}
        {type === 'image'   && <ImageVisual ctx={ctx} />}
        {!['bar','column','line','area','combo','kpi','card','donut','pie','table','scatter','gauge','treemap','funnel','header','filter','button','textbox','image'].includes(type) && <BarChart ctx={ctx} />}
      </div>
    </div>
  );
}

// ─── BAR CHART ───────────────────────────────────────────────────────────────
function BarChart({ ctx }) {
  const { spec, fg, fgMuted, cardBg } = ctx;
  const series = spec.series || [];
  const categories = spec.categories || [];
  if (!series.length || !categories.length) return <EmptyState />;

  // Multi-series: group bars by category
  const maxVal = Math.max(...series.flatMap(s => s.values || []), 1);
  const cols = categories.length;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-end gap-0.5">
        {categories.map((cat, ci) => (
          <div key={ci} className="flex-1 h-full flex items-end gap-px justify-center">
            {series.map((s, si) => {
              const val = (s.values || [])[ci] ?? 0;
              const pct = Math.max(2, (val / maxVal) * 100);
              return (
                <div
                  key={si}
                  title={`${s.name}: ${val}${spec.measureUnit || ''}`}
                  style={{
                    flex: 1,
                    height: `${pct}%`,
                    background: s.color || '#0078D4',
                    borderRadius: '2px 2px 0 0',
                    opacity: 0.85,
                    minHeight: 2,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      {/* X axis labels */}
      <div className="flex gap-0.5 mt-1 flex-shrink-0">
        {categories.map((cat, ci) => (
          <div key={ci} className="flex-1 text-center truncate" style={{ fontSize: 7, color: fgMuted }}>
            {cat}
          </div>
        ))}
      </div>
      {/* Legend */}
      {series.length > 1 && <Legend series={series} fgMuted={fgMuted} />}
    </div>
  );
}

// ─── HORIZONTAL BAR CHART ────────────────────────────────────────────────────
function HorizontalBarChart({ ctx }) {
  const { spec, fg, fgMuted } = ctx;
  const series = spec.series || [];
  const categories = spec.categories || [];
  if (!series.length || !categories.length) return <EmptyState />;

  const color = series[0]?.color || '#0078D4';
  const vals = series[0]?.values || [];
  const maxVal = Math.max(...vals, 1);

  return (
    <div className="w-full h-full flex flex-col gap-0.5 justify-center px-2">
      {categories.map((cat, i) => {
        const pct = (vals[i] || 0) / maxVal * 100;
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-right flex-shrink-0" style={{ fontSize: 7, color: fgMuted, width: 50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
            <div className="flex-1 h-4 rounded-sm overflow-hidden" style={{ background: fgMuted + '1a' }}>
              <div className="h-full rounded-sm" style={{ width: `${pct}%`, background: color, opacity: 0.85 }} />
            </div>
            <span style={{ fontSize: 7, color: fg, width: 24, textAlign: 'right' }}>{vals[i]}</span>
          </div>
        );
      })}
      {series.length > 1 && <Legend series={series} fgMuted={fgMuted} />}
    </div>
  );
}

// ─── LINE CHART ──────────────────────────────────────────────────────────────
function LineChart({ ctx }) {
  const { spec, fgMuted } = ctx;
  return <SVGLineArea spec={spec} fgMuted={fgMuted} filled={false} />;
}

function AreaChart({ ctx }) {
  const { spec, fgMuted } = ctx;
  return <SVGLineArea spec={spec} fgMuted={fgMuted} filled={true} />;
}

function SVGLineArea({ spec, fgMuted, filled }) {
  const series = spec.series || [];
  const categories = spec.categories || [];
  if (!series.length) return <EmptyState />;

  const W = 300, H = 120;
  const PAD = { l: 24, r: 8, t: 8, b: 20 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const allVals = series.flatMap(s => s.values || []);
  const minVal = Math.min(...allVals, 0);
  const maxVal = Math.max(...allVals, 1);
  const range = maxVal - minVal || 1;

  const cols = categories.length || series[0]?.values?.length || 1;

  function pointsFor(vals) {
    return vals.map((v, i) => {
      const x = PAD.l + (i / Math.max(cols - 1, 1)) * innerW;
      const y = PAD.t + innerH - ((v - minVal) / range) * innerH;
      return [x, y];
    });
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Y grid lines */}
          {[0, 0.5, 1].map(pct => (
            <line key={pct} x1={PAD.l} y1={PAD.t + innerH * (1 - pct)} x2={PAD.l + innerW} y2={PAD.t + innerH * (1 - pct)}
              stroke={fgMuted + '33'} strokeWidth={0.5} />
          ))}

          {series.map((s, si) => {
            const pts = pointsFor(s.values || []);
            const polyPts = pts.map(p => p.join(',')).join(' ');
            const color = s.color || '#0078D4';
            if (filled) {
              const areaBottom = `${PAD.l + innerW},${PAD.t + innerH} ${PAD.l},${PAD.t + innerH}`;
              return (
                <g key={si}>
                  <polygon points={`${polyPts} ${areaBottom}`} fill={color} fillOpacity={0.2} />
                  <polyline points={polyPts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
                </g>
              );
            }
            return (
              <polyline key={si} points={polyPts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
            );
          })}

          {/* X axis labels */}
          {categories.filter((_, i) => i === 0 || i === Math.floor(cols / 2) || i === cols - 1).map((cat, _, arr) => {
            const origIdx = categories.indexOf(cat);
            const x = PAD.l + (origIdx / Math.max(cols - 1, 1)) * innerW;
            return (
              <text key={origIdx} x={x} y={H - 4} textAnchor="middle" fontSize={7} fill={fgMuted}>{cat}</text>
            );
          })}
        </svg>
      </div>
      {series.length > 1 && <Legend series={series} fgMuted={fgMuted} />}
    </div>
  );
}

// ─── KPI ─────────────────────────────────────────────────────────────────────
function KPIVisual({ ctx }) {
  const { spec, fg, fgMuted, headingFont } = ctx;
  const trend = spec.kpiTrend || 'up';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? '#107C10' : trend === 'down' ? '#D83B01' : fgMuted;

  // Mini sparkline from series values
  const series = spec.series?.[0];
  const vals = series?.values || [];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
      <p style={{ fontSize: 36, fontFamily: headingFont, fontWeight: 700, color: fg, lineHeight: 1, margin: 0 }}>
        {spec.kpiValue || '—'}
      </p>
      {spec.kpiChange && (
        <div className="flex items-center gap-1">
          <TrendIcon size={13} style={{ color: trendColor }} />
          <span style={{ fontSize: 10, color: trendColor, fontWeight: 600 }}>{spec.kpiChange}</span>
        </div>
      )}
      {/* Sparkline */}
      {vals.length >= 2 && (
        <div className="w-full mt-1" style={{ height: 28 }}>
          <SparkLine vals={vals} color={series.color || trendColor} />
        </div>
      )}
    </div>
  );
}

function SparkLine({ vals, color }) {
  const W = 200, H = 28;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

// ─── DONUT ───────────────────────────────────────────────────────────────────
function DonutChart({ ctx }) {
  const { spec, fg, fgMuted, cardBg } = ctx;
  const series = spec.series || [];
  if (!series.length) return <EmptyState />;

  // Use first value per series as segment size
  const segments = series.map(s => ({
    name: s.name,
    color: s.color || '#0078D4',
    value: (s.values || [])[0] ?? 1,
  }));
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;

  const R = 40, r = 24, cx = 50, cy = 50;
  let offset = 0;
  const arcs = segments.map(seg => {
    const pct = seg.value / total;
    const arc = {
      ...seg,
      pct,
      offset,
    };
    offset += pct;
    return arc;
  });

  function polarToXY(pct, radius) {
    const angle = pct * 2 * Math.PI - Math.PI / 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  }

  function describeArc(startPct, endPct) {
    const [x1, y1] = polarToXY(startPct, R);
    const [x2, y2] = polarToXY(endPct, R);
    const [ix1, iy1] = polarToXY(startPct, r);
    const [ix2, iy2] = polarToXY(endPct, r);
    const large = endPct - startPct > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${r} ${r} 0 ${large} 0 ${ix1} ${iy1} Z`;
  }

  const topSeg = arcs.reduce((a, b) => a.pct > b.pct ? a : b);

  return (
    <div className="w-full h-full flex gap-2 items-center">
      <div className="flex-shrink-0" style={{ width: 100, height: 100 }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {arcs.map((seg, i) => (
            <path key={i} d={describeArc(seg.offset, seg.offset + seg.pct)} fill={seg.color} opacity={0.85} />
          ))}
          <text x={cx} y={cy + 3} textAnchor="middle" fontSize={10} fontWeight={700} fill={fg}>
            {Math.round(topSeg.pct * 100)}%
          </text>
        </svg>
      </div>
      {/* Legend */}
      <div className="flex-1 space-y-1 overflow-hidden">
        {segments.slice(0, 5).map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5 overflow-hidden">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-xs truncate flex-1" style={{ color: fgMuted, fontSize: 8 }}>{seg.name}</span>
            <span className="text-xs flex-shrink-0 font-medium" style={{ fontSize: 8, color: fg }}>
              {Math.round(seg.pct * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TABLE ───────────────────────────────────────────────────────────────────
function TableVisual({ ctx }) {
  const { spec, fg, fgMuted, cardBg, bg, headingFont } = ctx;
  const headers = spec.tableHeaders || [];
  const rows = spec.tableRows || [];
  if (!headers.length && !rows.length) return <EmptyState />;

  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full border-collapse" style={{ fontSize: 9 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-2 py-1" style={{
                borderBottom: `1px solid ${fgMuted}33`,
                color: fgMuted,
                fontFamily: headingFont,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 1 ? cardBg : 'transparent' }}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-2 py-1" style={{
                  borderBottom: `1px solid ${fgMuted}1a`,
                  color: fg,
                  whiteSpace: 'nowrap',
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── SCATTER ─────────────────────────────────────────────────────────────────
function ScatterChart({ ctx }) {
  const { spec, fgMuted } = ctx;
  const series = spec.series || [];
  const xVals = series[0]?.values || [];
  const yVals = series[1]?.values || xVals;
  if (!xVals.length) return <EmptyState />;

  const W = 300, H = 120;
  const PAD = 20;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const allX = xVals;
  const allY = yVals;
  const minX = Math.min(...allX), maxX = Math.max(...allX);
  const minY = Math.min(...allY), maxY = Math.max(...allY);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const color = series[0]?.color || '#0078D4';

  return (
    <div className="w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {[0, 0.5, 1].map(pct => (
          <line key={pct} x1={PAD} y1={PAD + innerH * pct} x2={PAD + innerW} y2={PAD + innerH * pct}
            stroke={fgMuted + '33'} strokeWidth={0.5} />
        ))}
        {/* Points */}
        {xVals.map((x, i) => {
          const cx = PAD + ((x - minX) / rangeX) * innerW;
          const cy = PAD + innerH - ((yVals[i] - minY) / rangeY) * innerH;
          return <circle key={i} cx={cx} cy={cy} r={3} fill={color} fillOpacity={0.7} />;
        })}
      </svg>
    </div>
  );
}

// ─── COMBO CHART ────────────────────────────────────────────────────────────
function ComboChart({ ctx }) {
  const { spec, fgMuted } = ctx;
  const series = spec.series || [];
  const categories = spec.categories || [];
  if (!series.length || !categories.length) return <EmptyState />;

  const maxVal = Math.max(...series.flatMap(s => s.values || []), 1);
  const W = 300, H = 120;
  const PAD = { l: 8, r: 8, t: 8, b: 20 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {series.map((s, si) => {
            const color = s.color || '#0078D4';
            if (s.chartType === 'line') {
              const pts = (s.values || []).map((v, i) => {
                const x = PAD.l + (i / Math.max(categories.length - 1, 1)) * innerW;
                const y = PAD.t + innerH - (v / maxVal) * innerH;
                return `${x},${y}`;
              }).join(' ');
              return <polyline key={si} points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />;
            }
            // bar
            const barW = innerW / categories.length * 0.6;
            return (s.values || []).map((v, i) => {
              const x = PAD.l + (i / categories.length) * innerW + (innerW / categories.length - barW) / 2;
              const h = (v / maxVal) * innerH;
              return <rect key={`${si}-${i}`} x={x} y={PAD.t + innerH - h} width={barW} height={h} rx={2} fill={color} opacity={0.8} />;
            });
          })}
          {categories.filter((_, i) => i === 0 || i === categories.length - 1).map((cat, _, arr) => {
            const origIdx = categories.indexOf(cat);
            const x = PAD.l + (origIdx / Math.max(categories.length - 1, 1)) * innerW;
            return <text key={origIdx} x={x} y={H - 4} textAnchor="middle" fontSize={7} fill={fgMuted}>{cat}</text>;
          })}
        </svg>
      </div>
      {series.length > 1 && <Legend series={series} fgMuted={fgMuted} />}
    </div>
  );
}

// ─── CARD ───────────────────────────────────────────────────────────────────
function CardVisual({ ctx }) {
  const { spec, fg, headingFont } = ctx;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <p style={{ fontSize: 32, fontFamily: headingFont, fontWeight: 700, color: fg, lineHeight: 1, margin: 0 }}>
        {spec.kpiValue || '—'}
      </p>
    </div>
  );
}

// ─── PIE CHART ──────────────────────────────────────────────────────────────
function PieChart({ ctx }) {
  const { spec, fg, fgMuted } = ctx;
  const series = spec.series || [];
  if (!series.length) return <EmptyState />;

  const segments = series.map(s => ({ name: s.name, color: s.color || '#0078D4', value: (s.values || [])[0] ?? 1 }));
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const R = 42, cx = 50, cy = 50;
  let offset = 0;
  const arcs = segments.map(seg => { const arc = { ...seg, pct: seg.value / total, offset }; offset += arc.pct; return arc; });

  function polarToXY(pct, radius) {
    const angle = pct * 2 * Math.PI - Math.PI / 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  }
  function describeArc(startPct, endPct) {
    if (endPct - startPct >= 0.999) {
      return `M ${cx - R} ${cy} A ${R} ${R} 0 1 1 ${cx + R} ${cy} A ${R} ${R} 0 1 1 ${cx - R} ${cy} Z`;
    }
    const [x1, y1] = polarToXY(startPct, R);
    const [x2, y2] = polarToXY(endPct, R);
    const large = endPct - startPct > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="w-full h-full flex gap-2 items-center">
      <div className="flex-shrink-0" style={{ width: 100, height: 100 }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {arcs.map((seg, i) => <path key={i} d={describeArc(seg.offset, seg.offset + seg.pct)} fill={seg.color} opacity={0.85} />)}
        </svg>
      </div>
      <div className="flex-1 space-y-1 overflow-hidden">
        {segments.slice(0, 5).map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5 overflow-hidden">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-xs truncate flex-1" style={{ color: fgMuted, fontSize: 8 }}>{seg.name}</span>
            <span className="text-xs flex-shrink-0 font-medium" style={{ fontSize: 8, color: fg }}>{Math.round(seg.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GAUGE ──────────────────────────────────────────────────────────────────
function GaugeVisual({ ctx }) {
  const { spec, fg, fgMuted, headingFont } = ctx;
  const val = spec.gaugeValue ?? 50;
  const min = spec.gaugeMin ?? 0;
  const max = spec.gaugeMax ?? 100;
  const pct = Math.max(0, Math.min(1, (val - min) / (max - min)));
  const color = spec.series?.[0]?.color || '#0078D4';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg viewBox="0 0 100 60" className="w-3/4" style={{ maxHeight: '60%' }}>
        <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke={fgMuted + '33'} strokeWidth={8} strokeLinecap="round" />
        <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={`${pct * 126} 126`} />
      </svg>
      <p style={{ fontSize: 22, fontFamily: headingFont, fontWeight: 700, color: fg, lineHeight: 1, marginTop: -4 }}>
        {val}
      </p>
      {spec.gaugeTarget && (
        <p style={{ fontSize: 8, color: fgMuted, marginTop: 2 }}>Target: {spec.gaugeTarget}</p>
      )}
    </div>
  );
}

// ─── TREEMAP ────────────────────────────────────────────────────────────────
function TreemapVisual({ ctx }) {
  const { spec, fg } = ctx;
  const series = spec.series || [];
  if (!series.length) return <EmptyState />;
  const total = series.reduce((a, s) => a + ((s.values || [])[0] || 1), 0);

  // Simple horizontal strip treemap
  let x = 0;
  const W = 100;
  return (
    <div className="w-full h-full p-0.5">
      <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
        {series.map((s, i) => {
          const pct = ((s.values || [])[0] || 1) / total;
          const w = pct * W;
          const rect = <g key={i}>
            <rect x={x} y={0} width={w} height={60} fill={s.color || '#0078D4'} opacity={0.8} rx={1} />
            {w > 15 && <text x={x + w / 2} y={32} textAnchor="middle" fontSize={6} fill="#fff" fontWeight={600}>{s.name}</text>}
          </g>;
          x += w;
          return rect;
        })}
      </svg>
    </div>
  );
}

// ─── FUNNEL ─────────────────────────────────────────────────────────────────
function FunnelVisual({ ctx }) {
  const { spec, fg, fgMuted } = ctx;
  const categories = spec.categories || [];
  const vals = spec.series?.[0]?.values || [];
  if (!categories.length) return <EmptyState />;
  const color = spec.series?.[0]?.color || '#0078D4';
  const maxVal = Math.max(...vals, 1);

  return (
    <div className="w-full h-full flex flex-col gap-0.5 justify-center px-2">
      {categories.map((cat, i) => {
        const pct = (vals[i] || 0) / maxVal;
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-right flex-shrink-0" style={{ fontSize: 7, color: fgMuted, width: 50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
            <div className="flex-1 h-4 rounded-sm overflow-hidden" style={{ background: fgMuted + '1a' }}>
              <div className="h-full rounded-sm" style={{ width: `${pct * 100}%`, background: color, opacity: 1 - i * 0.12 }} />
            </div>
            <span style={{ fontSize: 7, color: fg, width: 24, textAlign: 'right' }}>{vals[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── HEADER ─────────────────────────────────────────────────────────────────
function HeaderVisual({ ctx }) {
  const { spec, fg, fgMuted, headingFont, bg } = ctx;
  return (
    <div className="w-full h-full flex items-center px-4" style={{ background: bg }}>
      <div>
        <p style={{ fontFamily: headingFont, fontSize: 18, fontWeight: 700, color: fg, margin: 0, lineHeight: 1.2 }}>
          {spec.title || 'Dashboard Title'}
        </p>
        {spec.subtitle && (
          <p style={{ fontSize: 10, color: fgMuted, margin: '4px 0 0' }}>{spec.subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ─── FILTER ─────────────────────────────────────────────────────────────────
function FilterVisual({ ctx }) {
  const { spec, fg, fgMuted, cardBg } = ctx;
  const options = spec.filterOptions || ['All', 'Option 1', 'Option 2'];
  return (
    <div className="w-full h-full flex items-center gap-2 px-3">
      <span style={{ fontSize: 9, color: fgMuted, flexShrink: 0 }}>{spec.title || 'Filter'}:</span>
      <div className="flex-1 flex items-center px-2 py-1 rounded" style={{ border: `1px solid ${fgMuted}44`, background: cardBg }}>
        <span style={{ fontSize: 9, color: fg }}>{options[0]}</span>
        <svg viewBox="0 0 10 6" width={8} height={5} className="ml-auto" style={{ opacity: 0.5 }}>
          <path d="M0 0 L5 6 L10 0" fill="none" stroke={fgMuted} strokeWidth={1.5} />
        </svg>
      </div>
    </div>
  );
}

// ─── BUTTON ─────────────────────────────────────────────────────────────────
function ButtonVisual({ ctx }) {
  const { spec } = ctx;
  const color = spec.series?.[0]?.color || '#0078D4';
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="px-5 py-2 rounded-md text-white text-xs font-semibold" style={{ background: color }}>
        {spec.buttonText || spec.title || 'Button'}
      </div>
    </div>
  );
}

// ─── TEXTBOX ────────────────────────────────────────────────────────────────
function TextboxVisual({ ctx }) {
  const { spec, fg, fgMuted, bodyFont } = ctx;
  return (
    <div className="w-full h-full flex items-start p-3">
      <p style={{ fontSize: 10, color: fg, fontFamily: bodyFont, lineHeight: 1.5, margin: 0 }}>
        {spec.textContent || 'Text content goes here...'}
      </p>
    </div>
  );
}

// ─── IMAGE ──────────────────────────────────────────────────────────────────
function ImageVisual({ ctx }) {
  const { fgMuted } = ctx;
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: fgMuted + '1a' }}>
      <div className="text-center">
        <svg viewBox="0 0 24 24" width={32} height={32} className="mx-auto" style={{ opacity: 0.3 }}>
          <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke={fgMuted} strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill={fgMuted} />
          <path d="M2 16 L8 10 L14 16 L18 12 L22 16" fill="none" stroke={fgMuted} strokeWidth="1.5" />
        </svg>
        <p style={{ fontSize: 8, color: fgMuted, marginTop: 4 }}>Image placeholder</p>
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Legend({ series, fgMuted }) {
  return (
    <div className="flex gap-2 flex-wrap flex-shrink-0 mt-1">
      {series.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm" style={{ background: s.color || '#0078D4' }} />
          <span style={{ fontSize: 7, color: fgMuted }}>{s.name}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-xs text-gray-400">No data</span>
    </div>
  );
}
