import { useState, useRef, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Activity, Gauge, PieChart, Table, ScatterChart,
  LayoutDashboard, SlidersHorizontal, CreditCard, MousePointer2,
  BarChart, GitMerge, TreePine, Filter, Type, ImageIcon, Layers,
  Wand2, Plus, Grid3X3, Image, Eye, EyeOff, Monitor, MousePointerClick,
} from 'lucide-react';
import { VISUAL_TYPES, VISUAL_TEMPLATES } from '../lib/placeholderData';
import DittoMascot from './DittoMascot';
import VisualPropertiesPanel from './VisualPropertiesPanel';

const ICON_MAP = {
  header: LayoutDashboard,
  filter: Filter,
  kpi: CreditCard,
  button: MousePointer2,
  column: BarChart,
  bar: BarChart3,
  line: TrendingUp,
  area: Activity,
  combo: GitMerge,
  table: Table,
  card: CreditCard,
  pie: PieChart,
  donut: PieChart,
  gauge: Gauge,
  treemap: TreePine,
  funnel: SlidersHorizontal,
  scatter: ScatterChart,
  textbox: Type,
  image: ImageIcon,
};

const PAGE_SIZES = [
  { label: 'Default (1280×720)', w: 1280, h: 720 },
  { label: 'Full HD (1920×1080)', w: 1920, h: 1080 },
];

