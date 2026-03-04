import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { VISUAL_TEMPLATES } from '../lib/placeholderData';
import PBIVisualRenderer from './PBIVisualRenderer';

export default function StylePickerModal({ visual, designSystem, onApplyTemplate, onClose }) {
  const [selectedId, setSelectedId] = useState(null);
  const visualType = visual?.spec?.visualType;
  const templates = VISUAL_TEMPLATES[visualType] || [];

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!templates.length) return null;

  const handleApply = () => {
    if (selectedId) {
      onApplyTemplate(visual.id, visualType, selectedId);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-surface-light rounded-2xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col overflow-hidden border border-surface-lighter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-lighter">
          <div>
            <h2 className="text-base font-semibold text-text">Visual Styles</h2>
            <p className="text-xs text-text-muted mt-0.5">Pick a layout for your {visualType} visual</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Template grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            {templates.map(template => {
              const isSelected = selectedId === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedId(isSelected ? null : template.id)}
                  className={`relative rounded-xl border-2 p-1 transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                      : 'border-surface-lighter hover:border-text-muted/30 hover:shadow-sm'
                  }`}
                >
                  {/* Preview card */}
                  <div className="w-full aspect-[16/10] rounded-lg overflow-hidden bg-white dark:bg-surface">
                    <TemplatePreview
                      type={visualType}
                      template={template}
                      designSystem={designSystem}
                    />
                  </div>

                  {/* Label */}
                  <div className="px-2 py-2">
                    <p className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-text'}`}>
                      {template.label}
                    </p>
                    <p className="text-[10px] text-text-muted">{template.desc}</p>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-surface-lighter flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-text-muted hover:text-text transition-colors rounded-lg hover:bg-surface"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedId}
            className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply Style
          </button>
        </div>
      </div>
    </div>
  );
}

// Renders a mini chart preview using actual SVG shapes with the design system colors
function TemplatePreview({ type, template, designSystem }) {
  const colors = designSystem?.colors?.length
    ? designSystem.colors.map(c => c.hex)
    : ['#0078D4', '#E3008C', '#00B294', '#FFB900', '#D83B01'];
  const c1 = colors[0] || '#0078D4';
  const c2 = colors[1] || '#E3008C';
  const c3 = colors[2] || '#00B294';
  const bg = designSystem?.background || '#ffffff';
  const fg = isLightColor(bg) ? '#374151' : '#e5e7eb';
  const muted = isLightColor(bg) ? '#9ca3af' : '#6b7280';
  const heading = designSystem?.fonts?.heading || 'Segoe UI';

  const w = 230, h = 140;

  switch (type) {
    case 'column': {
      if (template.stacked) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Revenue by Region</text>
          {[0,1,2,3,4].map(i => {
            const bx = 20 + i * 40;
            const h1 = 30 + Math.random() * 40;
            const h2 = 20 + Math.random() * 25;
            return <g key={i}>
              <rect x={bx} y={h - 20 - h1 - h2} width="24" height={h2} fill={c2} rx="1" />
              <rect x={bx} y={h - 20 - h1} width="24" height={h1} fill={c1} rx="1" />
            </g>;
          })}
          <line x1="16" y1={h - 20} x2={w - 10} y2={h - 20} stroke={muted} strokeWidth="0.5" />
          {[0,1,2,3,4].map(i => <text key={i} x={32 + i * 40} y={h - 10} textAnchor="middle" fontSize="7" fill={muted}>{['Q1','Q2','Q3','Q4','Q5'][i]}</text>)}
        </svg>
      );
      if (template.seriesCount >= 3) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Revenue by Region</text>
          {[0,1,2,3].map(i => {
            const gx = 18 + i * 52;
            const vals = [40 + Math.random() * 50, 30 + Math.random() * 40, 25 + Math.random() * 35];
            return <g key={i}>
              <rect x={gx} y={h - 20 - vals[0]} width="12" height={vals[0]} fill={c1} rx="1" />
              <rect x={gx + 14} y={h - 20 - vals[1]} width="12" height={vals[1]} fill={c2} rx="1" />
              <rect x={gx + 28} y={h - 20 - vals[2]} width="12" height={vals[2]} fill={c3} rx="1" />
            </g>;
          })}
          <line x1="16" y1={h - 20} x2={w - 10} y2={h - 20} stroke={muted} strokeWidth="0.5" />
        </svg>
      );
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Revenue by Region</text>
          {[0,1,2,3,4].map(i => {
            const bh = 30 + Math.random() * 60;
            return <rect key={i} x={20 + i * 40} y={h - 20 - bh} width="24" height={bh} fill={c1} rx="2" />;
          })}
          <line x1="16" y1={h - 20} x2={w - 10} y2={h - 20} stroke={muted} strokeWidth="0.5" />
          {[0,1,2,3,4].map(i => <text key={i} x={32 + i * 40} y={h - 10} textAnchor="middle" fontSize="7" fill={muted}>{['North','South','East','West','Central'][i]}</text>)}
        </svg>
      );
    }
    case 'bar': {
      const rows = ['Sales', 'Marketing', 'Eng', 'Finance'];
      if (template.stacked) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Sales by Category</text>
          {rows.map((r, i) => {
            const w1 = 60 + Math.random() * 80;
            const w2 = 30 + Math.random() * 50;
            const by = 30 + i * 25;
            return <g key={i}>
              <text x="12" y={by + 10} fontSize="7" fill={muted}>{r}</text>
              <rect x="64" y={by} width={w1} height="14" fill={c1} rx="1" />
              <rect x={64 + w1} y={by} width={w2} height="14" fill={c2} rx="1" />
            </g>;
          })}
        </svg>
      );
      if (template.seriesCount >= 3) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Sales by Category</text>
          {rows.map((r, i) => {
            const gy = 28 + i * 28;
            return <g key={i}>
              <text x="12" y={gy + 7} fontSize="7" fill={muted}>{r}</text>
              <rect x="64" y={gy} width={50 + Math.random() * 60} height="7" fill={c1} rx="1" />
              <rect x="64" y={gy + 9} width={40 + Math.random() * 50} height="7" fill={c2} rx="1" />
              <rect x="64" y={gy + 18} width={30 + Math.random() * 40} height="7" fill={c3} rx="1" />
            </g>;
          })}
        </svg>
      );
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Sales by Category</text>
          {rows.map((r, i) => {
            const bw = 60 + Math.random() * 100;
            const by = 32 + i * 24;
            return <g key={i}>
              <text x="12" y={by + 10} fontSize="7" fill={muted}>{r}</text>
              <rect x="64" y={by} width={bw} height="14" fill={c1} rx="2" />
            </g>;
          })}
        </svg>
      );
    }
    case 'line': {
      const pts = Array.from({ length: 7 }, (_, i) => [20 + i * 30, 30 + Math.random() * 70]);
      if (template.seriesCount >= 3) {
        const pts2 = Array.from({ length: 7 }, (_, i) => [20 + i * 30, 40 + Math.random() * 60]);
        const pts3 = Array.from({ length: 7 }, (_, i) => [20 + i * 30, 50 + Math.random() * 50]);
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
            <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Trend Over Time</text>
            <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={c1} strokeWidth="2" />
            <polyline points={pts2.map(p => p.join(',')).join(' ')} fill="none" stroke={c2} strokeWidth="2" />
            <polyline points={pts3.map(p => p.join(',')).join(' ')} fill="none" stroke={c3} strokeWidth="2" />
            <line x1="16" y1={h - 20} x2={w - 10} y2={h - 20} stroke={muted} strokeWidth="0.5" />
          </svg>
        );
      }
      if (template.markers) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Trend Over Time</text>
          <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={c1} strokeWidth="2" />
          {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="white" stroke={c1} strokeWidth="2" />)}
          <line x1="16" y1={h - 20} x2={w - 10} y2={h - 20} stroke={muted} strokeWidth="0.5" />
        </svg>
      );
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Trend Over Time</text>
          <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={c1} strokeWidth="2" />
          <line x1="16" y1={h - 20} x2={w - 10} y2={h - 20} stroke={muted} strokeWidth="0.5" />
        </svg>
      );
    }
    case 'area': {
      const pts = Array.from({ length: 7 }, (_, i) => [20 + i * 30, 30 + Math.random() * 60]);
      if (template.stacked) {
        const pts2 = pts.map(([x, y]) => [x, y + 15 + Math.random() * 20]);
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
            <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Cumulative Growth</text>
            <polygon points={[...pts2.map(p => p.join(',')), `${pts2[pts2.length-1][0]},${h-20}`, `${pts2[0][0]},${h-20}`].join(' ')} fill={c2} opacity="0.5" />
            <polygon points={[...pts.map(p => p.join(',')), `${pts[pts.length-1][0]},${h-20}`, `${pts[0][0]},${h-20}`].join(' ')} fill={c1} opacity="0.5" />
            <line x1="16" y1={h - 20} x2={w - 10} y2={h - 20} stroke={muted} strokeWidth="0.5" />
          </svg>
        );
      }
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Cumulative Growth</text>
          <polygon points={[...pts.map(p => p.join(',')), `${pts[pts.length-1][0]},${h-20}`, `${pts[0][0]},${h-20}`].join(' ')} fill={c1} opacity="0.3" />
          <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={c1} strokeWidth="2" />
          <line x1="16" y1={h - 20} x2={w - 10} y2={h - 20} stroke={muted} strokeWidth="0.5" />
        </svg>
      );
    }
    case 'pie':
    case 'donut': {
      const n = template.segments || 4;
      const cx = w / 2, cy = h / 2 + 5, r = 42;
      const inner = type === 'donut' ? (template.thin ? 32 : 24) : 0;
      const slices = Array.from({ length: n }, () => 10 + Math.random() * 40);
      const total = slices.reduce((a, b) => a + b, 0);
      let angle = -Math.PI / 2;
      const cols = [c1, c2, c3, '#FFB900', '#D83B01', '#5C2D91', '#00B294'];
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>
            {type === 'pie' ? 'Market Share' : 'Distribution'}
          </text>
          {slices.map((val, i) => {
            const start = angle;
            const sweep = (val / total) * Math.PI * 2;
            angle += sweep;
            const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
            const x2 = cx + r * Math.cos(start + sweep), y2 = cy + r * Math.sin(start + sweep);
            const large = sweep > Math.PI ? 1 : 0;
            if (inner > 0) {
              const x3 = cx + inner * Math.cos(start + sweep), y3 = cy + inner * Math.sin(start + sweep);
              const x4 = cx + inner * Math.cos(start), y4 = cy + inner * Math.sin(start);
              return <path key={i} d={`M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${x3},${y3} A${inner},${inner} 0 ${large},0 ${x4},${y4} Z`} fill={cols[i % cols.length]} />;
            }
            return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={cols[i % cols.length]} />;
          })}
        </svg>
      );
    }
    case 'kpi': {
      if (template.simple) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x={w/2} y="30" textAnchor="middle" fontSize="9" fill={muted} fontFamily={heading}>Total Revenue</text>
          <text x={w/2} y="70" textAnchor="middle" fontSize="28" fontWeight="bold" fill={c1} fontFamily={heading}>$4,280K</text>
          <text x={w/2} y="90" textAnchor="middle" fontSize="9" fill={muted}>vs prev period</text>
        </svg>
      );
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="16" y="24" fontSize="9" fill={muted} fontFamily={heading}>Total Revenue</text>
          <text x="16" y="52" fontSize="24" fontWeight="bold" fill={c1} fontFamily={heading}>$4,280K</text>
          <text x="16" y="68" fontSize="9" fill="#22c55e">+12.3%</text>
          <polyline points="16,100 46,90 76,94 106,82 136,86 166,76 196,72" fill="none" stroke={c1} strokeWidth="1.5" opacity="0.4" />
          <polygon points="16,100 46,90 76,94 106,82 136,86 166,76 196,72 196,110 16,110" fill={c1} opacity="0.08" />
        </svg>
      );
    }
    case 'table': return (
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
        <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Performance Summary</text>
        <rect x="10" y="26" width={w - 20} height="14" fill={c1} opacity="0.1" rx="2" />
        {['Name', 'Revenue', 'Growth', template.columns >= 6 ? 'Region' : 'Status'].map((h, i) => (
          <text key={i} x={20 + i * 52} y="36" fontSize="7" fontWeight="600" fill={fg}>{h}</text>
        ))}
        {[0,1,2,3].map(row => (
          <g key={row}>
            <line x1="10" y1={44 + row * 20} x2={w - 10} y2={44 + row * 20} stroke={muted} strokeWidth="0.3" />
            {[0,1,2,3].map(col => (
              <rect key={col} x={16 + col * 52} y={48 + row * 20} width={30 + Math.random() * 15} height="6" rx="2" fill={muted} opacity="0.2" />
            ))}
          </g>
        ))}
      </svg>
    );
    case 'gauge': return (
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
        <text x={w/2} y="18" textAnchor="middle" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Performance Score</text>
        <path d={`M ${w/2-50} ${h - 25} A 50 50 0 0 1 ${w/2+50} ${h - 25}`} fill="none" stroke={muted} strokeWidth="10" strokeLinecap="round" opacity="0.15" />
        <path d={`M ${w/2-50} ${h - 25} A 50 50 0 0 1 ${w/2+30} ${h - 65}`} fill="none" stroke={c1} strokeWidth="10" strokeLinecap="round" />
        <text x={w/2} y={h - 20} textAnchor="middle" fontSize="18" fontWeight="bold" fill={c1}>72%</text>
        {template.showTarget && <line x1={w/2+15} y1={h-70} x2={w/2+15} y2={h-55} stroke="#ef4444" strokeWidth="2" />}
      </svg>
    );
    case 'header': {
      if (template.hasLogo) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <rect x="12" y="30" width="40" height="40" rx="6" fill={muted} opacity="0.15" />
          <text x="16" y="55" fontSize="8" fill={muted}>Logo</text>
          <text x="62" y="48" fontSize="14" fontFamily={heading} fontWeight="700" fill={fg}>Dashboard Title</text>
          <text x="62" y="62" fontSize="9" fill={muted}>Company Name</text>
        </svg>
      );
      if (template.hasKpis) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="35" fontSize="14" fontFamily={heading} fontWeight="700" fill={fg}>Dashboard Title</text>
          <text x="12" y="50" fontSize="9" fill={muted}>Q4 2025</text>
          {['$4.2M', '+12.3%', '1,284'].map((v, i) => (
            <g key={i}>
              <rect x={12 + i * 72} y="65" width="62" height="24" rx="4" fill={c1} opacity="0.1" />
              <text x={43 + i * 72} y="81" textAnchor="middle" fontSize="9" fontWeight="600" fill={c1}>{v}</text>
            </g>
          ))}
        </svg>
      );
      if (template.hasSubtitle) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="50" fontSize="16" fontFamily={heading} fontWeight="700" fill={fg}>Dashboard Title</text>
          <text x="12" y="70" fontSize="10" fill={muted}>Report subtitle or description text</text>
        </svg>
      );
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="55" fontSize="18" fontFamily={heading} fontWeight="700" fill={fg}>Dashboard Title</text>
        </svg>
      );
    }
    case 'filter': {
      if (template.chipStyle) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="30" fontSize="9" fill={muted}>Filter</text>
          {['All', 'Active', 'Pending', 'Closed'].map((label, i) => (
            <g key={i}>
              <rect x={12 + i * 52} y="42" width="44" height="22" rx="11" fill={i === 0 ? c1 : 'transparent'} stroke={i === 0 ? c1 : muted} strokeWidth="1" />
              <text x={34 + i * 52} y="57" textAnchor="middle" fontSize="8" fill={i === 0 ? 'white' : muted}>{label}</text>
            </g>
          ))}
        </svg>
      );
      if (template.dateRange) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="30" fontSize="9" fill={muted}>Date Range</text>
          <rect x="12" y="40" width="90" height="26" rx="4" fill="none" stroke={muted} strokeWidth="1" />
          <text x="20" y="57" fontSize="9" fill={fg}>01/01/2025</text>
          <text x="110" y="57" fontSize="9" fill={muted}>to</text>
          <rect x="125" y="40" width="90" height="26" rx="4" fill="none" stroke={muted} strokeWidth="1" />
          <text x="133" y="57" fontSize="9" fill={fg}>03/04/2025</text>
        </svg>
      );
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="30" fontSize="9" fill={muted}>Filter</text>
          <rect x="12" y="40" width={w - 24} height="28" rx="4" fill="none" stroke={muted} strokeWidth="1" />
          <text x="20" y="58" fontSize="10" fill={fg}>Select option...</text>
          <text x={w - 28} y="58" fontSize="12" fill={muted}>v</text>
        </svg>
      );
    }
    case 'card': {
      if (template.showChange) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x={w/2} y="30" textAnchor="middle" fontSize="9" fill={muted}>Total Sales</text>
          <text x={w/2} y="65" textAnchor="middle" fontSize="26" fontWeight="bold" fill={c1}>$4,280K</text>
          <text x={w/2 - 10} y="85" textAnchor="middle" fontSize="10" fill="#22c55e">+12.3%</text>
          <polygon points={`${w/2 + 8},80 ${w/2 + 14},86 ${w/2 + 2},86`} fill="#22c55e" />
        </svg>
      );
      if (template.showIcon) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <circle cx="40" cy={h/2} r="20" fill={c1} opacity="0.12" />
          <text x="40" y={h/2 + 5} textAnchor="middle" fontSize="16" fill={c1}>$</text>
          <text x="80" y={h/2 - 8} fontSize="9" fill={muted}>Total Sales</text>
          <text x="80" y={h/2 + 12} fontSize="20" fontWeight="bold" fill={fg}>$4,280K</text>
        </svg>
      );
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x={w/2} y="35" textAnchor="middle" fontSize="9" fill={muted}>Total Sales</text>
          <text x={w/2} y="72" textAnchor="middle" fontSize="28" fontWeight="bold" fill={c1}>$4,280K</text>
        </svg>
      );
    }
    case 'button': {
      if (template.outline) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <rect x={(w-120)/2} y={(h-36)/2} width="120" height="36" rx="6" fill="none" stroke={c1} strokeWidth="2" />
          <text x={w/2} y={h/2 + 5} textAnchor="middle" fontSize="11" fontWeight="600" fill={c1}>View Details</text>
        </svg>
      );
      if (template.withIcon) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <rect x={(w-140)/2} y={(h-36)/2} width="140" height="36" rx="6" fill={c1} />
          <text x={w/2 + 8} y={h/2 + 5} textAnchor="middle" fontSize="11" fontWeight="600" fill="white">View Details →</text>
        </svg>
      );
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <rect x={(w-120)/2} y={(h-36)/2} width="120" height="36" rx="6" fill={c1} />
          <text x={w/2} y={h/2 + 5} textAnchor="middle" fontSize="11" fontWeight="600" fill="white">View Details</text>
        </svg>
      );
    }
    case 'textbox': {
      if (template.callout) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <rect x="12" y="20" width={w - 24} height={h - 40} rx="6" fill={c1} opacity="0.06" stroke={c1} strokeWidth="1" opacity="0.2" />
          <rect x="12" y="20" width="4" height={h - 40} rx="2" fill={c1} />
          <text x="26" y="42" fontSize="10" fontWeight="600" fill={fg}>Note</text>
          <text x="26" y="58" fontSize="8" fill={muted}>Important: Key findings from</text>
          <text x="26" y="70" fontSize="8" fill={muted}>the analysis are highlighted.</text>
        </svg>
      );
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="16" y="35" fontSize="10" fontWeight="600" fill={fg}>Text</text>
          <text x="16" y="55" fontSize="8" fill={muted}>Add your commentary or</text>
          <text x="16" y="68" fontSize="8" fill={muted}>annotations here. This text</text>
          <text x="16" y="81" fontSize="8" fill={muted}>box supports multiple lines.</text>
        </svg>
      );
    }
    case 'image': {
      if (template.logo) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <rect x={(w-80)/2} y={(h-60)/2} width="80" height="60" rx="8" fill={muted} opacity="0.1" stroke={muted} strokeWidth="1" strokeDasharray="4" />
          <text x={w/2} y={h/2 + 4} textAnchor="middle" fontSize="9" fill={muted}>Company Logo</text>
        </svg>
      );
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <rect x="20" y="15" width={w-40} height={h-30} rx="6" fill={muted} opacity="0.1" stroke={muted} strokeWidth="1" strokeDasharray="4" />
          <polygon points={`40,${h-35} 80,50 120,60 160,45 190,${h-35}`} fill={muted} opacity="0.15" />
          <circle cx="60" cy="40" r="12" fill={muted} opacity="0.2" />
          <text x={w/2} y={h/2 + 20} textAnchor="middle" fontSize="9" fill={muted}>Image placeholder</text>
        </svg>
      );
    }
    case 'combo': {
      if (template.areaCombo) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Revenue vs Target</text>
          <polygon points="20,100 50,75 80,82 110,60 140,68 170,50 200,45 200,120 20,120" fill={c1} opacity="0.2" />
          <polyline points="20,100 50,75 80,82 110,60 140,68 170,50 200,45" fill="none" stroke={c1} strokeWidth="1.5" />
          <polyline points="20,85 50,80 80,78 110,72 140,70 170,65 200,60" fill="none" stroke={c2} strokeWidth="2" strokeDasharray="4" />
          <line x1="16" y1={h - 20} x2={w - 10} y2={h - 20} stroke={muted} strokeWidth="0.5" />
        </svg>
      );
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Revenue vs Profit</text>
          {[0,1,2,3,4].map(i => <rect key={i} x={20 + i * 38} y={h - 20 - 30 - Math.random() * 50} width="22" height={30 + Math.random() * 50} fill={c1} opacity="0.7" rx="1" />)}
          <polyline points="31,50 69,38 107,55 145,30 183,42" fill="none" stroke={c2} strokeWidth="2" />
          <line x1="16" y1={h - 20} x2={w - 10} y2={h - 20} stroke={muted} strokeWidth="0.5" />
        </svg>
      );
    }
    case 'scatter': {
      if (template.bubble) return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Bubble Analysis</text>
          {[[40,50,18],[80,35,12],[120,70,22],[160,45,10],[60,85,14],[140,30,16],[180,65,8]].map(([x,y,r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={c1} opacity="0.3" stroke={c1} strokeWidth="1" />
          ))}
          <line x1="16" y1={h - 20} x2={w - 10} y2={h - 20} stroke={muted} strokeWidth="0.5" />
          <line x1="16" y1="24" x2="16" y2={h - 20} stroke={muted} strokeWidth="0.5" />
        </svg>
      );
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
          <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Correlation Analysis</text>
          {[[30,80],[55,60],[75,70],[95,40],[115,50],[135,30],[155,45],[175,25],[45,90],[130,55]].map(([x,y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill={c1} opacity="0.7" />
          ))}
          <line x1="16" y1={h - 20} x2={w - 10} y2={h - 20} stroke={muted} strokeWidth="0.5" />
          <line x1="16" y1="24" x2="16" y2={h - 20} stroke={muted} strokeWidth="0.5" />
        </svg>
      );
    }
    case 'funnel': return (
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
        <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Sales Pipeline</text>
        {template.horizontal ? (
          <g>
            {[0,1,2,3].map(i => {
              const bw = [180, 140, 100, 60][i];
              return <rect key={i} x={20} y={28 + i * 26} width={bw} height="20" rx="2" fill={[c1,c2,c3,'#FFB900'][i]} />;
            })}
          </g>
        ) : (
          <g>
            <polygon points={`${w/2-80},28 ${w/2+80},28 ${w/2+65},52 ${w/2-65},52`} fill={c1} />
            <polygon points={`${w/2-65},56 ${w/2+65},56 ${w/2+45},80 ${w/2-45},80`} fill={c2} />
            <polygon points={`${w/2-45},84 ${w/2+45},84 ${w/2+25},108 ${w/2-25},108`} fill={c3} />
            <polygon points={`${w/2-25},112 ${w/2+25},112 ${w/2+15},130 ${w/2-15},130`} fill="#FFB900" />
          </g>
        )}
      </svg>
    );
    case 'treemap': return (
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
        <text x="12" y="18" fontSize="9" fontFamily={heading} fontWeight="600" fill={fg}>Revenue Breakdown</text>
        {template.nested ? (
          <g>
            <rect x="12" y="28" width="100" height="50" rx="2" fill={c1} opacity="0.3" />
            <rect x="16" y="32" width="42" height="42" rx="1" fill={c1} />
            <rect x="62" y="32" width="46" height="20" rx="1" fill={c2} />
            <rect x="62" y="56" width="46" height="18" rx="1" fill={c3} />
            <rect x="118" y="28" width="100" height="50" rx="2" fill={'#FFB900'} opacity="0.3" />
            <rect x="122" y="32" width="92" height="22" rx="1" fill={'#FFB900'} />
            <rect x="122" y="58" width="44" height="16" rx="1" fill={'#D83B01'} />
            <rect x="170" y="58" width="44" height="16" rx="1" fill={c2} />
            <rect x="12" y="82" width="206" height="40" rx="2" fill={c1} opacity="0.15" />
            <rect x="16" y="86" width="96" height="32" rx="1" fill={c1} opacity="0.5" />
            <rect x="116" y="86" width="48" height="32" rx="1" fill={c2} opacity="0.5" />
            <rect x="168" y="86" width="46" height="32" rx="1" fill={c3} opacity="0.5" />
          </g>
        ) : (
          <g>
            <rect x="12" y="28" width="90" height="50" rx="2" fill={c1} />
            <rect x="106" y="28" width="82" height="28" rx="2" fill={c2} />
            <rect x="106" y="60" width="40" height="18" rx="2" fill={c3} />
            <rect x="150" y="60" width="38" height="18" rx="2" fill={'#FFB900'} />
            <rect x="12" y="82" width="50" height="38" rx="2" fill={'#D83B01'} />
            <rect x="66" y="82" width="62" height="38" rx="2" fill={c2} opacity="0.6" />
            <rect x="132" y="82" width="56" height="38" rx="2" fill={c3} opacity="0.6" />
          </g>
        )}
      </svg>
    );
    default: return (
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ background: bg }}>
        <text x={w/2} y={h/2} textAnchor="middle" fontSize="10" fill={muted}>Preview</text>
      </svg>
    );
  }
}

function isLightColor(hex) {
  if (!hex || hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
