import { useState, useCallback } from 'react';
import { Download, Undo2, Redo2, Palette } from 'lucide-react';
import PrototypeCanvas from './PrototypeCanvas';
import VisualPalette from './VisualPalette';
import ThemePanel from './ThemePanel';
import StylePickerModal from './StylePickerModal';
import { generatePlaceholderSpec, generateTemplateSpec, VISUAL_SIZES, VISUAL_TEMPLATES } from '../lib/placeholderData';
import { exportFullPBIR } from '../lib/pbipExporter';

export default function PrototypeEditor({ state, onUpdate, selectedId, onSelect, onOpenGeminiModal, onLoadTheme, activeTheme }) {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [stylePickerVisual, setStylePickerVisual] = useState(null);
  // For sidebar-triggered style picker: { type, mode: 'add' }
  const [stylePickerNewType, setStylePickerNewType] = useState(null);

  const pageWidth = state.pageWidth || 1280;
  const pageHeight = state.pageHeight || 720;
  const gridEnabled = state.gridEnabled ?? false;
  const referenceImage = state.referenceImage || null;

  const designSystem = {
    name: state.name,
    colors: state.palette || [],
    fonts: state.fonts || { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 18, bodySize: 10 },
    background: state.background || '#ffffff',
    sentinels: state.sentinels || { good: '#107C10', neutral: '#F2C811', bad: '#D83B01' },
  };

  const pushUndo = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-19), { visuals: state.visuals, palette: state.palette, background: state.background, fonts: state.fonts }]);
    setRedoStack([]);
  }, [state.visuals, state.palette, state.background, state.fonts]);

  const handleUndo = () => {
    if (!undoStack.length) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, { visuals: state.visuals, palette: state.palette, background: state.background, fonts: state.fonts }]);
    setUndoStack(u => u.slice(0, -1));
    onUpdate(prev);
  };

  const handleRedo = () => {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, { visuals: state.visuals, palette: state.palette, background: state.background, fonts: state.fonts }]);
    setRedoStack(r => r.slice(0, -1));
    onUpdate(next);
  };

  const autoPosition = useCallback((vw, vh) => {
    const existing = state.visuals || [];
    const GAP = 20;
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 5; col++) {
        const x = GAP + col * (vw + GAP);
        const y = GAP + row * (vh + GAP);
        if (x + vw > pageWidth || y + vh > pageHeight) continue;
        const overlaps = existing.some(v =>
          x < v.x + v.width && x + vw > v.x &&
          y < v.y + v.height && y + vh > v.y
        );
        if (!overlaps) return { x, y };
      }
    }
    const last = existing[existing.length - 1];
    return {
      x: last ? Math.min(last.x + 30, pageWidth - vw) : 40,
      y: last ? Math.min(last.y + 30, pageHeight - vh) : 40,
    };
  }, [state.visuals, pageWidth, pageHeight]);

  const addVisualWithSpec = useCallback((spec, visualType, x, y) => {
    pushUndo();
    const size = VISUAL_SIZES[visualType] || VISUAL_SIZES.default;
    const pos = (x !== undefined && y !== undefined) ? { x, y } : autoPosition(size.w, size.h);
    const visual = {
      id: crypto.randomUUID(),
      spec,
      name: spec.title,
      status: 'ready',
      x: pos.x,
      y: pos.y,
      width: size.w,
      height: size.h,
      zIndex: Date.now(),
    };
    onUpdate({ visuals: [...(state.visuals || []), visual] });
  }, [state.visuals, pushUndo, onUpdate, autoPosition]);

  const handleAddVisual = useCallback((visualType, x, y) => {
    // Sidebar click (no coordinates) — open style picker if templates exist
    const templates = VISUAL_TEMPLATES[visualType];
    if (templates && templates.length >= 1 && x === undefined) {
      setStylePickerNewType(visualType);
      return;
    }
    // Drag-and-drop (has coordinates) — use default style directly
    const spec = generatePlaceholderSpec(visualType, designSystem);
    addVisualWithSpec(spec, visualType, x, y);
  }, [designSystem, addVisualWithSpec]);

  const handleAddTemplate = useCallback((visualType, templateId, x, y) => {
    const spec = generateTemplateSpec(visualType, templateId, designSystem);
    addVisualWithSpec(spec, visualType, x, y);
  }, [designSystem, addVisualWithSpec]);

  // Apply template to existing visual (double-click)
  const handleApplyTemplateToVisual = useCallback((visualId, visualType, templateId) => {
    pushUndo();
    const spec = generateTemplateSpec(visualType, templateId, designSystem);
    onUpdate({
      visuals: (state.visuals || []).map(v =>
        v.id === visualId ? { ...v, spec, name: spec.title } : v
      ),
    });
  }, [state.visuals, designSystem, pushUndo, onUpdate]);

  // Apply template for new visual from sidebar
  const handleApplyTemplateNew = useCallback((_id, visualType, templateId) => {
    const spec = generateTemplateSpec(visualType, templateId, designSystem);
    addVisualWithSpec(spec, visualType);
  }, [designSystem, addVisualWithSpec]);

  const handleUpdateVisual = useCallback((id, updates) => {
    if (updates.spec || updates.name) pushUndo();
    onUpdate({
      visuals: (state.visuals || []).map(v => v.id === id ? { ...v, ...updates } : v),
    });
  }, [state.visuals, pushUndo, onUpdate]);

  const handleRemoveVisual = useCallback((id) => {
    pushUndo();
    onUpdate({ visuals: (state.visuals || []).filter(v => v.id !== id) });
    if (selectedId === id) onSelect(null);
  }, [state.visuals, selectedId, pushUndo, onUpdate, onSelect]);

  const handleApplyTheme = useCallback((theme) => {
    pushUndo();
    onUpdate({
      palette: theme.colors,
      fonts: theme.fonts,
      background: theme.background,
      sentinels: theme.sentinels,
    });
  }, [pushUndo, onUpdate]);

  const handlePageSizeChange = useCallback((w, h) => {
    onUpdate({ pageWidth: w, pageHeight: h });
  }, [onUpdate]);

  const handleToggleGrid = useCallback(() => {
    onUpdate({ gridEnabled: !gridEnabled });
  }, [gridEnabled, onUpdate]);

  const handleUploadReference = useCallback((dataUrl) => {
    onUpdate({ referenceImage: { dataUrl, opacity: 30, visible: true } });
  }, [onUpdate]);

  const handleReferenceOpacity = useCallback((opacity) => {
    onUpdate({ referenceImage: { ...referenceImage, opacity } });
  }, [referenceImage, onUpdate]);

  const handleToggleReference = useCallback(() => {
    onUpdate({ referenceImage: { ...referenceImage, visible: !referenceImage?.visible } });
  }, [referenceImage, onUpdate]);

  const handleExport = async () => {
    try {
      const blob = await exportFullPBIR(
        state.visuals || [],
        designSystem,
        { pageWidth, pageHeight }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.name || 'prototype'}.pbir.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Build a fake visual object for the "add new" style picker
  const stylePickerNewVisual = stylePickerNewType ? {
    id: '__new__',
    spec: { visualType: stylePickerNewType },
  } : null;

  return (
    <main className="flex-1 h-full flex flex-col min-h-0 overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-surface-lighter bg-surface-light flex-shrink-0">
        <button
          onClick={handleUndo}
          disabled={!undoStack.length}
          className="p-1.5 text-text-muted hover:text-text rounded-lg transition-colors disabled:opacity-30"
          title="Undo"
          aria-label="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={handleRedo}
          disabled={!redoStack.length}
          className="p-1.5 text-text-muted hover:text-text rounded-lg transition-colors disabled:opacity-30"
          title="Redo"
          aria-label="Redo"
        >
          <Redo2 size={16} />
        </button>

        <div className="flex-1" />

        {activeTheme && (
          <span className="text-xs text-primary font-medium flex items-center gap-1">
            <Palette size={12} />
            {activeTheme.themeName || activeTheme.name}
          </span>
        )}

        <button
          onClick={onLoadTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-primary/30 text-primary text-xs font-medium rounded-lg hover:bg-primary/10 transition-colors"
        >
          <Palette size={14} />
          Load Theme
        </button>

        <span className="text-xs text-text-muted">
          {(state.visuals || []).length} visual{(state.visuals || []).length !== 1 ? 's' : ''}
        </span>

        <button
          onClick={handleExport}
          disabled={!(state.visuals || []).length}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-40"
        >
          <Download size={14} />
          Export PBIR
        </button>
      </div>

      {/* Main area */}
      <div className="flex-1 flex min-h-0">
        <VisualPalette
          designSystem={designSystem}
          onAddVisual={handleAddVisual}
          onAddTemplate={handleAddTemplate}
          onOpenAI={onOpenGeminiModal}
          themePanel={
            <ThemePanel
              designSystem={designSystem}
              onApplyTheme={handleApplyTheme}
            />
          }
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          onPageSizeChange={handlePageSizeChange}
          gridEnabled={gridEnabled}
          onToggleGrid={handleToggleGrid}
          referenceImage={referenceImage}
          onUploadReference={handleUploadReference}
          onReferenceOpacityChange={handleReferenceOpacity}
          onToggleReference={handleToggleReference}
        />

        <PrototypeCanvas
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          visuals={state.visuals || []}
          onUpdateVisual={handleUpdateVisual}
          onRemoveVisual={handleRemoveVisual}
          onAddVisual={handleAddVisual}
          onAddTemplate={handleAddTemplate}
          onOpenStylePicker={(v) => setStylePickerVisual(v)}
          selectedId={selectedId}
          onSelect={onSelect}
          designSystem={designSystem}
          gridEnabled={gridEnabled}
          referenceImage={referenceImage}
        />
      </div>

      {/* Style picker modal — double-click on existing visual */}
      {stylePickerVisual && (
        <StylePickerModal
          visual={stylePickerVisual}
          designSystem={designSystem}
          onApplyTemplate={handleApplyTemplateToVisual}
          onClose={() => setStylePickerVisual(null)}
        />
      )}

      {/* Style picker modal — sidebar click for new visual */}
      {stylePickerNewVisual && (
        <StylePickerModal
          visual={stylePickerNewVisual}
          designSystem={designSystem}
          onApplyTemplate={handleApplyTemplateNew}
          onClose={() => setStylePickerNewType(null)}
        />
      )}
    </main>
  );
}
