import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import VisualCard from './VisualCard';
import { VISUAL_SIZES } from '../lib/placeholderData';
import DittoMascot from './DittoMascot';

export default function PrototypeCanvas({
  pageWidth = 1280,
  pageHeight = 720,
  visuals,
  onUpdateVisual,
  onRemoveVisual,
  onAddVisual,
  onAddTemplate,
  onOpenStylePicker,
  selectedId,
  onSelect,
  designSystem,
  gridEnabled,
  referenceImage,
}) {
  const [zoom, setZoom] = useState(0.6);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef(null);
  const pageRef = useRef(null);

  // Auto-fit zoom on mount to fill available space with padding
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const padding = 60;
    const fitZoom = Math.min(
      (el.clientWidth - padding) / pageWidth,
      (el.clientHeight - padding) / pageHeight,
      1
    );
    setZoom(Math.max(fitZoom, 0.3));
  }, [pageWidth, pageHeight]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.2));
  const handleZoomReset = () => {
    const el = containerRef.current;
    if (!el) return;
    const padding = 60;
    const fitZoom = Math.min(
      (el.clientWidth - padding) / pageWidth,
      (el.clientHeight - padding) / pageHeight,
      1
    );
    setZoom(Math.max(fitZoom, 0.3));
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      setZoom(z => Math.min(Math.max(z - e.deltaY * 0.002, 0.2), 2));
    }
    // Regular scroll does nothing — pan only via Alt+drag or middle-mouse drag
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e) => {
    if (e.target === e.currentTarget || e.target.dataset.workspace) {
      onSelect(null);
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      }
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isPanning) return;
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  useEffect(() => {
    if (!isPanning) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, handleMouseMove, handleMouseUp]);

  const snapToGrid = (val) => gridEnabled ? Math.round(val / 10) * 10 : val;

  const handleVisualUpdate = (id, updates) => {
    if (updates.x !== undefined) updates.x = Math.max(0, Math.min(snapToGrid(updates.x), pageWidth - 20));
    if (updates.y !== undefined) updates.y = Math.max(0, Math.min(snapToGrid(updates.y), pageHeight - 20));
    onUpdateVisual(id, updates);
  };

  const screenToPage = useCallback((clientX, clientY) => {
    const pageEl = pageRef.current;
    if (pageEl) {
      const rect = pageEl.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / zoom,
        y: (clientY - rect.top) / zoom,
      };
    }
    const container = containerRef.current;
    if (!container) return { x: 40, y: 40 };
    const cr = container.getBoundingClientRect();
    const pageCenterX = cr.left + cr.width / 2 + pan.x;
    const pageCenterY = cr.top + cr.height / 2 + pan.y;
    const pageLeft = pageCenterX - (pageWidth / 2) * zoom;
    const pageTop = pageCenterY - (pageHeight / 2) * zoom;
    return {
      x: (clientX - pageLeft) / zoom,
      y: (clientY - pageTop) / zoom,
    };
  }, [zoom, pan.x, pan.y, pageWidth, pageHeight]);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const visualType = e.dataTransfer.getData('visual-type');
    if (!visualType) return;

    const templateId = e.dataTransfer.getData('template-id');
    const pos = screenToPage(e.clientX, e.clientY);
    const size = VISUAL_SIZES[visualType] || VISUAL_SIZES.default;
    const vw = size.w;
    const vh = size.h;
    const x = snapToGrid(Math.max(0, Math.min(pos.x - vw / 2, pageWidth - vw)));
    const y = snapToGrid(Math.max(0, Math.min(pos.y - vh / 2, pageHeight - vh)));

    if (templateId && onAddTemplate) {
      onAddTemplate(visualType, templateId, x, y);
    } else {
      onAddVisual(visualType, x, y);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!containerRef.current?.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-surface dark:bg-surface"
      onMouseDown={handleMouseDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{ cursor: isPanning ? 'grabbing' : 'default' }}
    >
      {/* Drop indicator */}
      {dragOver && (
        <div className="absolute inset-0 z-40 pointer-events-none border-2 border-dashed border-primary/40 bg-primary/5 rounded-lg flex items-center justify-center">
          <span className="bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg">
            Drop to add visual
          </span>
        </div>
      )}

      {/* Page size label */}
      <div className="absolute top-3 left-3 z-10 text-[10px] text-text-muted/50 flex items-center gap-1.5">
        <span>{pageWidth} × {pageHeight}</span>
      </div>

      {/* Transformed canvas container */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          left: '50%',
          top: '50%',
          marginLeft: -(pageWidth / 2) * zoom,
          marginTop: -(pageHeight / 2) * zoom,
        }}
      >
        {/* Page rectangle */}
        <div
          ref={pageRef}
          data-workspace
          className="relative shadow-2xl"
          style={{
            width: pageWidth,
            height: pageHeight,
            background: designSystem?.background || '#ffffff',
            borderRadius: 4,
          }}
        >
          {/* Grid overlay */}
          {gridEnabled && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#999" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}

          {/* Reference image overlay */}
          {referenceImage?.dataUrl && referenceImage.visible && (
            <img
              src={referenceImage.dataUrl}
              alt="Reference"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{ opacity: (referenceImage.opacity ?? 30) / 100 }}
            />
          )}

          {/* Visuals */}
          {visuals.map(v => (
            <VisualCard
              key={v.id}
              visual={v}
              isSelected={selectedId === v.id}
              onSelect={() => onSelect(v.id)}
              onUpdate={(updates) => handleVisualUpdate(v.id, updates)}
              onRemove={() => onRemoveVisual(v.id)}
              onDoubleClick={() => onOpenStylePicker?.(v)}
              designSystem={designSystem}
              zoom={zoom}
              showChartSwitcher
            />
          ))}

          {/* Empty state hint */}
          {visuals.length === 0 && !dragOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <DittoMascot size={120} expression="wave" className="mx-auto mb-3" />
                <p className="text-sm text-text-muted font-medium">Click/Drag elements onto the canvas</p>
                <p className="text-xs text-text-muted/60 mt-1">Resize from the corners after placing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-0.5 bg-surface-light/90 backdrop-blur-xl border border-surface-lighter rounded-lg px-1 py-0.5 shadow-md">
        <button onClick={handleZoomOut} className="p-1.5 text-text-muted hover:text-text rounded transition-colors" title="Zoom out">
          <ZoomOut size={14} />
        </button>
        <span className="text-[10px] font-mono text-text-muted w-9 text-center select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={handleZoomIn} className="p-1.5 text-text-muted hover:text-text rounded transition-colors" title="Zoom in">
          <ZoomIn size={14} />
        </button>
        <button onClick={handleZoomReset} className="p-1.5 text-text-muted hover:text-text rounded transition-colors" title="Fit to screen">
          <Maximize size={14} />
        </button>
      </div>
    </div>
  );
}