// Mini SVG thumbnails (kept for potential future use in drag previews)
function TemplateThumbnail({ type, template }) {
  const w = 80, h = 52;
  const c1 = '#0078D4', c2 = '#4DA3E0', c3 = '#A3D1F5';

  switch (type) {
    case 'column': {
      if (template.stacked) return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <rect x="10" y="8" width="12" height="36" rx="1" fill={c1} />
          <rect x="10" y="20" width="12" height="24" rx="1" fill={c2} />
          <rect x="26" y="14" width="12" height="30" rx="1" fill={c1} />
          <rect x="26" y="24" width="12" height="20" rx="1" fill={c2} />
          <rect x="42" y="4" width="12" height="40" rx="1" fill={c1} />
          <rect x="42" y="22" width="12" height="22" rx="1" fill={c2} />
          <rect x="58" y="18" width="12" height="26" rx="1" fill={c1} />
          <rect x="58" y="28" width="12" height="16" rx="1" fill={c2} />
          <line x1="6" y1="44" x2="74" y2="44" stroke="#ccc" strokeWidth="0.5" />
        </svg>
      );
      if (template.seriesCount >= 3) return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <rect x="6" y="12" width="6" height="32" rx="1" fill={c1} />
          <rect x="13" y="20" width="6" height="24" rx="1" fill={c2} />
          <rect x="20" y="16" width="6" height="28" rx="1" fill={c3} />
          <rect x="30" y="8" width="6" height="36" rx="1" fill={c1} />
          <rect x="37" y="18" width="6" height="26" rx="1" fill={c2} />
          <rect x="44" y="24" width="6" height="20" rx="1" fill={c3} />
          <rect x="54" y="14" width="6" height="30" rx="1" fill={c1} />
          <rect x="61" y="10" width="6" height="34" rx="1" fill={c2} />
          <rect x="68" y="22" width="6" height="22" rx="1" fill={c3} />
          <line x1="4" y1="44" x2="76" y2="44" stroke="#ccc" strokeWidth="0.5" />
        </svg>
      );
      return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <rect x="10" y="12" width="12" height="32" rx="1" fill={c1} />
          <rect x="26" y="8" width="12" height="36" rx="1" fill={c1} />
          <rect x="42" y="20" width="12" height="24" rx="1" fill={c1} />
          <rect x="58" y="4" width="12" height="40" rx="1" fill={c1} />
          <line x1="6" y1="44" x2="74" y2="44" stroke="#ccc" strokeWidth="0.5" />
        </svg>
      );
    }
    case 'bar': {
      if (template.stacked) return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <rect x="6" y="4" width="60" height="8" rx="1" fill={c1} />
          <rect x="6" y="4" width="35" height="8" rx="1" fill={c2} />
          <rect x="6" y="16" width="50" height="8" rx="1" fill={c1} />
          <rect x="6" y="16" width="28" height="8" rx="1" fill={c2} />
          <rect x="6" y="28" width="70" height="8" rx="1" fill={c1} />
          <rect x="6" y="28" width="42" height="8" rx="1" fill={c2} />
          <rect x="6" y="40" width="40" height="8" rx="1" fill={c1} />
          <rect x="6" y="40" width="22" height="8" rx="1" fill={c2} />
        </svg>
      );
      if (template.seriesCount >= 3) return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <rect x="6" y="2" width="60" height="5" rx="1" fill={c1} />
          <rect x="6" y="8" width="45" height="5" rx="1" fill={c2} />
          <rect x="6" y="14" width="52" height="5" rx="1" fill={c3} />
          <rect x="6" y="22" width="50" height="5" rx="1" fill={c1} />
          <rect x="6" y="28" width="68" height="5" rx="1" fill={c2} />
          <rect x="6" y="34" width="40" height="5" rx="1" fill={c3} />
          <rect x="6" y="42" width="70" height="5" rx="1" fill={c1} />
          <rect x="6" y="48" width="55" height="5" rx="1" fill={c2} />
        </svg>
      );
      return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <rect x="6" y="4" width="60" height="9" rx="1" fill={c1} />
          <rect x="6" y="16" width="45" height="9" rx="1" fill={c1} />
          <rect x="6" y="28" width="70" height="9" rx="1" fill={c1} />
          <rect x="6" y="40" width="35" height="9" rx="1" fill={c1} />
        </svg>
      );
    }
    case 'line': {
      if (template.seriesCount >= 3) return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <polyline points="8,38 20,28 32,32 44,18 56,22 68,10" fill="none" stroke={c1} strokeWidth="2" />
          <polyline points="8,42 20,34 32,38 44,28 56,30 68,20" fill="none" stroke={c2} strokeWidth="2" />
          <polyline points="8,44 20,40 32,42 44,36 56,38 68,30" fill="none" stroke={c3} strokeWidth="2" />
          <line x1="6" y1="48" x2="72" y2="48" stroke="#ccc" strokeWidth="0.5" />
        </svg>
      );
      if (template.markers) return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <polyline points="8,38 20,24 32,30 44,14 56,20 68,8" fill="none" stroke={c1} strokeWidth="2" />
          {[8,20,32,44,56,68].map((x, i) => <circle key={i} cx={x} cy={[38,24,30,14,20,8][i]} r="3" fill={c1} />)}
          <line x1="6" y1="48" x2="72" y2="48" stroke="#ccc" strokeWidth="0.5" />
        </svg>
      );
      return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <polyline points="8,38 20,24 32,30 44,14 56,20 68,8" fill="none" stroke={c1} strokeWidth="2" />
          <line x1="6" y1="48" x2="72" y2="48" stroke="#ccc" strokeWidth="0.5" />
        </svg>
      );
    }
    case 'area': {
      if (template.stacked) return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <polygon points="8,46 20,32 32,28 44,20 56,24 68,14 68,46" fill={c1} opacity="0.6" />
          <polygon points="8,46 20,38 32,34 44,30 56,32 68,26 68,46" fill={c2} opacity="0.6" />
          <line x1="6" y1="46" x2="72" y2="46" stroke="#ccc" strokeWidth="0.5" />
        </svg>
      );
      return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <polygon points="8,46 20,30 32,34 44,18 56,24 68,10 68,46" fill={c1} opacity="0.3" />
          <polyline points="8,46 20,30 32,34 44,18 56,24 68,10" fill="none" stroke={c1} strokeWidth="2" />
          <line x1="6" y1="46" x2="72" y2="46" stroke="#ccc" strokeWidth="0.5" />
        </svg>
      );
    }
    case 'pie': {
      const n = template.segments || 4;
      const cols = [c1, c2, c3, '#e879f9', '#f472b6', '#fb923c', '#facc15'];
      return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          {Array.from({ length: n }, (_, i) => {
            const angle1 = (i / n) * Math.PI * 2 - Math.PI / 2;
            const angle2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
            const cx = 40, cy = 26, r = 20;
            const x1 = cx + r * Math.cos(angle1), y1 = cy + r * Math.sin(angle1);
            const x2 = cx + r * Math.cos(angle2), y2 = cy + r * Math.sin(angle2);
            const large = (1 / n) > 0.5 ? 1 : 0;
            return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={cols[i % cols.length]} />;
          })}
        </svg>
      );
    }
    case 'donut': {
      const n = template.segments || 4;
      const cols = [c1, c2, c3, '#e879f9'];
      const inner = template.thin ? 15 : 11;
      return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          {Array.from({ length: n }, (_, i) => {
            const angle1 = (i / n) * Math.PI * 2 - Math.PI / 2;
            const angle2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
            const cx = 40, cy = 26, r = 20;
            const x1o = cx + r * Math.cos(angle1), y1o = cy + r * Math.sin(angle1);
            const x2o = cx + r * Math.cos(angle2), y2o = cy + r * Math.sin(angle2);
            const x1i = cx + inner * Math.cos(angle2), y1i = cy + inner * Math.sin(angle2);
            const x2i = cx + inner * Math.cos(angle1), y2i = cy + inner * Math.sin(angle1);
            const large = (1 / n) > 0.5 ? 1 : 0;
            return <path key={i} d={`M${x1o},${y1o} A${r},${r} 0 ${large},1 ${x2o},${y2o} L${x1i},${y1i} A${inner},${inner} 0 ${large},0 ${x2i},${y2i} Z`} fill={cols[i % cols.length]} />;
          })}
        </svg>
      );
    }
    case 'kpi': {
      if (template.simple) return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <text x="40" y="28" textAnchor="middle" fontSize="16" fontWeight="bold" fill={c1}>$4,280</text>
          <text x="40" y="42" textAnchor="middle" fontSize="8" fill="#999">Total Revenue</text>
        </svg>
      );
      return (
        <svg width={w} height={h} viewBox="0 0 80 52">
          <text x="12" y="20" fontSize="14" fontWeight="bold" fill={c1}>$4,280</text>
          <text x="12" y="30" fontSize="7" fill="#22c55e">+12.3%</text>
          <polyline points="12,42 22,38 32,40 42,34 52,36 62,30 72,28" fill="none" stroke={c1} strokeWidth="1.5" opacity="0.5" />
        </svg>
      );
    }
    case 'table': return (
      <svg width={w} height={h} viewBox="0 0 80 52">
        <rect x="4" y="4" width="72" height="8" rx="1" fill={c1} opacity="0.15" />
        <line x1="4" y1="16" x2="76" y2="16" stroke="#ddd" strokeWidth="0.5" />
        <line x1="4" y1="24" x2="76" y2="24" stroke="#ddd" strokeWidth="0.5" />
        <line x1="4" y1="32" x2="76" y2="32" stroke="#ddd" strokeWidth="0.5" />
        <line x1="4" y1="40" x2="76" y2="40" stroke="#ddd" strokeWidth="0.5" />
        {[8, 14, 22, 30, 38].map((y, i) => (
          <g key={i}>
            <rect x="6" y={y} width="14" height="4" rx="1" fill={i === 0 ? c1 : '#ccc'} opacity={i === 0 ? 0.6 : 0.4} />
            <rect x="24" y={y} width="18" height="4" rx="1" fill={i === 0 ? c1 : '#ccc'} opacity={i === 0 ? 0.6 : 0.3} />
            <rect x="46" y={y} width="10" height="4" rx="1" fill={i === 0 ? c1 : '#ccc'} opacity={i === 0 ? 0.6 : 0.3} />
            <rect x="60" y={y} width="12" height="4" rx="1" fill={i === 0 ? c1 : '#ccc'} opacity={i === 0 ? 0.6 : 0.3} />
          </g>
        ))}
      </svg>
    );
    case 'gauge': return (
      <svg width={w} height={h} viewBox="0 0 80 52">
        <path d="M 12 40 A 28 28 0 0 1 68 40" fill="none" stroke="#e5e7eb" strokeWidth="6" strokeLinecap="round" />
        <path d="M 12 40 A 28 28 0 0 1 56 14" fill="none" stroke={c1} strokeWidth="6" strokeLinecap="round" />
        <text x="40" y="44" textAnchor="middle" fontSize="10" fontWeight="bold" fill={c1}>72%</text>
      </svg>
    );
    case 'combo': return (
      <svg width={w} height={h} viewBox="0 0 80 52">
        <rect x="10" y="20" width="10" height="24" rx="1" fill={c1} opacity="0.7" />
        <rect x="24" y="12" width="10" height="32" rx="1" fill={c1} opacity="0.7" />
        <rect x="38" y="24" width="10" height="20" rx="1" fill={c1} opacity="0.7" />
        <rect x="52" y="8" width="10" height="36" rx="1" fill={c1} opacity="0.7" />
        <polyline points="15,18 29,10 43,22 57,6" fill="none" stroke={c2} strokeWidth="2" />
        <line x1="6" y1="44" x2="66" y2="44" stroke="#ccc" strokeWidth="0.5" />
      </svg>
    );
    case 'scatter': return (
      <svg width={w} height={h} viewBox="0 0 80 52">
        {[[14,36],[22,28],[30,32],[38,18],[44,24],[52,14],[60,20],[66,10],[18,40],[48,30]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill={c1} opacity="0.7" />
        ))}
        <line x1="8" y1="46" x2="72" y2="46" stroke="#ccc" strokeWidth="0.5" />
        <line x1="8" y1="6" x2="8" y2="46" stroke="#ccc" strokeWidth="0.5" />
      </svg>
    );
    case 'funnel': return (
      <svg width={w} height={h} viewBox="0 0 80 52">
        <polygon points="8,4 72,4 66,14 14,14" fill={c1} />
        <polygon points="14,16 66,16 60,26 20,26" fill={c2} />
        <polygon points="20,28 60,28 54,38 26,38" fill={c3} />
        <polygon points="26,40 54,40 48,50 32,50" fill="#e879f9" />
      </svg>
    );
    case 'treemap': return (
      <svg width={w} height={h} viewBox="0 0 80 52">
        <rect x="4" y="4" width="36" height="26" rx="1" fill={c1} />
        <rect x="42" y="4" width="34" height="14" rx="1" fill={c2} />
        <rect x="42" y="20" width="16" height="10" rx="1" fill={c3} />
        <rect x="60" y="20" width="16" height="10" rx="1" fill="#e879f9" />
        <rect x="4" y="32" width="22" height="16" rx="1" fill="#f472b6" />
        <rect x="28" y="32" width="24" height="16" rx="1" fill="#fb923c" />
        <rect x="54" y="32" width="22" height="16" rx="1" fill="#facc15" />
      </svg>
    );
    default: return null;
  }
}

