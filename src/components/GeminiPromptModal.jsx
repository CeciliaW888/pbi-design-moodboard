import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Loader2, Settings } from 'lucide-react';
import DittoMascot from './DittoMascot';
import { generateVisualSpec } from '../lib/geminiClient';

const VISUAL_TYPES = [
  { id: 'bar',     label: 'Bar' },
  { id: 'line',    label: 'Line' },
  { id: 'area',    label: 'Area' },
  { id: 'kpi',     label: 'KPI' },
  { id: 'donut',   label: 'Donut' },
  { id: 'table',   label: 'Table' },
  { id: 'scatter', label: 'Scatter' },
];

export default function GeminiPromptModal({
  onClose,
  onGenerate,
  designSystem,
  apiKey = '',
}) {
  const [description, setDescription] = useState('');
  const [typeOverride, setTypeOverride] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    if (!apiKey.trim()) { setError('No API key set. Configure it in Settings (gear icon in the header).'); return; }

    setLoading(true);
    setError('');
    try {
      const prompt = typeOverride
        ? `${description.trim()} (use ${typeOverride} chart type)`
        : description.trim();
      const spec = await generateVisualSpec(apiKey.trim(), prompt, designSystem);
      onGenerate(spec, description.trim());
    } catch (err) {
      setError(err.message || 'Generation failed. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Generate Visual"
        className="bg-surface-light rounded-2xl p-6 w-full max-w-md shadow-2xl border border-surface-lighter"
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Wand2 size={18} className="text-primary" />
              Generate Visual
            </h2>
            <p className="text-xs text-text-muted mt-0.5">AI will use your extracted design system palette</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors"
            title="Close"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">
              Describe this visual
            </label>
            <textarea
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Month-on-month revenue bar chart comparing this year vs last year"
              rows={3}
              className="w-full bg-surface border border-surface-lighter rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
              required
            />
          </div>

          {/* Visual type override */}
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">
              Chart type <span className="text-text-muted/60">(optional — AI will choose if unset)</span>
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {VISUAL_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTypeOverride(prev => prev === t.id ? null : t.id)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    typeOverride === t.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface border-surface-lighter text-text-muted hover:border-primary/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* API Key hint */}
          {!apiKey && (
            <div className="flex items-center gap-2 text-xs text-text-muted bg-surface rounded-lg px-3 py-2">
              <Settings size={13} className="text-primary flex-shrink-0" />
              <span>Configure your Gemini API key in <strong className="text-text">Settings</strong> (gear icon in the header)</span>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-surface text-text-muted text-sm font-medium rounded-xl hover:bg-surface-lighter transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><DittoMascot size={24} expression="thinking" /> Generating…</>
              ) : (
                <><Wand2 size={15} /> Generate</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
