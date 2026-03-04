import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Star, TrendingUp, ArrowRight, X, Check, Sparkles } from 'lucide-react';
import { COMMUNITY_TEMPLATES, CATEGORIES, SORT_OPTIONS, filterTemplates } from '../lib/communityTemplates';

function PalettePreview({ palette, background }) {
  return (
    <div className="relative w-full h-32 rounded-lg overflow-hidden" style={{ backgroundColor: background }}>
      {/* Mini dashboard mockup using palette colors */}
      <div className="absolute inset-0 p-3 flex flex-col gap-2">
        {/* Header bar */}
        <div className="flex items-center gap-2">
          <div className="h-2.5 rounded-full" style={{ backgroundColor: palette[0]?.hex, width: '40%' }} />
          <div className="flex-1" />
          <div className="w-6 h-2.5 rounded-full" style={{ backgroundColor: palette[2]?.hex, opacity: 0.6 }} />
        </div>
        {/* Chart area */}
        <div className="flex-1 flex items-end gap-1 px-1">
          {palette.slice(0, 5).map((color, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all"
              style={{
                backgroundColor: color.hex,
                height: `${30 + Math.sin(i * 1.5) * 25 + 30}%`,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
        {/* Bottom legend */}
        <div className="flex gap-1.5">
          {palette.slice(0, 3).map((color, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex }} />
              <div className="h-1.5 w-6 rounded-full bg-current opacity-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorDots({ palette }) {
  return (
    <div className="flex gap-1">
      {palette.slice(0, 6).map((color, i) => (
        <div
          key={i}
          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
          style={{ backgroundColor: color.hex }}
          title={color.hex}
        />
      ))}
    </div>
  );
}

function TemplateCard({ template, onUse }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group relative bg-surface-light border border-surface-lighter rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Featured badge */}
      {template.featured && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Star size={10} fill="currentColor" />
          Featured
        </div>
      )}

      {/* Preview */}
      <div className="p-3 pb-0">
        <PalettePreview palette={template.palette} background={template.background} />
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-text">{template.name}</h3>
          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{template.description}</p>
        </div>

        {/* Color dots */}
        <ColorDots palette={template.palette} />

        {/* Meta row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span className="flex items-center gap-1">
              <Download size={11} />
              {template.downloads.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp size={11} />
              {template.popularity}%
            </span>
          </div>
          <span className="text-[10px] text-text-muted/60">{template.author.name}</span>
        </div>

        {/* Use button */}
        <motion.button
          onClick={() => onUse(template)}
          className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles size={14} />
          Use This Template
          <ArrowRight size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function TemplateDetailModal({ template, onUse, onClose }) {
  if (!template) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview */}
        <div className="p-6 pb-4">
          <PalettePreview palette={template.palette} background={template.background} />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-text">{template.name}</h2>
              <p className="text-sm text-text-muted mt-1">{template.description}</p>
            </div>
            <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-light">
              <X size={18} />
            </button>
          </div>

          {/* Palette */}
          <div>
            <p className="text-xs font-medium text-text-muted mb-2">Color Palette</p>
            <div className="flex gap-2">
              {template.palette.map((color, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full h-10 rounded-lg shadow-sm" style={{ backgroundColor: color.hex }} />
                  <span className="text-[10px] text-text-muted font-mono">{color.hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fonts & Sentinels */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-text-muted mb-1">Fonts</p>
              <p className="text-sm text-text">{template.fonts.heading}</p>
              <p className="text-xs text-text-muted">{template.fonts.body}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted mb-1">Sentiment Colors</p>
              <div className="flex gap-2">
                {Object.entries(template.sentinels).map(([key, hex]) => (
                  <div key={key} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hex }} />
                    <span className="text-[10px] text-text-muted capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {template.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-surface-light text-text-muted rounded-full border border-surface-lighter">
                {tag}
              </span>
            ))}
          </div>

          {/* Stats + Use button */}
          <div className="flex items-center justify-between pt-2 border-t border-surface-lighter">
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1"><Download size={12} /> {template.downloads.toLocaleString()} uses</span>
              <span className="flex items-center gap-1"><TrendingUp size={12} /> {template.popularity}% popularity</span>
              <span>by {template.author.name}</span>
            </div>
            <button
              onClick={() => onUse(template)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Check size={14} />
              Use Template
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TemplateGallery({ onUseTemplate }) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [detailTemplate, setDetailTemplate] = useState(null);

  const filtered = useMemo(
    () => filterTemplates(COMMUNITY_TEMPLATES, { category, search, sort }),
    [category, search, sort]
  );

  const featured = useMemo(
    () => COMMUNITY_TEMPLATES.filter(t => t.featured).sort((a, b) => b.popularity - a.popularity),
    []
  );

  const handleUse = (template) => {
    onUseTemplate(template);
    setDetailTemplate(null);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-text">Template Gallery</h1>
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
              {COMMUNITY_TEMPLATES.length} templates
            </span>
          </div>
          <p className="text-text-muted">
            One-click design systems for Power BI. Pick a template, make it yours.
          </p>
        </div>

        {/* Featured Banner */}
        {category === 'all' && !search && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star size={14} className="text-amber-500" />
              Featured Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.slice(0, 3).map(template => (
                <motion.div
                  key={template.id}
                  className="relative bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => setDetailTemplate(template)}
                  whileHover={{ y: -2 }}
                >
                  <PalettePreview palette={template.palette} background={template.background} />
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-text">{template.name}</h3>
                      <p className="text-xs text-text-muted">{template.downloads.toLocaleString()} uses</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUse(template); }}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Use
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-4 py-2 bg-surface-light border border-surface-lighter rounded-lg text-sm text-text placeholder:text-text-muted/50 outline-none focus:border-primary transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-surface-light border border-surface-lighter rounded-lg text-sm text-text outline-none focus:border-primary cursor-pointer"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-light text-text-muted hover:text-text hover:bg-surface-lighter border border-surface-lighter'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs text-text-muted mb-4">
          {filtered.length} template{filtered.length !== 1 ? 's' : ''}
          {category !== 'all' && ` in ${CATEGORIES.find(c => c.id === category)?.label}`}
          {search && ` matching "${search}"`}
        </p>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUse}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm font-medium text-text-muted">No templates found</p>
            <p className="text-xs text-text-muted/70 mt-1">Try adjusting your filters or search</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailTemplate && (
          <TemplateDetailModal
            template={detailTemplate}
            onUse={handleUse}
            onClose={() => setDetailTemplate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
