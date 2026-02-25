import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, X, Loader2 } from 'lucide-react';

export default function ScreenshotGrid({ screenshots, onAnalyze, onRemove, analyzing }) {
  const [analyzingId, setAnalyzingId] = useState(null);

  const handleAnalyze = async (ss) => {
    setAnalyzingId(ss.id);
    try {
      await onAnalyze(ss);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-2">
        📸 Screenshots ({screenshots.length})
      </h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
        {screenshots.map((ss, i) => (
          <motion.div
            key={ss.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group relative"
          >
            <div className="relative rounded-xl overflow-hidden bg-surface-lighter shadow-lg">
              <img
                src={ss.dataUrl}
                alt={ss.name}
                className="w-full object-cover"
                loading="lazy"
              />
              {/* Analyzing overlay */}
              {analyzingId === ss.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <Loader2 size={32} className="mx-auto mb-2 text-white animate-spin" />
                    <p className="text-white text-sm font-medium">Extracting colors...</p>
                  </div>
                </div>
              )}
              {/* Hover overlay */}
              {analyzingId !== ss.id && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleAnalyze(ss)}
                    disabled={analyzing}
                    className="px-3 py-2 bg-primary text-white text-xs font-medium rounded-lg flex items-center gap-1.5 hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                    Extract Colors
                  </button>
                  <button
                    onClick={() => onRemove(ss.id)}
                    className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-text-muted mt-2 truncate">{ss.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
