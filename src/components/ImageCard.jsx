import { useState, useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { Wand2, X, Loader2, Move, Maximize2 } from 'lucide-react';

export default function ImageCard({
  screenshot,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  onAnalyze,
  analyzing,
  zoom,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (e) => {
    e.stopPropagation();
    setIsAnalyzing(true);
    try {
      await onAnalyze();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showControls = isSelected || isHovered;

  // Defensive defaults for position/size
  const x = Number.isFinite(screenshot.x) ? screenshot.x : 100;
  const y = Number.isFinite(screenshot.y) ? screenshot.y : 100;
  const width = Number.isFinite(screenshot.width) && screenshot.width > 0 ? screenshot.width : 300;
  const height = Number.isFinite(screenshot.height) && screenshot.height > 0 ? screenshot.height : 200;

  return (
    <Rnd
      position={{ x, y }}
      size={{ width, height }}
      onDragStart={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDragStop={(e, d) => {
        onUpdate({ x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        onUpdate({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          x: position.x,
          y: position.y,
        });
      }}
      scale={zoom}
      minWidth={120}
      minHeight={80}
      lockAspectRatio={true}
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
        bottomLeft: { width: 20, height: 20, bottom: -4, left: -4, cursor: 'nesw-resize' },
        topRight: { width: 20, height: 20, top: -4, right: -4, cursor: 'nesw-resize' },
        topLeft: { width: 20, height: 20, top: -4, left: -4, cursor: 'nwse-resize' },
      }}
      resizeHandleComponent={isSelected ? {
        bottomRight: <ResizeHandle />,
        bottomLeft: <ResizeHandle />,
        topRight: <ResizeHandle />,
        topLeft: <ResizeHandle />,
      } : {}}
    >
      <div
        className="w-full h-full rounded-xl overflow-hidden bg-surface-lighter relative cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
      >
        {/* Image */}
        <img
          src={screenshot.dataUrl}
          alt={screenshot.name}
          className="w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />

        {/* Analyzing overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm rounded-xl">
            <div className="text-center">
              <Loader2 size={28} className="mx-auto mb-2 text-white animate-spin" />
              <p className="text-white text-xs font-medium">Extracting colors...</p>
            </div>
          </div>
        )}

        {/* Hover/Selected toolbar */}
        {showControls && !isAnalyzing && (
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="p-1.5 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-colors disabled:opacity-50"
              title="Extract colors"
            >
              {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
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

        {/* Name label */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6 rounded-b-xl">
            <p className="text-white text-xs truncate">{screenshot.name}</p>
          </div>
        )}
      </div>
    </Rnd>
  );
}

function ResizeHandle() {
  return (
    <div className="w-3 h-3 bg-primary border-2 border-white rounded-sm shadow-md" />
  );
}
