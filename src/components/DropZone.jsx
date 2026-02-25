import { useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Clipboard, Monitor, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Toast notification types
const TOAST_TYPES = {
  info: { bg: 'bg-blue-500', icon: null },
  success: { bg: 'bg-green-500', icon: CheckCircle },
  error: { bg: 'bg-red-500', icon: AlertCircle },
  loading: { bg: 'bg-yellow-500', icon: Loader2 },
};

export default function DropZone({ onDrop, children, hasScreenshots }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

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

  const processFiles = useCallback((files, source) => {
    console.log(`[DropZone] ${source}: ${files.length} file(s)`);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;
    setIsUploading(false);
    onDrop(imageFiles);
  }, [onDrop]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    console.log('[DropZone] Drop event fired');
    const files = [...e.dataTransfer.files];
    if (files.length) processFiles(files, '📥 Drag & drop');
  }, [processFiles]);

  const handleFileInput = useCallback((e) => {
    console.log('[DropZone] File input changed');
    const files = [...e.target.files];
    if (files.length) processFiles(files, '📂 File picker');
    e.target.value = '';
  }, [processFiles]);

  // Paste handler
  useEffect(() => {
    const handlePaste = (e) => {
      console.log('[DropZone] Paste event fired');
      const items = [...(e.clipboardData?.items || [])];
      const imageItems = items.filter(i => i.type.startsWith('image/'));
      if (imageItems.length) {
        e.preventDefault();
        const files = imageItems.map(i => i.getAsFile()).filter(Boolean);
        if (files.length) processFiles(files, '📋 Paste');
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processFiles]);

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className="relative flex-1 flex flex-col min-h-0 overflow-y-auto"
    >
      {/* Toast notifications */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
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
            className="absolute inset-0 z-50 bg-primary/10 border-4 border-dashed border-primary rounded-2xl flex items-center justify-center backdrop-blur-sm"
          >
            <div className="text-center">
              <Upload size={48} className="mx-auto mb-3 text-primary" />
              <p className="text-xl font-bold text-primary">Drop here!</p>
              <p className="text-sm text-primary/70">Release to add screenshots</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload bar - only when screenshots exist (acts as "add more") */}
      {hasScreenshots && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`mx-4 mt-4 p-3 border-2 border-dashed border-surface-lighter rounded-xl cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-3 ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="text-primary animate-spin" />
              <span className="text-sm text-primary font-medium">Processing...</span>
            </>
          ) : (
            <>
              <Upload size={16} className="text-text-muted" />
              <span className="text-sm text-text-muted">
                <strong className="text-text">Drop, paste (⌘V), or click</strong> to add more
              </span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* Content area */}
      {children}

      {/* Empty state - single clear upload area */}
      {!hasScreenshots && (
        <EmptyCanvas
          onClickUpload={() => fileInputRef.current?.click()}
          isUploading={isUploading}
        />
      )}

      {/* Hidden file input for empty state */}
      {!hasScreenshots && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      )}
    </div>
  );
}

function EmptyCanvas({ onClickUpload, isUploading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex items-center justify-center p-12"
      style={{
        backgroundImage: 'radial-gradient(circle, var(--color-surface-lighter) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Monitor size={40} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-text">Design your Power BI theme</h2>
        <p className="text-sm text-text-muted mb-6">in minutes, not hours</p>
        <p className="text-text-muted mb-8 max-w-sm mx-auto">
          Drop screenshots of dashboards you love. We'll extract colors, detect patterns,
          and help you build a complete design system.
        </p>

        <button
          onClick={onClickUpload}
          disabled={isUploading}
          className="mx-auto mb-6 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload size={18} />
              Upload Screenshots
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-sm text-text-muted mb-8">
          <Clipboard size={14} />
          <span>Or paste a screenshot now! <kbd className="px-1.5 py-0.5 bg-surface-lighter rounded text-xs font-mono">⌘V</kbd></span>
        </div>

        <div className="flex flex-wrap gap-3 justify-center text-sm text-text-muted">
          <span className="px-3 py-1.5 bg-yellow-light border border-yellow/30 rounded-full text-text font-medium">📸 Drop screenshots</span>
          <span className="px-3 py-1.5 bg-primary-light border border-primary/20 rounded-full text-text font-medium">🎨 Extract colors</span>
          <span className="px-3 py-1.5 bg-surface border border-surface-lighter rounded-full text-text font-medium">📐 Set typography</span>
          <span className="px-3 py-1.5 bg-surface border border-surface-lighter rounded-full text-text font-medium">📥 Export theme</span>
        </div>
      </div>
    </motion.div>
  );
}
