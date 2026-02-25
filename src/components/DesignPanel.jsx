import { Type, Paintbrush, ListChecks } from 'lucide-react';

const PBI_FONTS = [
  'Segoe UI', 'Segoe UI Semibold', 'Segoe UI Light', 'Segoe UI Bold',
  'Arial', 'Calibri', 'Cambria', 'Courier New', 'Georgia',
  'Lucida Sans', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
  'DIN', 'Poppins', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'
];

export default function DesignPanel({ fonts, background, formatRules, onUpdate }) {
  const updateFont = (key, value) => {
    onUpdate({ fonts: { ...fonts, [key]: value } });
  };

  const addRule = () => {
    const rule = prompt('Add a format rule (e.g., "All card titles 14pt bold")');
    if (rule) onUpdate({ formatRules: [...formatRules, rule] });
  };

  const removeRule = (index) => {
    onUpdate({ formatRules: formatRules.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Typography */}
      <section>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Type size={16} className="text-primary" />
          Typography
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-muted block mb-1">Heading Font</label>
            <select
              value={fonts.heading}
              onChange={(e) => updateFont('heading', e.target.value)}
              className="w-full bg-surface text-text border border-surface-lighter rounded-lg px-3 py-2 text-sm"
            >
              {PBI_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Body Font</label>
            <select
              value={fonts.body}
              onChange={(e) => updateFont('body', e.target.value)}
              className="w-full bg-surface text-text border border-surface-lighter rounded-lg px-3 py-2 text-sm"
            >
              {PBI_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-text-muted block mb-1">Title Size</label>
              <input
                type="number"
                value={fonts.titleSize}
                onChange={(e) => updateFont('titleSize', +e.target.value)}
                className="w-full bg-surface text-text border border-surface-lighter rounded-lg px-3 py-2 text-sm"
                min={8} max={48}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-text-muted block mb-1">Body Size</label>
              <input
                type="number"
                value={fonts.bodySize}
                onChange={(e) => updateFont('bodySize', +e.target.value)}
                className="w-full bg-surface text-text border border-surface-lighter rounded-lg px-3 py-2 text-sm"
                min={6} max={24}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Background */}
      <section>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Paintbrush size={16} className="text-primary" />
          Page Background
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={background}
            onChange={(e) => onUpdate({ background: e.target.value })}
            className="w-10 h-10 rounded-lg border border-surface-lighter cursor-pointer"
          />
          <input
            type="text"
            value={background}
            onChange={(e) => onUpdate({ background: e.target.value })}
            className="flex-1 bg-surface text-text border border-surface-lighter rounded-lg px-3 py-2 text-sm font-mono"
          />
        </div>
      </section>

      {/* Format Rules */}
      <section>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ListChecks size={16} className="text-primary" />
          Format Rules
        </h3>
        <div className="space-y-2">
          {formatRules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2 text-sm bg-surface rounded-lg px-3 py-2">
              <span className="flex-1">{rule}</span>
              <button onClick={() => removeRule(i)} className="text-text-muted hover:text-red-400 text-xs">✕</button>
            </div>
          ))}
          <button
            onClick={addRule}
            className="w-full py-2 border border-dashed border-surface-lighter rounded-lg text-sm text-text-muted hover:text-text hover:border-primary transition-colors"
          >
            + Add Format Rule
          </button>
        </div>
      </section>
    </div>
  );
}