export default function VisualPalette({
  designSystem,
  onAddVisual,
  onAddTemplate,
  onOpenAI,
  themePanel,
  pageWidth,
  pageHeight,
  onPageSizeChange,
  gridEnabled,
  onToggleGrid,
  referenceImage,
  onUploadReference,
  onReferenceOpacityChange,
  onToggleReference,
  selectedVisual,
  onUpdateVisual,
}) {
  const [activeTab, setActiveTab] = useState('elements');
  const fileInputRef = useRef(null);

  // Auto-switch to Properties tab when a visual is selected
  useEffect(() => {
    if (selectedVisual) {
      setActiveTab('properties');
    } else if (activeTab === 'properties') {
      setActiveTab('elements');
    }
  }, [selectedVisual?.id]);

  const tabs = [
    { id: 'elements', label: 'Elements' },
    { id: 'screens', label: 'Screens' },
    { id: 'design', label: 'Design' },
    { id: 'properties', label: 'Properties' },
  ];

  const handleDragStart = (e, type, templateId) => {
    e.dataTransfer.setData('visual-type', type);
    if (templateId) e.dataTransfer.setData('template-id', templateId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClickType = (type) => {
    // onAddVisual will open style picker for types with templates
    onAddVisual?.(type);
  };

  const handleReferenceUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUploadReference?.(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="w-[240px] bg-surface-light border-r border-surface-lighter flex flex-col flex-shrink-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-surface-lighter">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-text border-b-2 border-primary'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Elements tab */}
      {activeTab === 'elements' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {onOpenAI && (
            <div className="p-3 pb-0">
              <button
                onClick={onOpenAI}
                className="w-full py-2.5 bg-gradient-to-r from-[#0078D4] to-[#F2C811] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                <Wand2 size={14} />
                Create with AI
              </button>
            </div>
          )}

          {/* Visual type grid */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-1.5">
              {VISUAL_TYPES.map(({ type, label }) => {
                const Icon = ICON_MAP[type] || Layers;
                const hasTemplates = VISUAL_TEMPLATES[type]?.length > 1;
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, type)}
                    onClick={() => handleClickType(type)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-transparent hover:border-primary/20 hover:bg-primary/5 cursor-grab active:cursor-grabbing transition-all group relative"
                    title={`Click or drag to add ${label}`}
                  >
                    <Icon size={26} className="text-text-muted group-hover:text-primary transition-colors" strokeWidth={1.5} />
                    <span className="text-[11px] font-medium text-text-muted group-hover:text-text transition-colors text-center leading-tight">
                      {label}
                    </span>
                    {hasTemplates && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary/50" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center py-3">
              <DittoMascot size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Screens tab */}
      {activeTab === 'screens' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Screens</p>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
              <div className="w-14 h-8 rounded bg-white border border-surface-lighter flex items-center justify-center flex-shrink-0">
                <Monitor size={12} className="text-text-muted/50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary truncate">Screen 1</p>
                <p className="text-[10px] text-text-muted">{pageWidth}×{pageHeight}</p>
              </div>
            </div>
            <button
              className="w-full flex items-center gap-2 p-2.5 mt-1 rounded-lg border border-dashed border-surface-lighter text-text-muted hover:border-primary/30 hover:text-text transition-all text-[11px]"
              title="Multi-page support coming soon"
            >
              <Plus size={12} />
              Add Screen
            </button>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Page Size</p>
            <select
              value={`${pageWidth}x${pageHeight}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split('x').map(Number);
                onPageSizeChange?.(w, h);
              }}
              className="w-full text-xs bg-surface border border-surface-lighter text-text outline-none px-2.5 py-2 rounded-lg focus:border-primary transition-colors cursor-pointer"
            >
              {PAGE_SIZES.map(s => (
                <option key={`${s.w}x${s.h}`} value={`${s.w}x${s.h}`}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Grid</p>
            <button
              onClick={onToggleGrid}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-all ${
                gridEnabled
                  ? 'border-primary/30 bg-primary/5 text-primary'
                  : 'border-surface-lighter text-text-muted hover:border-primary/20'
              }`}
            >
              <Grid3X3 size={15} />
              <span>Snap to grid</span>
              <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${gridEnabled ? 'bg-primary/20 text-primary' : 'bg-surface-lighter text-text-muted'}`}>
                {gridEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Reference Image</p>
            {!referenceImage?.dataUrl ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed border-surface-lighter text-text-muted hover:border-primary/30 hover:text-text transition-all text-xs"
              >
                <Image size={15} />
                Upload reference
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-7 rounded border border-surface-lighter overflow-hidden flex-shrink-0">
                    <img src={referenceImage.dataUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-text truncate">Reference</p>
                  </div>
                  <button
                    onClick={onToggleReference}
                    className={`p-1 rounded transition-colors ${referenceImage.visible ? 'text-primary' : 'text-text-muted'}`}
                    title={referenceImage.visible ? 'Hide reference image' : 'Show reference image'}
                    aria-label={referenceImage.visible ? 'Hide reference image' : 'Show reference image'}
                  >
                    {referenceImage.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                {referenceImage.visible && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted flex-shrink-0">Opacity</span>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={referenceImage.opacity ?? 30}
                      onChange={(e) => onReferenceOpacityChange?.(parseInt(e.target.value))}
                      className="flex-1 h-1 accent-primary"
                    />
                    <span className="text-[10px] text-text-muted w-7 text-right">{referenceImage.opacity ?? 30}%</span>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] text-primary hover:underline"
                >
                  Replace image
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleReferenceUpload} />
          </div>
        </div>
      )}

      {/* Design tab */}
      {activeTab === 'design' && (
        <div className="flex-1 overflow-y-auto">
          {themePanel}
        </div>
      )}

      {/* Properties tab */}
      {activeTab === 'properties' && (
        <div className="flex-1 overflow-y-auto">
          {selectedVisual ? (
            <VisualPropertiesPanel
              visual={selectedVisual}
              onUpdate={(updates) => onUpdateVisual?.(selectedVisual.id, updates)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MousePointerClick size={32} className="text-text-muted/30 mb-3" />
              <p className="text-sm text-text-muted">Select a visual on the canvas to edit its properties</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
