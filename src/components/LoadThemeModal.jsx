import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Palette, Download, Upload, Copy, Trash2, Edit3, Search } from 'lucide-react';
import { getThemes, deleteTheme, duplicateTheme, exportThemeJSON, importThemeJSON, saveTheme } from '../lib/themeStorage';
import { COMMUNITY_TEMPLATES } from '../lib/communityTemplates';

export default function LoadThemeModal({ workspaceId, onClose, onApplyTheme, currentDesignSystem }) {
  const [tab, setTab] = useState('my');

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!workspaceId) { setLoading(false); return; }
    loadThemes();
  }, [workspaceId]);

  async function loadThemes() {
    setLoading(true);
    try {
      const t = await getThemes(workspaceId);
      setThemes(t);
    } catch (e) {
      console.error('Failed to load themes:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleApply = (theme) => {
    onApplyTheme({
      colors: theme.colors || theme.palette,
      fonts: theme.fonts,
      background: theme.background,
      sentinels: theme.sentinels,
      sentiment: theme.sentiment,
      themeName: theme.name,
      themeId: theme.id,
    });
    onClose();
  };

  const handleDelete = async (themeId) => {
    if (!confirm('Delete this theme?')) return;
    try {
      await deleteTheme(workspaceId, themeId);
      setThemes(prev => prev.filter(t => t.id !== themeId));
    } catch (e) { console.error('Delete failed:', e); }
  };

  const handleDuplicate = async (themeId) => {
    try {
      await duplicateTheme(workspaceId, themeId);
      await loadThemes();
    } catch (e) { console.error('Duplicate failed:', e); }
  };

  const handleExport = (theme) => exportThemeJSON(theme);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !workspaceId) return;
    try {
      const theme = await importThemeJSON(file);
      await saveTheme(workspaceId, theme);
      await loadThemes();
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  // Filter
  const filteredThemes = themes.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase())
  );

  const communityFiltered = COMMUNITY_TEMPLATES.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderThemeCard = (theme, isCommunity = false) => {
    const colors = theme.colors || theme.palette || [];
    const isSelected = selectedId === theme.id;
    return (
      <motion.div
        key={theme.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-surface-lighter bg-surface hover:border-primary/30'
        }`}
        onClick={() => setSelectedId(isSelected ? null : theme.id)}
        onDoubleClick={() => handleApply(theme)}
      >
        {/* Color preview */}
        <div className="flex gap-0.5 mb-2 rounded-lg overflow-hidden">
          {colors.slice(0, 6).map((c, i) => (
            <div key={i} className="flex-1 h-5" style={{ background: c.hex }} />
          ))}
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text truncate">{theme.name}</p>
            {theme.description && (
              <p className="text-[10px] text-text-muted truncate mt-0.5">{theme.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-[9px] text-text-muted">
              <span>{colors.length} colors</span>
              <span className="opacity-30">•</span>
              <span style={{ fontFamily: theme.fonts?.heading }}>{theme.fonts?.heading || 'Default'}</span>
              {theme.sentiment && <>
                <span className="opacity-30">•</span>
                <span>{theme.sentiment}</span>
              </>}
            </div>
          </div>
          {isSelected && <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />}
        </div>

        {/* Actions */}
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex gap-1.5 mt-3 pt-3 border-t border-surface-lighter"
          >
            <button
              onClick={(e) => { e.stopPropagation(); handleApply(theme); }}
              className="flex-1 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
            >
              <Palette size={12} /> Apply
            </button>
            {!isCommunity && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDuplicate(theme.id); }}
                  className="p-1.5 text-text-muted hover:text-primary rounded-lg hover:bg-surface-lighter transition-colors"
                  title="Duplicate"
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleExport(theme); }}
                  className="p-1.5 text-text-muted hover:text-primary rounded-lg hover:bg-surface-lighter transition-colors"
                  title="Export JSON"
                >
                  <Download size={13} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(theme.id); }}
                  className="p-1.5 text-text-muted hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    );
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
        className="bg-surface-light rounded-2xl w-full max-w-lg max-h-[80vh] shadow-2xl border border-surface-lighter flex flex-col"
      >
        {/* Header */}
        <div className="p-5 pb-0">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Palette size={18} className="text-primary" />
                Load Theme
              </h2>
              <p className="text-xs text-text-muted mt-0.5">Double-click to apply instantly</p>
            </div>
            <button onClick={onClose} className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setTab('my')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                tab === 'my' ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface'
              }`}
            >
              My Themes {themes.length > 0 && `(${themes.length})`}
            </button>
            <button
              onClick={() => setTab('community')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                tab === 'community' ? 'bg-primary text-white' : 'text-text-muted hover:bg-surface'
              }`}
            >
              Community Templates
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search themes..."
              className="w-full bg-surface border border-surface-lighter rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : tab === 'my' ? (
            <>
              {/* Import button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3 mb-3 rounded-xl border border-dashed border-surface-lighter hover:border-primary/30 flex items-center gap-2 text-xs text-text-muted hover:text-text transition-all"
              >
                <Upload size={14} />
                Import Theme from JSON
              </button>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

              {filteredThemes.length > 0 ? (
                <div className="space-y-2">
                  {filteredThemes.map(t => renderThemeCard(t))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Palette size={32} className="mx-auto mb-3 text-text-muted/30" />
                  <p className="text-sm font-medium text-text-muted">No saved themes yet</p>
                  <p className="text-xs text-text-muted/70 mt-1">Save a theme from the Moodboard to see it here</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {communityFiltered.map(t => renderThemeCard(t, true))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
