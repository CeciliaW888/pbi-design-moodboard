import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Plus, Info, AlertTriangle } from 'lucide-react';
import DittoMascot from './DittoMascot';
import { useState } from 'react';

const PBI_COLOR_ROLES = [
  'Data Color 1', 'Data Color 2', 'Data Color 3', 'Data Color 4',
  'Data Color 5', 'Data Color 6', 'Data Color 7', 'Data Color 8',
];

export default function ColorPalette({ colors, onRemove, onAdd, analysis }) {
  const [showAddHex, setShowAddHex] = useState(false);
  const [newHex, setNewHex] = useState('#0078D4');
  const [hexError, setHexError] = useState('');

  const handleAddHex = () => {
    const val = newHex.trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(val)) {
      setHexError('Enter a valid hex e.g. #0078D4');
      return;
    }
    setHexError('');
    if (onAdd) onAdd(val);
    setShowAddHex(false);
    setNewHex('#0078D4');
  };

  const slotsLeft = Math.max(0, 8 - colors.length);
  const extraCount = Math.max(0, colors.length - 8);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-text flex items-center gap-2">
            Color Palette
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-surface text-text-muted border border-surface-lighter">
              {colors.length} / 8 PBI slots
            </span>
          </h3>
          {analysis?.suggestion && (
            <p className="text-xs text-primary mt-1">{analysis.suggestion}</p>
          )}
        </div>
        <button
          onClick={() => setShowAddHex(v => !v)}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-surface border border-surface-lighter rounded-lg text-xs text-text-muted hover:text-primary hover:border-primary transition-colors"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <AnimatePresence>
        {showAddHex && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 items-center p-3 bg-surface rounded-xl border border-surface-lighter">
              <input
                type="color"
                value={newHex}
                onChange={e => setNewHex(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-surface-lighter"
              />
              <input
                type="text"
                value={newHex}
                onChange={e => { setNewHex(e.target.value); setHexError(''); }}
                placeholder="#0078D4"
                className="flex-1 bg-transparent text-sm font-mono text-text outline-none border-b border-surface-lighter focus:border-primary transition-colors"
                onKeyDown={e => e.key === 'Enter' && handleAddHex()}
              />
              <button
                onClick={handleAddHex}
                className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                Add
              </button>
            </div>
            {hexError && <p className="text-xs text-red-400 mt-1 px-1">{hexError}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {colors.length > 0 && colors.length !== 8 && (
        <div className="flex items-start gap-2 p-2.5 bg-yellow-light border border-yellow/30 rounded-lg text-xs text-text-muted">
          <AlertTriangle size={13} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <span>
            Power BI themes use <strong>exactly 8 data colors</strong>.{' '}
            {slotsLeft > 0
              ? `Add ${slotsLeft} more to fill all slots.`
              : `${extraCount} color${extraCount > 1 ? 's' : ''} beyond slot 8 will be ignored.`}
          </span>
        </div>
      )}

      {colors.length === 0 ? (
        <div className="text-center py-8 text-text-muted text-sm">
          <DittoMascot size={48} className="mx-auto mb-3" />
          <p className="font-medium mb-1">No colors yet</p>
          <p className="text-xs max-w-[200px] mx-auto text-text-muted">
            Select a screenshot and click "Extract Design" to pull colors, fonts, and style. Set a Gemini API key in Settings for full AI extraction.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted mb-2">
            Data Colors <span className="normal-case font-normal">(applied in chart series order)</span>
          </p>
          <div className="space-y-1.5">
            {Array.from({ length: Math.max(8, colors.length) }).map((_, i) => (
              <ColorSlotRow
                key={i}
                index={i}
                color={colors[i]}
                role={PBI_COLOR_ROLES[i] || `Extra ${i - 7}`}
                isExtra={i >= 8}
                onRemove={colors[i] ? () => onRemove(colors[i].hex) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="flex items-start gap-2 p-2.5 bg-primary-light border border-primary/10 rounded-lg text-xs text-text-muted">
          <Info size={13} className="text-primary flex-shrink-0 mt-0.5" />
          <span>Data Color 1 maps to the first series in bar, column, and line charts across all visuals.</span>
        </div>
      )}
    </div>
  );
}

function ColorSlotRow({ index, color, role, isExtra, onRemove }) {
  const [copied, setCopied] = useState(false);

  const copyHex = () => {
    if (!color) return;
    navigator.clipboard.writeText(color.hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(e => console.error('Copy failed:', e));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-colors ${
        isExtra
          ? 'border-orange-200 bg-orange-50/50'
          : color
            ? 'border-surface-lighter bg-surface hover:border-primary/20'
            : 'border-dashed border-surface-lighter bg-transparent'
      }`}
    >
      <span className={`text-[10px] font-mono w-4 text-center flex-shrink-0 ${isExtra ? 'text-orange-400' : 'text-text-light'}`}>
        {index + 1}
      </span>
      <div
        className={`w-7 h-7 rounded-md flex-shrink-0 border transition-all ${
          color ? 'border-black/10 cursor-pointer hover:scale-110' : 'border-dashed border-surface-lighter bg-surface-lighter'
        }`}
        style={color ? { backgroundColor: color.hex } : {}}
        onClick={copyHex}
        title={color ? `${color.hex} — click to copy` : 'Empty slot'}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-medium leading-tight ${isExtra ? 'text-orange-500' : color ? 'text-text' : 'text-text-light'}`}>
          {role}
          {isExtra && <span className="ml-1 text-[10px] font-normal text-text-muted">(ignored)</span>}
          {!color && !isExtra && <span className="text-[10px] font-normal"> — empty</span>}
        </p>
        {color && (
          <p className="text-[10px] font-mono text-text-light">
            {copied ? <span className="text-green-500">Copied!</span> : color.hex.toUpperCase()}
          </p>
        )}
      </div>
      {color && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={copyHex} className="p-1 text-text-light hover:text-text-muted rounded transition-colors" title="Copy hex">
            {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
          </button>
          {onRemove && (
            <button onClick={onRemove} className="p-1 text-text-light hover:text-red-400 rounded transition-colors" title="Remove">
              <X size={11} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
