import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { loadState, saveState, saveProjectState, loadProjectState, setActiveProject, getActiveProject, getAllLocalProjects, deleteProjectState } from './lib/storage';
import { extractColors, analyzePalette } from './lib/colorExtractor';
import { auth, onAuthStateChanged, signInWithGoogle, signInEmail, signUpEmail, logOut, saveMoodboard, getUserMoodboards, getRecentMoodboards, deleteMoodboard, renameMoodboard, duplicateMoodboard } from './firebase';
import { TEMPLATES, createProjectFromTemplate, getTemplateById } from './lib/templates';
import MoodboardCanvas from './components/MoodboardCanvas';
import ColorPalette from './components/ColorPalette';
import DesignPanel from './components/DesignPanel';
import LivePreview from './components/LivePreview';
import ExportPanel from './components/ExportPanel';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomeDashboard from './components/HomeDashboard';
import GeminiPromptModal from './components/GeminiPromptModal';
import LandingPage from './components/LandingPage';
import ProjectCard from './components/ProjectCard';
import { Sparkles, Palette, Settings, Eye, Download, Wand2, X } from 'lucide-react';
import { useTheme } from './hooks/useTheme';

const DEFAULT_STATE = {
  screenshots: [],
  visuals: [],
  palette: [],
  fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 18, bodySize: 10 },
  background: '#ffffff',
  formatRules: [],
  sentinels: { good: '#107C10', neutral: '#F2C811', bad: '#D83B01' },
  name: 'My Dashboard Theme'
};

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
  // --- View & navigation state ---
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'editor' | 'templates' | 'projects'
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // --- Editor state ---
  const [state, setState] = useState(() => loadState() || { ...DEFAULT_STATE });
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [savedLibrary, setSavedLibrary] = useState([]);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isPlacingVisual, setIsPlacingVisual] = useState(false);
  const [pendingVisualSpec, setPendingVisualSpec] = useState(null);
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [showLanding, setShowLanding] = useState(
    () => !localStorage.getItem('pbi-moodboard-visited')
  );
  const { theme, toggleTheme } = useTheme();

  // --- Persist editor state ---
  useEffect(() => {
    try {
      saveState(state);
      if (currentProjectId) {
        saveProjectState(currentProjectId, state);
      }
    } catch (e) { console.warn('[App] saveState failed:', e); }
  }, [state, currentProjectId]);

  // --- Auth ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadLibrary(u.uid);
    });
    return unsub;
  }, []);

  async function loadLibrary(uid) {
    try {
      const boards = await getRecentMoodboards(uid, 20);
      setSavedLibrary(boards);
    } catch (e) {
      // Fallback to getUserMoodboards if ordering not supported
      try {
        const boards = await getUserMoodboards(uid);
        setSavedLibrary(boards);
      } catch (e2) { console.warn('Could not load library:', e2); }
    }
  }

  const update = useCallback((partial) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  // --- Navigation ---
  const handleNavigate = useCallback((view) => {
    setCurrentView(view);
  }, []);

  const handleGoHome = useCallback(() => {
    setCurrentView('home');
    setCurrentProjectId(null);
    setActiveProject(null);
  }, []);

  const handleOpenProject = useCallback((project) => {
    // Load project state into editor
    const projectState = {
      ...DEFAULT_STATE,
      ...project,
      // Strip Firestore metadata
      id: project.id,
    };
    setState(projectState);
    setCurrentProjectId(project.id);
    setActiveProject(project.id);
    setCurrentView('editor');
    setSelectedId(null);
  }, []);

  const handleNewProject = useCallback(() => {
    const newId = crypto.randomUUID();
    const newState = { ...DEFAULT_STATE, id: newId, name: 'Untitled Project', createdAt: Date.now(), updatedAt: Date.now() };
    setState(newState);
    setCurrentProjectId(newId);
    setActiveProject(newId);
    saveProjectState(newId, newState);
    setCurrentView('editor');
    setSelectedId(null);
  }, []);

  const handleUseTemplate = useCallback((templateId) => {
    const template = getTemplateById(templateId);
    if (!template) return;
    const project = createProjectFromTemplate(template);
    setState(project);
    setCurrentProjectId(project.id);
    setActiveProject(project.id);
    saveProjectState(project.id, project);
    setCurrentView('editor');
    setSelectedId(null);
  }, []);

  const handlePromptGenerate = useCallback((promptText) => {
    // Create a new project and open the Gemini modal with the prompt
    const newId = crypto.randomUUID();
    const newState = { ...DEFAULT_STATE, id: newId, name: promptText.slice(0, 40), createdAt: Date.now(), updatedAt: Date.now() };
    setState(newState);
    setCurrentProjectId(newId);
    setActiveProject(newId);
    saveProjectState(newId, newState);
    setCurrentView('editor');
    setSelectedId(null);
    // Open Gemini modal after view switch
    setTimeout(() => setShowGeminiModal(true), 100);
  }, []);

  // --- Project CRUD ---
  const handleRenameProject = useCallback(async (projectId, newName) => {
    if (user) {
      try {
        await renameMoodboard(user.uid, projectId, newName);
        await loadLibrary(user.uid);
      } catch (e) { console.warn('Rename failed:', e); }
    }
    // Also update local
    setSavedLibrary(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p));
  }, [user]);

  const handleDuplicateProject = useCallback(async (projectId) => {
    if (user) {
      try {
        await duplicateMoodboard(user.uid, projectId);
        await loadLibrary(user.uid);
      } catch (e) { console.warn('Duplicate failed:', e); }
    }
  }, [user]);

  const handleDeleteProject = useCallback(async (projectId) => {
    if (user) {
      try {
        await deleteMoodboard(user.uid, projectId);
        await loadLibrary(user.uid);
      } catch (e) { console.warn('Delete failed:', e); }
    }
    deleteProjectState(projectId);
    setSavedLibrary(prev => prev.filter(p => p.id !== projectId));
  }, [user]);

  // --- Screenshot callbacks (unchanged) ---
  const addScreenshots = useCallback((files) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
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

  // --- Visual callbacks ---
  const addVisual = useCallback((visual) => {
    setState(prev => ({ ...prev, visuals: [...prev.visuals, visual] }));
  }, []);

  const updateVisual = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      visuals: prev.visuals.map(v => v.id === id ? { ...v, ...updates } : v),
    }));
  }, []);

  const removeVisual = useCallback((id) => {
    setState(prev => ({
      ...prev,
      visuals: prev.visuals.filter(v => v.id !== id),
    }));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  // --- Gemini modal handlers ---
  const handleOpenGeminiModal = useCallback(() => {
    setShowGeminiModal(true);
  }, []);

  const handleGeminiGenerate = useCallback((spec, description) => {
    setPendingVisualSpec({ spec, description });
    setShowGeminiModal(false);
    setIsPlacingVisual(true);
  }, []);

  const handlePlaceVisual = useCallback((canvasX, canvasY) => {
    if (!pendingVisualSpec) return;
    const visual = {
      id: crypto.randomUUID(),
      spec: pendingVisualSpec.spec,
      description: pendingVisualSpec.description,
      name: pendingVisualSpec.spec.title || pendingVisualSpec.description,
      status: 'ready',
      x: canvasX,
      y: canvasY,
      width: 400,
      height: 280,
      zIndex: Date.now(),
    };
    addVisual(visual);
    setIsPlacingVisual(false);
    setPendingVisualSpec(null);
  }, [pendingVisualSpec, addVisual]);

  const handleCancelPlace = useCallback(() => {
    setIsPlacingVisual(false);
    setPendingVisualSpec(null);
  }, []);

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
      const toSave = {
        ...state,
        screenshots: state.screenshots.map(s => ({ ...s, dataUrl: undefined })),
        id: currentProjectId || state.id,
      };
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

  // --- Landing page ---
  if (showLanding) {
    return (
      <LandingPage onEnterApp={() => {
        localStorage.setItem('pbi-moodboard-visited', 'true');
        setShowLanding(false);
      }} />
    );
  }

  // --- Templates view ---
  const renderTemplatesView = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-text mb-2">Templates</h1>
        <p className="text-text-muted mb-8">Start with a curated design system</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map(template => (
            <ProjectCard
              key={template.id}
              project={template}
              onOpen={() => handleUseTemplate(template.id)}
              onRename={() => {}}
              onDuplicate={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // --- All Projects view ---
  const renderProjectsView = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text">My Projects</h1>
            <p className="text-text-muted mt-1">{savedLibrary.length} project{savedLibrary.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={handleNewProject}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            New Project
          </button>
        </div>
        {savedLibrary.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedLibrary.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={handleOpenProject}
                onRename={handleRenameProject}
                onDuplicate={handleDuplicateProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-light border border-surface-lighter rounded-xl">
            <p className="text-sm font-medium text-text-muted">No projects yet</p>
            <p className="text-xs text-text-muted/70 mt-1">Create your first project to get started</p>
          </div>
        )}
      </div>
    </div>
  );

  // --- Editor view ---
  const renderEditorView = () => (
    <>
      <main className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0">
        <MoodboardCanvas
          screenshots={state.screenshots}
          onAddScreenshots={addScreenshots}
          onUpdateScreenshot={updateScreenshot}
          onRemoveScreenshot={removeScreenshot}
          onAnalyzeScreenshot={analyzeScreenshot}
          analyzing={analyzing}
          selectedId={selectedId}
          onSelect={setSelectedId}
          visuals={state.visuals}
          onUpdateVisual={updateVisual}
          onRemoveVisual={removeVisual}
          onOpenGeminiModal={handleOpenGeminiModal}
          isPlacingVisual={isPlacingVisual}
          onPlaceVisual={handlePlaceVisual}
          onCancelPlace={handleCancelPlace}
          designSystem={designSystem}
        />

        <div className="w-full lg:w-[400px] lg:min-w-[400px] border-l border-surface-lighter bg-surface-light flex flex-col">
          <div className="flex border-b border-surface-lighter">
            {[
              { id: 'palette', label: 'Palette', Icon: Palette, badge: state.palette.length || null },
              { id: 'design',  label: 'Design',  Icon: Settings },
              { id: 'preview', label: 'Preview', Icon: Eye },
              { id: 'ai',      label: 'AI Visuals', Icon: Wand2, badge: state.visuals.length || null },
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
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <button
                  onClick={handleOpenGeminiModal}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                  <Wand2 size={16} /> Generate Visual
                </button>
                {!geminiApiKey && (
                  <p className="text-xs text-text-muted text-center">Set your Gemini API key in Settings (gear icon) first.</p>
                )}
                {state.visuals.length === 0 ? (
                  <div className="text-center py-8 text-text-muted">
                    <Wand2 size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No AI visuals yet</p>
                    <p className="text-xs mt-1">Describe a chart and AI will generate it using your design system palette.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {state.visuals.map((v) => (
                      <div
                        key={v.id}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedId === v.id
                            ? 'border-primary bg-primary/5'
                            : 'border-surface-lighter bg-surface hover:border-primary/30'
                        }`}
                        onClick={() => setSelectedId(v.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text truncate">{v.name || v.description}</p>
                            <p className="text-xs text-text-muted capitalize">{v.spec?.visualType || 'chart'}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenGeminiModal(); }}
                              className="p-1.5 text-text-muted hover:text-primary rounded transition-colors"
                              title="Regenerate"
                            >
                              <Wand2 size={13} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeVisual(v.id); }}
                              className="p-1.5 text-text-muted hover:text-red-400 rounded transition-colors"
                              title="Delete"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'export' && (
              <ExportPanel designSystem={designSystem} visuals={state.visuals} />
            )}
          </div>

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
    </>
  );

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
        geminiApiKey={geminiApiKey}
        onGeminiApiKeyChange={setGeminiApiKey}
        currentView={currentView}
        onGoHome={handleGoHome}
        onToggleSidebar={() => setSidebarCollapsed(c => !c)}
      />

      <div className="flex-1 flex min-h-0">
        {/* Sidebar — shown on non-editor views */}
        {currentView !== 'editor' && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(c => !c)}
            currentView={currentView}
            onNavigate={handleNavigate}
            user={user}
          />
        )}

        {/* Main content area */}
        {currentView === 'home' && (
          <HomeDashboard
            user={user}
            projects={savedLibrary}
            onOpenProject={handleOpenProject}
            onNewProject={handleNewProject}
            onViewAll={handleNavigate}
            onPromptGenerate={handlePromptGenerate}
            onRenameProject={handleRenameProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onUseTemplate={handleUseTemplate}
          />
        )}
        {currentView === 'editor' && renderEditorView()}
        {currentView === 'templates' && renderTemplatesView()}
        {currentView === 'projects' && renderProjectsView()}
      </div>

      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        {showGeminiModal && (
          <GeminiPromptModal
            onClose={() => setShowGeminiModal(false)}
            onGenerate={handleGeminiGenerate}
            designSystem={designSystem}
            apiKey={geminiApiKey}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function deduplicateColors(colors) {
  const seen = new Set();
  return colors.filter(c => {
    const key = `${Math.round(c.hsl.h / 15)}-${Math.round(c.hsl.s / 15)}-${Math.round(c.hsl.l / 15)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
