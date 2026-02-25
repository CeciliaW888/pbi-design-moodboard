import { motion } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function ColorPalette({ colors, onRemove, analysis }) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-text-muted mb-1 flex items-center gap-2">
        🎨 Extracted Palette ({colors.length} colors)
      </h3>
      {analysis?.suggestion && (
        <p className="text-xs text-primary mb-3">{analysis.suggestion}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {colors.map((color, i) => (
          <ColorSwatch key={color.hex + i} color={color} onRemove={() => onRemove(color.hex)} />
        ))}
      </div>
    </div>
  );
}

function ColorSwatch({ color, onRemove }) {
  const [copied, setCopied] = useState(false);

  const copyHex = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="group relative"
    >
      <div
        className="w-16 h-16 rounded-xl shadow-md cursor-pointer border-2 border-transparent hover:border-white/30 transition-all"
        style={{ backgroundColor: color.hex }}
        onClick={copyHex}
        title={`${color.hex}\nClick to copy`}
      />
      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
        >
          <X size={10} />
        </button>
      </div>
      <div className="text-center mt-1">
        <span className="text-[10px] text-text-muted font-mono">
          {copied ? <Check size={10} className="inline text-green-400" /> : color.hex}
        </span>
      </div>
    </motion.div>
  );
}
