import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { loadState, saveState } from './lib/storage';
import { extractColors, analyzePalette } from './lib/colorExtractor';
import { auth, onAuthStateChanged, signInWithGoogle, signInEmail, signUpEmail, logOut, saveMoodboard, getUserMoodboards } from './firebase';
import MoodboardCanvas from './components/MoodboardCanvas';
import ColorPalette from './components/ColorPalette';
import DesignPanel from './components/DesignPanel';
import LivePreview from './components/LivePreview';
import ExportPanel from './components/ExportPanel';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import { Sparkles, Palette, Settings, Eye, Download } from 'lucide-react';
import { useTheme } from './hooks/useTheme';

const DEFAULT_STATE = {
  screenshots: [],
  palette: [],
  fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 18, bodySize: 10 },
  background: '#ffffff',
  formatRules: [],
  sentinels: { good: '#107C10', neutral: '#F2C811', bad: '#D83B01' },
  name: 'My Dashboard Theme'
};

// Arrange new images in a nice grid starting position
function computePosition(existingCount) {
  const CARD_W = 380;
  const CARD_H = 260;
  const GAP = 30;
  const COLS = 3;
  const col = existingCount % COLS;
  const row = Math.floor(existingCount / COLS);
  return {
    x: 40 + col * (CARD_W + GAP),
    y: 40 + row * (CARD_H + GAP),
    width: CARD_W,
    height: CARD_H,
  };
}

export default function App() {
  const [state, setState] = useState(() => loadState() || { ...DEFAULT_STATE });
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [savedLibrary, setSavedLibrary] = useState([]);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    try { saveState(state); } catch (e) { console.warn('[App] saveState failed:', e); }
  }, [state]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadLibrary(u.uid);
    });
    return unsub;
  }, []);

  async function loadLibrary(uid) {
    try {
      const boards = await getUserMoodboards(uid);
      setSavedLibrary(boards);
    } catch (e) { console.warn('Could not load library:', e); }
  }

  const update = useCallback((partial) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  // DEAD SIMPLE: no async, no promises, no dimension calc. Just read → add to state.
  const addScreenshots = useCallback((files) => {
    console.log('[App] addScreenshots called with', files.length, 'files');
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(`[App] File read done: ${file.name}`);
        setState(prev => {
          const pos = computePosition(prev.screenshots.length);
          return {
            ...prev,
            screenshots: [...prev.screenshots, {
              id: crypto.randomUUID(),
              dataUrl: e.target.result,
              name: file.name,
              addedAt: Date.now(),
              x: pos.x,
              y: pos.y,
              width: pos.width,
              height: pos.height,
              zIndex: Date.now(),
            }]
          };
        });
      };
      reader.onerror = () => console.error('[App] Failed to read:', file.name);
      reader.readAsDataURL(file);
    }
  }, []);

  const updateScreenshot = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      screenshots: prev.screenshots.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const analyzeScreenshot = useCallback(async (screenshot) => {
    setAnalyzing(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = screenshot.dataUrl;
      });
      const colors = extractColors(img);
      setState(prev => ({
        ...prev,
        palette: deduplicateColors([...prev.palette, ...colors])
      }));
    } catch (e) {
      console.error('[App] analyzeScreenshot failed:', e);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const removeScreenshot = useCallback((id) => {
    setState(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter(s => s.id !== id)
    }));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const removeColor = useCallback((hex) => {
    setState(prev => ({
      ...prev,
      palette: prev.palette.filter(c => c.hex !== hex)
    }));
  }, []);

  const addColorManually = useCallback((hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
      else if (max === gn) h = ((bn - rn) / d + 2) / 6;
      else h = ((rn - gn) / d + 4) / 6;
    }
    const newColor = {
      hex,
      rgb: { r, g, b },
      hsl: { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
    };
    setState(prev => ({
      ...prev,
      palette: deduplicateColors([...prev.palette, newColor])
    }));
  }, []);

  const handleSaveToLibrary = async () => {
    if (!user) { setShowAuth(true); return; }
    try {
      const toSave = { ...state, screenshots: state.screenshots.map(s => ({ ...s, dataUrl: undefined })) };
      await saveMoodboard(user.uid, toSave);
      await loadLibrary(user.uid);
    } catch (e) { console.error('Save failed:', e); }
  };

  const designSystem = {
    name: state.name,
    colors: state.palette,
    fonts: state.fonts,
    background: state.background,
    formatRules: state.formatRules,
    sentinels: state.sentinels
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        user={user}
        onSignIn={() => setShowAuth(true)}
        onSignOut={logOut}
        themeName={state.name}
        onNameChange={(name) => update({ name })}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0">
        {/* Left: Moodboard Canvas */}
        <MoodboardCanvas
          screenshots={state.screenshots}
          onAddScreenshots={addScreenshots}
          onUpdateScreenshot={updateScreenshot}
          onRemoveScreenshot={removeScreenshot}
          onAnalyzeScreenshot={analyzeScreenshot}
          analyzing={analyzing}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        {/* Right: Panel */}
        <div className="w-full lg:w-[400px] lg:min-w-[400px] border-l border-surface-lighter bg-surface-light flex flex-col">
          <div className="flex border-b border-surface-lighter">
            {[
              { id: 'palette', label: 'Palette', Icon: Palette, badge: state.palette.length || null },
              { id: 'design',  label: 'Design',  Icon: Settings },
              { id: 'preview', label: 'Preview', Icon: Eye },
              { id: 'export',  label: 'Export',  Icon: Download },
            ].map(({ id, label, Icon, badge }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 py-3 text-xs font-medium transition-colors flex flex-col items-center gap-0.5 ${
                  activeTab === id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <div className="relative">
                  <Icon size={15} />
                  {badge != null && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {badge}
                    </span>
                  )}
                </div>
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'palette' && (
              <ColorPalette
                colors={state.palette}
                onRemove={removeColor}
                onAdd={addColorManually}
                analysis={analyzePalette(state.palette)}
              />
            )}
            {activeTab === 'design' && (
              <DesignPanel
                fonts={state.fonts}
                background={state.background}
                formatRules={state.formatRules}
                sentinels={state.sentinels}
                onUpdate={update}
              />
            )}
            {activeTab === 'preview' && (
              <LivePreview designSystem={designSystem} />
            )}
            {activeTab === 'export' && (
              <ExportPanel designSystem={designSystem} />
            )}
          </div>

          {/* Save to Library CTA */}
          <div className="p-4 border-t border-surface-lighter">
            <button
              onClick={handleSaveToLibrary}
              className="w-full py-3 bg-yellow hover:bg-yellow/90 text-[#7a6200] font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(242,200,17,0.4)] hover:shadow-[0_16px_48px_rgba(242,200,17,0.5)] hover:-translate-y-0.5"
            >
              <Sparkles size={18} />
              {user ? 'Save to Library' : 'Save to Library — Sign In'}
            </button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </AnimatePresence>
    </div>
  );
}

// readFileAsDataUrl and getImageDimensions removed - using inline FileReader now

function deduplicateColors(colors) {
  const seen = new Set();
  return colors.filter(c => {
    const key = `${Math.round(c.hsl.h / 15)}-${Math.round(c.hsl.s / 15)}-${Math.round(c.hsl.l / 15)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
