import { useState, useRef } from 'react';
import { Upload, Check } from 'lucide-react';
import { TEMPLATES } from '../lib/templates';

const BUILT_IN_THEMES = TEMPLATES.map(t => ({
  id: t.id,
  name: t.name,
  colors: t.palette,
  fonts: t.fonts,
  background: t.background,
  sentinels: t.sentinels,
}));

// Add a default PBI theme
BUILT_IN_THEMES.unshift({
  id: 'default-pbi',
  name: 'Power BI Default',
  colors: [
    { hex: '#0078D4', rgb: { r: 0, g: 120, b: 212 }, hsl: { h: 206, s: 100, l: 42 } },
    { hex: '#E3008C', rgb: { r: 227, g: 0, b: 140 }, hsl: { h: 323, s: 100, l: 45 } },
    { hex: '#00B294', rgb: { r: 0, g: 178, b: 148 }, hsl: { h: 170, s: 100, l: 35 } },
    { hex: '#FFB900', rgb: { r: 255, g: 185, b: 0 }, hsl: { h: 44, s: 100, l: 50 } },
    { hex: '#D83B01', rgb: { r: 216, g: 59, b: 1 }, hsl: { h: 16, s: 99, l: 43 } },
    { hex: '#5C2D91', rgb: { r: 92, g: 45, b: 145 }, hsl: { h: 268, s: 53, l: 37 } },
  ],
  fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 18, bodySize: 10 },
  background: '#FFFFFF',
  sentinels: { good: '#107C10', neutral: '#F2C811', bad: '#D83B01' },
});

export default function ThemePanel({ designSystem, onApplyTheme }) {
  const [hoveredTheme, setHoveredTheme] = useState(null);
  const [activeThemeId, setActiveThemeId] = useState(null);
  const fileInputRef = useRef(null);

  const handleApply = (theme) => {
    setActiveThemeId(theme.id);
    onApplyTheme({
      colors: theme.colors,
      fonts: theme.fonts,
      background: theme.background,
      sentinels: theme.sentinels,
    });
  };

  const handleUploadTheme = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        const colors = (json.dataColors || []).map((hex) => {
          const r = parseInt(hex.slice(1, 3), 16) || 0;
          const g = parseInt(hex.slice(3, 5), 16) || 0;
          const b = parseInt(hex.slice(5, 7), 16) || 0;
          return { hex, rgb: { r, g, b }, hsl: { h: 0, s: 0, l: 0 } };
        });
        const theme = {
          colors: colors.length ? colors : designSystem.colors,
          fonts: {
            heading: json.textClasses?.title?.fontFace || designSystem.fonts.heading,
            body: json.textClasses?.label?.fontFace || designSystem.fonts.body,
            titleSize: json.textClasses?.title?.fontSize || designSystem.fonts.titleSize,
            bodySize: json.textClasses?.label?.fontSize || designSystem.fonts.bodySize,
          },
          background: json.background || designSystem.background,
          sentinels: designSystem.sentinels,
        };
        onApplyTheme(theme);
        setActiveThemeId('custom');
      } catch (err) {
        console.error('Invalid theme JSON:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-3 space-y-2">
      {/* Current theme preview */}
      <div className="p-2.5 rounded-lg border border-surface-lighter bg-surface">
        <p className="text-[9px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Current</p>
        <div className="flex gap-0.5 mb-1.5">
          {(designSystem?.colors || []).slice(0, 6).map((c, i) => (
            <div key={i} className="flex-1 h-4 rounded-sm" style={{ background: c.hex }} title={c.hex} />
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-text-muted">
          <span style={{ fontFamily: designSystem?.fonts?.heading }}>
            {designSystem?.fonts?.heading || 'Segoe UI'}
          </span>
          <span className="opacity-40">|</span>
          <div className="w-3 h-3 rounded border border-surface-lighter" style={{ background: designSystem?.background || '#fff' }} />
        </div>
      </div>

      {/* Built-in themes */}
      {BUILT_IN_THEMES.map((theme) => {
        const isActive = activeThemeId === theme.id;
        const isHovered = hoveredTheme === theme.id;
        return (
          <button
            key={theme.id}
            onClick={() => handleApply(theme)}
            onMouseEnter={() => setHoveredTheme(theme.id)}
            onMouseLeave={() => setHoveredTheme(null)}
            className={`w-full p-2.5 rounded-lg border text-left transition-all ${
              isActive
                ? 'border-primary bg-primary/5'
                : isHovered
                  ? 'border-primary/30 bg-surface'
                  : 'border-surface-lighter bg-surface hover:bg-surface'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-text">{theme.name}</span>
              {isActive && <Check size={10} className="text-primary" />}
            </div>
            <div className="flex gap-0.5">
              {theme.colors.slice(0, 6).map((c, i) => (
                <div key={i} className="flex-1 h-3 rounded-sm" style={{ background: c.hex }} />
              ))}
            </div>
          </button>
        );
      })}

      {/* Upload custom theme */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full p-2.5 rounded-lg border border-dashed border-surface-lighter hover:border-primary/30 flex items-center gap-2 text-[10px] text-text-muted hover:text-text transition-all"
      >
        <Upload size={12} />
        Upload PBI Theme JSON
      </button>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleUploadTheme} />
    </div>
  );
}
