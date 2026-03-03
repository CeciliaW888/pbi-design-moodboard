export default function PlaceVisualMode({ pan, zoom, onPlace, onCancel }) {
  const handleClick = (e) => {
    // Convert mouse coords to canvas coords
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const canvasX = (mouseX - pan.x) / zoom;
    const canvasY = (mouseY - pan.y) / zoom;
    onPlace(canvasX, canvasY);
  };

  const handleKey = (e) => {
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div
      className="absolute inset-0 z-40"
      style={{ cursor: 'crosshair' }}
      onClick={handleClick}
      onKeyDown={handleKey}
      tabIndex={0}
    >
      {/* Floating hint */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <span>Click anywhere to place a visual</span>
          <span className="text-white/70 text-xs ml-1">— Esc to cancel</span>
        </div>
      </div>
    </div>
  );
}
