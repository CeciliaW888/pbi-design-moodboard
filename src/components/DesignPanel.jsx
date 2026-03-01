import { useState } from 'react';
import { Type, Paintbrush, ListChecks, Plus, X } from 'lucide-react';

const PBI_FONTS = [
  'Segoe UI', 'Segoe UI Semibold', 'Segoe UI Light', 'Segoe UI Bold',
  'Arial', 'Calibri', 'Cambria', 'Courier New', 'Georgia',
  'Lucida Sans', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
  'DIN', 'Poppins', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'
];

export default function DesignPanel({ fonts, background, formatRules, sentinels, onUpdate }) {
  const [newRule, setNewRule] = useState('');

  const updateFont = (key, value) => {
    onUpdate({ fonts: { ...fonts, [key]: value } });
  };

  const addRule = () => {
    if (!newRule.trim()) return;
    onUpdate({ formatRules: [...formatRules, newRule.trim()] });
    setNewRule('');
  };

  const removeRule = (index) => {
    onUpdate({ formatRules: formatRules.filter((_, i) => i !== index) });
  };

  const updateSentinel = (key, value) => {
    onUpdate({ sentinels: { ...sentinels, [key]: value } });
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

      {/* KPI Sentinel Colors */}
      <section>
        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
          <span className="flex gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          </span>
          KPI Sentinel Colors
        </h3>
        <p className="text-xs text-text-muted mb-3">Used in KPI visuals and conditional formatting rules.</p>
        <div className="space-y-2">
          {[
            { key: 'good', label: 'Good', defaultVal: '#107C10' },
            { key: 'neutral', label: 'Neutral', defaultVal: '#F2C811' },
            { key: 'bad', label: 'Bad / Alert', defaultVal: '#D83B01' },
          ].map(({ key, label, defaultVal }) => {
            const val = sentinels?.[key] || defaultVal;
            return (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={val}
                  onChange={e => updateSentinel(key, e.target.value)}
                  className="w-8 h-8 rounded-lg border border-surface-lighter cursor-pointer"
                />
                <label className="text-sm text-text-muted flex-1">{label}</label>
                <span className="text-xs font-mono text-text-light">{val.toUpperCase()}</span>
              </div>
            );
          })}
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
              <button onClick={() => removeRule(i)} className="text-text-muted hover:text-red-400">
                <X size={12} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newRule}
              onChange={e => setNewRule(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addRule()}
              placeholder='e.g. "All card titles 14pt bold"'
              className="flex-1 bg-surface text-text border border-surface-lighter rounded-lg px-3 py-2 text-sm placeholder:text-text-light outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={addRule}
              disabled={!newRule.trim()}
              className="px-3 py-2 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
