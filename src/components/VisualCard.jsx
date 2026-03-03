import { useState } from 'react';
import { Rnd } from 'react-rnd';
import { Wand2, Pencil, X, Loader2 } from 'lucide-react';
import PBIVisualRenderer from './PBIVisualRenderer';

export default function VisualCard({
  visual,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  onRegenerate,
  designSystem,
  zoom,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(visual.name || '');

  const showControls = (isSelected || isHovered) && visual.status !== 'generating';

  const x = Number.isFinite(visual.x) ? visual.x : 100;
  const y = Number.isFinite(visual.y) ? visual.y : 100;
  const width  = Number.isFinite(visual.width)  && visual.width  > 0 ? visual.width  : 400;
  const height = Number.isFinite(visual.height) && visual.height > 0 ? visual.height : 280;

  const handleNameSubmit = (e) => {
    e.preventDefault();
    onUpdate({ name: nameInput });
    setEditingName(false);
  };

  return (
    <Rnd
      position={{ x, y }}
      size={{ width, height }}
      onDragStart={(e) => { e.stopPropagation(); onSelect(); }}
      onDragStop={(e, d) => onUpdate({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, position) => {
        onUpdate({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          x: position.x,
          y: position.y,
        });
      }}
      scale={zoom}
      minWidth={160}
      minHeight={120}
      lockAspectRatio={false}
      bounds={false}
      enableResizing={isSelected}
      className={`group ${isSelected ? 'z-20' : 'z-10'}`}
      style={{
        outline: isSelected ? '3px solid var(--color-primary)' : 'none',
        borderRadius: '12px',
        boxShadow: isSelected
          ? '0 8px 32px rgba(0,120,212,0.3), 0 0 0 1px rgba(0,120,212,0.2)'
          : '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.2s ease',
      }}
      resizeHandleStyles={{
        bottomRight: { width: 20, height: 20, bottom: -4, right: -4, cursor: 'nwse-resize' },
        bottomLeft:  { width: 20, height: 20, bottom: -4, left:  -4, cursor: 'nesw-resize' },
        topRight:    { width: 20, height: 20, top:    -4, right: -4, cursor: 'nesw-resize' },
        topLeft:     { width: 20, height: 20, top:    -4, left:  -4, cursor: 'nwse-resize' },
      }}
      resizeHandleComponent={isSelected ? {
        bottomRight: <ResizeHandle />,
        bottomLeft:  <ResizeHandle />,
        topRight:    <ResizeHandle />,
        topLeft:     <ResizeHandle />,
      } : {}}
    >
      <div
        className="w-full h-full rounded-xl overflow-hidden relative cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        {/* Visual content */}
        <PBIVisualRenderer
          spec={visual.spec}
          designSystem={designSystem}
          width={width}
          height={height}
        />

        {/* Generating overlay */}
        {visual.status === 'generating' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm rounded-xl">
            <div className="text-center">
              <Loader2 size={28} className="mx-auto mb-2 text-white animate-spin" />
              <p className="text-white text-xs font-medium">Generating visual…</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {visual.status === 'error' && (
          <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center rounded-xl p-3">
            <div className="text-center">
              <p className="text-white text-xs font-medium mb-1">Generation failed</p>
              <p className="text-red-200 text-[10px]">{visual.errorMsg || 'Unknown error'}</p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        {showControls && (
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
              className="p-1.5 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-colors"
              title="Regenerate visual"
            >
              <Wand2 size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setEditingName(true); setNameInput(visual.name || ''); }}
              className="p-1.5 bg-surface-light text-text rounded-lg shadow-md hover:bg-surface transition-colors"
              title="Edit label"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1.5 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors"
              title="Remove"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Inline name editor */}
        {editingName && (
          <div
            className="absolute inset-x-0 bottom-0 p-2 bg-black/60 rounded-b-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleNameSubmit} className="flex gap-1">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameSubmit}
                className="flex-1 bg-white/90 text-gray-900 text-xs rounded px-2 py-1 outline-none"
                placeholder="Visual label…"
              />
            </form>
          </div>
        )}

        {/* Name label (when not editing) */}
        {showControls && !editingName && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 pt-6 rounded-b-xl pointer-events-none">
            <p className="text-white text-xs truncate">{visual.name || visual.spec?.title || 'Visual'}</p>
          </div>
        )}

        {/* Pending badge */}
        {visual.status === 'pending' && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            PENDING
          </div>
        )}
      </div>
    </Rnd>
  );
}

function ResizeHandle() {
  return <div className="w-3 h-3 bg-primary border-2 border-white rounded-sm shadow-md" />;
}
