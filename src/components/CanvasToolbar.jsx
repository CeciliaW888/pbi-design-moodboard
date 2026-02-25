import { ZoomIn, ZoomOut, Maximize, RotateCcw, Plus } from 'lucide-react';

export default function CanvasToolbar({ zoom, onZoomIn, onZoomOut, onZoomReset, onFitToScreen, onUpload, screenshotCount }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-surface-light/90 backdrop-blur-xl border border-surface-lighter rounded-full px-2 py-1.5 shadow-lg">
      <ToolButton onClick={onUpload} title="Add screenshots">
        <Plus size={16} />
      </ToolButton>

      <div className="w-px h-5 bg-surface-lighter mx-1" />

      <ToolButton onClick={onZoomOut} title="Zoom out (⌘-)">
        <ZoomOut size={16} />
      </ToolButton>

      <span className="text-xs font-mono text-text-muted w-12 text-center select-none">
        {Math.round(zoom * 100)}%
      </span>

      <ToolButton onClick={onZoomIn} title="Zoom in (⌘+)">
        <ZoomIn size={16} />
      </ToolButton>

      <div className="w-px h-5 bg-surface-lighter mx-1" />

      <ToolButton onClick={onFitToScreen} title="Fit to screen" disabled={!screenshotCount}>
        <Maximize size={16} />
      </ToolButton>

      <ToolButton onClick={onZoomReset} title="Reset view (⌘0)">
        <RotateCcw size={16} />
      </ToolButton>

      {screenshotCount > 0 && (
        <>
          <div className="w-px h-5 bg-surface-lighter mx-1" />
          <span className="text-xs text-text-muted px-2">
            {screenshotCount} image{screenshotCount !== 1 ? 's' : ''}
          </span>
        </>
      )}
    </div>
  );
}

function ToolButton({ children, onClick, title, disabled }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="p-2 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
