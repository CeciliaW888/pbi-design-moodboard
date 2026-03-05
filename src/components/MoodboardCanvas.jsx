import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ImageCard from './ImageCard';
import VisualCard from './VisualCard';
import PlaceVisualMode from './PlaceVisualMode';
import CanvasToolbar from './CanvasToolbar';
import { Upload, Clipboard, Monitor, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;

// Toast system
const TOAST_TYPES = {
  info: { bg: 'bg-blue-500', icon: null },
  success: { bg: 'bg-green-500', icon: CheckCircle },
  error: { bg: 'bg-red-500', icon: AlertCircle },
  loading: { bg: 'bg-yellow-500', icon: Loader2 },
};

export default function MoodboardCanvas({
  screenshots,
  onAddScreenshots,
  onUpdateScreenshot,
  onRemoveScreenshot,
  onAnalyzeScreenshot,
  analyzing,
  selectedId,
  onSelect,
  visuals = [],
  onUpdateVisual,
  onRemoveVisual,
  onOpenGeminiModal,
  isPlacingVisual,
  onPlaceVisual,
  onCancelPlace,
  designSystem,
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toasts, setToasts] = useState([]);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- Toast helpers ---
  const addToast = useCallback((message, type = 'info', duration = 2500) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    if (type !== 'loading') {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }
    return id;
  }, []);
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // --- File processing (dead simple, no async) ---
  const processFiles = useCallback((files, source) => {
    console.log(`[MoodboardCanvas] processFiles: ${source}, ${files.length} file(s)`);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;
    onAddScreenshots(imageFiles);
  }, [onAddScreenshots]);

  // --- Zoom ---
  const handleWheel = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.002)));
  }, []);

  const zoomIn = useCallback(() => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP)), []);
  const zoomReset = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);
  const fitToScreen = useCallback(() => {
    const allItems = [...screenshots, ...visuals];
    if (!allItems.length || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const s of allItems) {
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      maxX = Math.max(maxX, s.x + s.width);
      maxY = Math.max(maxY, s.y + s.height);
    }
    const contentW = maxX - minX + 80;
    const contentH = maxY - minY + 80;
    const newZoom = Math.min(1.5, Math.min(rect.width / contentW, rect.height / contentH));
    setZoom(newZoom);
    setPan({
      x: (rect.width / 2) - ((minX + maxX) / 2) * newZoom,
      y: (rect.height / 2) - ((minY + maxY) / 2) * newZoom,
    });
  }, [screenshots, visuals]);

  // --- Pan (middle-click or space+drag) ---
  const handleMouseDown = useCallback((e) => {
    // Only pan on middle-click or if clicking the canvas background
    if (e.button === 1 || (e.button === 0 && e.target === canvasRef.current?.querySelector('.canvas-bg'))) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    }
    // Deselect when clicking background
    if (e.target === canvasRef.current?.querySelector('.canvas-bg')) {
      onSelect(null);
    }
  }, [pan, onSelect]);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning) return;
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // --- Drag & Drop ---
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = [...e.dataTransfer.files];
    if (files.length) processFiles(files, '📥 Dropped');
  }, [processFiles]);

  // --- Paste ---
  useEffect(() => {
    const handlePaste = (e) => {
      const items = [...(e.clipboardData?.items || [])];
      const imageItems = items.filter(i => i.type.startsWith('image/'));
      if (imageItems.length) {
        e.preventDefault();
        const files = imageItems.map(i => i.getAsFile()).filter(Boolean);
        if (files.length) processFiles(files, '📋 Pasted');
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFiles]);

  // --- File input ---
  const handleFileInput = useCallback((e) => {
    const files = [...e.target.files];
    if (files.length) processFiles(files, '📂 Selected');
    e.target.value = '';
  }, [processFiles]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
          e.preventDefault();
          const isScreenshot = screenshots.some(s => s.id === selectedId);
          if (isScreenshot) {
            onRemoveScreenshot(selectedId);
          } else {
            onRemoveVisual?.(selectedId);
          }
          onSelect(null);
        }
      }
      if ((e.key === '=' || e.key === '+') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); zoomIn(); }
      if (e.key === '-' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); zoomOut(); }
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); zoomReset(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedId, onRemoveScreenshot, onSelect, zoomIn, zoomOut, zoomReset]);

  const hasScreenshots = screenshots.length > 0;

  return (
    <div
      ref={canvasRef}
      className={`relative flex-1 overflow-hidden ${isPanning ? 'cursor-grabbing' : ''}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Toast notifications */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
            const Icon = config.icon;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`${config.bg} text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2`}
              >
                {Icon && <Icon size={14} className={toast.type === 'loading' ? 'animate-spin' : ''} />}
                {toast.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-primary/10 border-4 border-dashed border-primary flex items-center justify-center backdrop-blur-sm"
          >
            <div className="text-center">
              <Upload size={48} className="mx-auto mb-3 text-primary" />
              <p className="text-xl font-bold text-primary">Drop screenshots here!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas background with dot grid */}
      <div
        className="canvas-bg absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-surface-lighter) 1px, transparent 1px)',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Transformed canvas layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {screenshots.filter(ss => ss && ss.dataUrl && ss.id).map((ss) => (
          <ImageCard
            key={ss.id}
            screenshot={ss}
            isSelected={selectedId === ss.id}
            onSelect={() => onSelect(ss.id)}
            onUpdate={(updates) => onUpdateScreenshot(ss.id, updates)}
            onRemove={() => onRemoveScreenshot(ss.id)}
            onAnalyze={() => onAnalyzeScreenshot(ss)}
            analyzing={analyzing}
            zoom={zoom}
          />
        ))}
        {visuals.filter(v => v && v.id).map((v) => (
          <VisualCard
            key={v.id}
            visual={v}
            isSelected={selectedId === v.id}
            onSelect={() => onSelect(v.id)}
            onUpdate={(updates) => onUpdateVisual(v.id, updates)}
            onRemove={() => onRemoveVisual(v.id)}
            onRegenerate={() => onOpenGeminiModal?.()}
            designSystem={designSystem}
            zoom={zoom}
          />
        ))}
      </div>

      {/* Place visual overlay */}
      {isPlacingVisual && (
        <PlaceVisualMode
          pan={pan}
          zoom={zoom}
          onPlace={onPlaceVisual}
          onCancel={onCancelPlace}
        />
      )}

      {/* Canvas toolbar */}
      <CanvasToolbar
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={zoomReset}
        onFitToScreen={fitToScreen}
        onUpload={() => fileInputRef.current?.click()}
        screenshotCount={screenshots.length}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Empty state */}
      {!hasScreenshots && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center max-w-lg pointer-events-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Monitor size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-text">Design your Power BI theme</h2>
            <p className="text-sm text-text-muted mb-6">in minutes, not hours</p>
            <p className="text-text-muted mb-8 max-w-sm mx-auto">
              Drop screenshots of dashboards you love. Arrange them on the canvas,
              extract colors, and set fonts in the Design tab.
            </p>

            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Upload size={18} /> Upload Screenshots
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-text-muted mb-8">
              <Clipboard size={14} />
              <span>Or paste a screenshot <kbd className="px-1.5 py-0.5 bg-surface-lighter rounded text-xs font-mono">⌘V</kbd> / <kbd className="px-1.5 py-0.5 bg-surface-lighter rounded text-xs font-mono">Ctrl+V</kbd></span>
            </div>

            <div className="flex flex-wrap gap-3 justify-center text-sm text-text-muted">
              <span className="px-3 py-1.5 bg-yellow-light border border-yellow/30 rounded-full text-text font-medium">📸 Drop & arrange</span>
              <span className="px-3 py-1.5 bg-primary-light border border-primary/20 rounded-full text-text font-medium">🎨 Extract colors</span>
              <span className="px-3 py-1.5 bg-surface border border-surface-lighter rounded-full text-text font-medium">📐 Set typography</span>
              <span className="px-3 py-1.5 bg-surface border border-surface-lighter rounded-full text-text font-medium">📥 Export theme</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
