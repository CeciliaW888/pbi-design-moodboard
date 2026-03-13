import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Pencil, Copy, Trash2 } from 'lucide-react';
import { sanitizeName } from '../lib/validation';

export default function ProjectCard({ project, onOpen, onRename, onDuplicate, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(project.name || 'Untitled');
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (renaming && inputRef.current) inputRef.current.focus();
  }, [renaming]);

  const paletteColors = (project.palette || []).slice(0, 5);

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds * 1000 : ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  const handleRenameSubmit = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== project.name) {
      onRename?.(project.id, trimmed);
    } else {
      setNameValue(project.name || 'Untitled');
    }
    setRenaming(false);
  };

  // Generate a gradient placeholder from palette colors
  const gradientBg = paletteColors.length >= 2
    ? `linear-gradient(135deg, ${paletteColors[0].hex} 0%, ${paletteColors[1].hex} 50%, ${paletteColors[paletteColors.length - 1].hex} 100%)`
    : 'linear-gradient(135deg, #0078D4 0%, #50E6FF 100%)';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-surface-light border border-surface-lighter rounded-xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
      onClick={() => !renaming && onOpen?.(project)}
    >
      {/* Thumbnail area */}
      <div
        className="h-36 w-full relative overflow-hidden"
        style={{ background: gradientBg }}
      >
        {/* Project type badge */}
        {project.type === 'prototype' && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-[#00B294] text-white text-[9px] font-bold rounded-full uppercase tracking-wider">
            Prototype
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1 }}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg"
          >
            Open
          </motion.span>
        </div>

        {/* Three-dot menu */}
        <div ref={menuRef} className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-lg transition-all"
            title="Project options"
            aria-label="Project options"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 w-40 bg-surface-light border border-surface-lighter rounded-lg shadow-xl overflow-hidden z-20"
            >
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setRenaming(true); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface transition-colors"
              >
                <Pencil size={14} /> Rename
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDuplicate?.(project.id); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface transition-colors"
              >
                <Copy size={14} /> Duplicate
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(project.id); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Info area */}
      <div className="p-3">
        {renaming ? (
          <input
            ref={inputRef}
            value={nameValue}
            onChange={(e) => setNameValue(sanitizeName(e.target.value))}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') { setNameValue(project.name || 'Untitled'); setRenaming(false); } }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-sm font-semibold text-text outline-none border-b border-primary pb-0.5"
          />
        ) : (
          <h3 className="text-sm font-semibold text-text truncate">{project.name || 'Untitled'}</h3>
        )}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-text-muted">{formatDate(project.updatedAt)}</span>
          {paletteColors.length > 0 && (
            <div className="flex -space-x-1">
              {paletteColors.map((c, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border-2 border-surface-light"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
