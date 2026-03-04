import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bookmark, Loader2 } from 'lucide-react';
import { saveTheme } from '../lib/themeStorage';

export default function SaveThemeModal({ designSystem, workspaceId, onClose, onSaved }) {
  const [name, setName] = useState(designSystem?.name || '');

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!workspaceId) { setError('Please sign in to save themes.'); return; }

    setSaving(true);
    setError('');
    try {
      const theme = {
        name: name.trim(),
        description: description.trim(),
        colors: designSystem.colors || [],
        fonts: designSystem.fonts || {},
        background: designSystem.background || '#ffffff',
        sentinels: designSystem.sentinels || { good: '#107C10', neutral: '#F2C811', bad: '#D83B01' },
        sentiment: designSystem.sentiment || '',
        spacing: designSystem.spacing || 'comfortable',
        createdFrom: 'moodboard',
      };
      const id = await saveTheme(workspaceId, theme);
      onSaved?.({ ...theme, id });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save theme');
    } finally {
      setSaving(false);
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
        className="bg-surface-light rounded-2xl p-6 w-full max-w-md shadow-2xl border border-surface-lighter"
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Bookmark size={18} className="text-primary" />
              Save as Theme
            </h2>
            <p className="text-xs text-text-muted mt-0.5">Save your design system to your theme library</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Preview */}
        <div className="p-3 rounded-xl border border-surface-lighter bg-surface mb-4">
          <div className="flex gap-0.5 mb-2">
            {(designSystem?.colors || []).slice(0, 8).map((c, i) => (
              <div key={i} className="flex-1 h-6 rounded-sm first:rounded-l-md last:rounded-r-md" style={{ background: c.hex }} title={c.hex} />
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-muted">
            <span style={{ fontFamily: designSystem?.fonts?.heading }}>{designSystem?.fonts?.heading || 'Default'}</span>
            <span className="opacity-30">•</span>
            <span>{(designSystem?.colors || []).length} colors</span>
            <span className="opacity-30">•</span>
            <div className="w-3 h-3 rounded border border-surface-lighter" style={{ background: designSystem?.background || '#fff' }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Theme Name *</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Client ABC Brand, Dark Minimal"
              className="w-full bg-surface border border-surface-lighter rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Description <span className="text-text-muted/60">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Corporate brand colors extracted from annual report..."
              rows={2}
              className="w-full bg-surface border border-surface-lighter rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-surface text-text-muted text-sm font-medium rounded-xl hover:bg-surface-lighter transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Bookmark size={15} /> Save Theme</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
