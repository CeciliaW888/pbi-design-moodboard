export default function LivePreview({ designSystem }) {
  const { colors, fonts, background } = designSystem;
  const fg = isLight(background) ? '#333' : '#eee';
  const fgMuted = isLight(background) ? '#888' : '#aaa';
  const cardBg = isLight(background) ? '#ffffff' : lighten(background, 15);
  const c = (i) => colors[i]?.hex || '#0078D4';

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-text-muted">Dashboard Preview</h3>

      {/* Mini dashboard mockup */}
      <div
        className="rounded-xl overflow-hidden shadow-xl border border-surface-lighter"
        style={{ background, color: fg, fontFamily: fonts.body }}
      >
        {/* Title bar */}
        <div className="px-4 py-3 border-b" style={{ borderColor: fgMuted + '22' }}>
          <h2 style={{ fontFamily: fonts.heading, fontSize: fonts.titleSize * 0.8, margin: 0, color: fg }}>
            Sales Dashboard
          </h2>
          <p style={{ fontSize: 10, color: fgMuted, margin: '2px 0 0' }}>FY 2024 — Q4 Report</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-2 p-3">
          {['Revenue', 'Orders', 'Conversion'].map((label, i) => (
            <div key={label} className="rounded-lg p-3" style={{ background: cardBg }}>
              <p style={{ fontSize: 9, color: fgMuted, margin: 0 }}>{label}</p>
              <p style={{ fontSize: 18, fontFamily: fonts.heading, fontWeight: 700, margin: '4px 0 0', color: c(i) }}>
                {['$2.4M', '12,847', '3.2%'][i]}
              </p>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="px-3 pb-3">
          <div className="rounded-lg p-3" style={{ background: cardBg }}>
            <p style={{ fontSize: 10, fontFamily: fonts.heading, fontWeight: 600, marginBottom: 8 }}>Monthly Trend</p>
            <div className="flex items-end gap-1 h-16">
              {[40, 55, 35, 65, 80, 60, 75, 90, 70, 85, 95, 88].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${h}%`,
                    background: c(i % Math.min(colors.length, 3)),
                    opacity: 0.8
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span style={{ fontSize: 7, color: fgMuted }}>Jan</span>
              <span style={{ fontSize: 7, color: fgMuted }}>Dec</span>
            </div>
          </div>
        </div>

        {/* Donut + table */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          <div className="rounded-lg p-3 flex items-center justify-center" style={{ background: cardBg }}>
            <svg width="60" height="60" viewBox="0 0 60 60">
              {colors.slice(0, 4).map((color, i, arr) => {
                const total = arr.length;
                const angle = (360 / total) * i;
                const endAngle = (360 / total) * (i + 1) - 4;
                return (
                  <circle
                    key={i}
                    cx="30" cy="30" r="22"
                    fill="none"
                    stroke={color.hex}
                    strokeWidth="8"
                    strokeDasharray={`${(endAngle - angle) * 0.38} 200`}
                    strokeDashoffset={-angle * 0.38}
                    strokeLinecap="round"
                  />
                );
              })}
              <text x="30" y="33" textAnchor="middle" fill={fg} fontSize="10" fontWeight="bold">68%</text>
            </svg>
          </div>
          <div className="rounded-lg p-2" style={{ background: cardBg }}>
            {['Product A', 'Product B', 'Product C'].map((item, i) => (
              <div key={item} className="flex justify-between items-center py-1 border-b last:border-0" style={{ borderColor: fgMuted + '22', fontSize: 8 }}>
                <span style={{ color: fg }}>{item}</span>
                <span style={{ color: c(i), fontWeight: 600 }}>{['$840K', '$620K', '$340K'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color legend */}
      {colors.length > 0 && (
        <div>
          <p className="text-xs text-text-muted mb-2">Active Palette</p>
          <div className="flex gap-1 flex-wrap">
            {colors.slice(0, 10).map((c, i) => (
              <div key={i} className="w-6 h-6 rounded-md" style={{ background: c.hex }} title={c.hex} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function isLight(hex) {
  if (!hex || hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function lighten(hex, amount) {
  if (!hex || hex.length < 7) return '#333';
  let r = parseInt(hex.slice(1, 3), 16) + amount;
  let g = parseInt(hex.slice(3, 5), 16) + amount;
  let b = parseInt(hex.slice(5, 7), 16) + amount;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}
