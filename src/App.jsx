import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { loadState, saveState, saveProjectState, setActiveProject, clearState } from './lib/storage';
import { analyzePalette } from './lib/colorExtractor';
import {
  auth, onAuthStateChanged, logOut,
  getWorkspaceProjects,
} from './firebase';
import { useRealtimeProject } from './hooks/useRealtimeProject';
import { usePresence } from './hooks/usePresence';
import { useDebouncedSync } from './hooks/useDebouncedSync';
import { useProjectManager, DEFAULT_STATE } from './hooks/useProjectManager';
import { useEditorState } from './hooks/useEditorState';
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
import PrototypeEditor from './components/PrototypeEditor';
import TemplateGallery from './components/TemplateGallery';
import SaveThemeModal from './components/SaveThemeModal';
import LoadThemeModal from './components/LoadThemeModal';
import { Sparkles, Palette, Settings, Eye, Download, X, Bookmark } from 'lucide-react';
import { useTheme } from './hooks/useTheme';

export default function App() {
  // --- View & navigation state ---
  const [currentView, setCurrentView] = useState('home');
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // --- Editor state ---
  const [state, setState] = useState(() => loadState() || { ...DEFAULT_STATE });
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [showSaveTheme, setShowSaveTheme] = useState(false);
  const [showLoadTheme, setShowLoadTheme] = useState(false);
  const [activeTheme, setActiveTheme] = useState(null);
  const [showLanding, setShowLanding] = useState(
    () => !localStorage.getItem('pbi-moodboard-visited')
  );
  const { theme, toggleTheme } = useTheme();

  // --- Custom hooks ---
  const {
    selectedId, setSelectedId, analyzing, isPlacingVisual,
    update, addScreenshots, updateScreenshot, analyzeScreenshot, removeScreenshot,
    addVisual, updateVisual, removeVisual,
    handleGeminiGenerate: onGeminiGenerate, handlePlaceVisual, handleCancelPlace,
    removeColor, addColorManually,
    activePalette, activePaletteLabel, designSystem,
  } = useEditorState(state, setState);

  const {
    workspaces, activeWorkspaceId, setActiveWorkspaceId,
    savedLibrary, setSavedLibrary,
    initWorkspaces, clearWorkspaceState,
    handleOpenProject, handleNewProject, handleGoToMoodboard, handleNewPrototype,
    handleUseCommunityTemplate, handlePromptGenerate,
    handleCreateWorkspace, handleSelectWorkspace,
    handleRenameProject, handleDuplicateProject, handleDeleteProject,
    handleSaveToLibrary: saveToLibrary,
  } = useProjectManager({
    user, setState, setSelectedId, setCurrentView, setCurrentProjectId, setShowGeminiModal,
  });

  // Wrap handleGeminiGenerate to also close the modal
  const handleGeminiGenerate = (spec, description) => {
    onGeminiGenerate(spec, description);
    setShowGeminiModal(false);
  };

  // Wrap handleSaveToLibrary with current state
  const handleSaveToLibrary = () => saveToLibrary(state, currentProjectId, setShowAuth);

  // --- Navigation ---
  const handleNavigate = (view) => setCurrentView(view);

  const handleGoHome = () => {
    setCurrentView('home');
    setCurrentProjectId(null);
    setActiveProject(null);
  };

  const handleOpenGeminiModal = () => setShowGeminiModal(true);

  // --- Phase 3: Real-time collaboration ---
  const isInEditor = currentView === 'editor' || currentView === 'prototype';
  const { projectData, loading: rtLoading, isLocalUpdate } = useRealtimeProject(
    isInEditor ? activeWorkspaceId : null,
    isInEditor ? currentProjectId : null
  );
  const activeUsers = usePresence(
    isInEditor ? activeWorkspaceId : null,
    isInEditor ? currentProjectId : null,
    user
  );
  const syncToFirestore = useDebouncedSync(
    isInEditor ? activeWorkspaceId : null,
    isInEditor ? currentProjectId : null,
    isLocalUpdate
  );

  // --- Merge remote real-time updates (Phase 3) ---
  const prevProjectDataRef = useRef(null);
  useEffect(() => {
    if (!projectData || !isInEditor) return;
    if (prevProjectDataRef.current === projectData) return;
    prevProjectDataRef.current = projectData;
    setState(prev => ({
      ...prev,
      ...projectData,
      screenshots: prev.screenshots,
    }));
  }, [projectData, isInEditor]);

  // --- Persist editor state ---
  useEffect(() => {
    try {
      saveState(state);
      if (currentProjectId) {
        saveProjectState(currentProjectId, state);
        if (activeWorkspaceId) {
          syncToFirestore(state);
        }
      }
    } catch (e) { console.warn('[App] saveState failed:', e); }
  }, [state, currentProjectId, activeWorkspaceId, syncToFirestore]);

  // --- Auth + workspace init ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await initWorkspaces(u.uid);
      } else {
        clearWorkspaceState();
      }
    });
    return unsub;
  }, []);

  // --- Handle shared link URL params ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wsParam = params.get('ws');
    const projectParam = params.get('project');
    if (wsParam && projectParam) {
      setActiveWorkspaceId(wsParam);
      setCurrentProjectId(projectParam);
      getWorkspaceProjects(wsParam).then(projects => {
        const project = projects.find(p => p.id === projectParam);
        if (project) {
          setState(prev => ({ ...prev, ...project }));
          setCurrentView(project.type === 'prototype' ? 'prototype' : 'editor');
        } else {
          setCurrentView('prototype');
        }
      }).catch(() => {
        setCurrentView('prototype');
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // --- Landing page ---
  if (showLanding) {
    return (
      <LandingPage onEnterApp={() => {
        localStorage.setItem('pbi-moodboard-visited', 'true');
        setShowLanding(false);
      }} />
    );
  }

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
      <main className="moodboard-editor flex-1 flex flex-col lg:flex-row gap-0 min-h-0">
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

        <div className="w-full lg:w-[400px] lg:min-w-[400px] border-l border-surface-lighter bg-surface-light flex flex-col">
          <div className="flex border-b border-surface-lighter">
            {[
              { id: 'palette', label: 'Palette', Icon: Palette, badge: activePalette.length || null },
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
              <div className="space-y-3">
                {activePaletteLabel && (
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-primary font-medium truncate">
                      Palette from: {activePaletteLabel}
                    </span>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="text-[10px] text-text-muted hover:text-text transition-colors"
                    >
                      Show project palette
                    </button>
                  </div>
                )}
                <ColorPalette
                  colors={activePalette}
                  onRemove={removeColor}
                  onAdd={addColorManually}
                  analysis={analyzePalette(activePalette)}
                />
                {activePaletteLabel && state.palette.length > 0 && (
                  <div className="border-t border-surface-lighter pt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted mb-2">
                      Project Palette ({state.palette.length} colors)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {state.palette.slice(0, 8).map((c, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-md border border-black/10"
                          style={{ backgroundColor: c.hex }}
                          title={c.hex}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              <ExportPanel designSystem={designSystem} visuals={state.visuals} />
            )}
          </div>

          <div className="p-4 border-t border-surface-lighter space-y-2">
            {activePalette.length > 0 && (
              <button
                onClick={() => user ? setShowSaveTheme(true) : setShowAuth(true)}
                className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-full transition-all flex items-center justify-center gap-2 border border-primary/20"
              >
                <Bookmark size={16} />
                Save as Theme
              </button>
            )}
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
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        user={user}
        onSignIn={() => setShowAuth(true)}
        onSignOut={() => { clearState(); logOut(); }}
        themeName={state.name}
        onNameChange={(name) => update({ name })}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentView={currentView}
        onGoHome={handleGoHome}
        onToggleSidebar={() => setSidebarCollapsed(c => !c)}
        activeUsers={activeUsers}
        workspaceId={activeWorkspaceId}
        projectId={currentProjectId}
        onSave={handleSaveToLibrary}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar — shown on non-editor views */}
        {currentView !== 'editor' && currentView !== 'prototype' && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(c => !c)}
            currentView={currentView}
            onNavigate={handleNavigate}
            user={user}
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onSelectWorkspace={handleSelectWorkspace}
            onCreateWorkspace={handleCreateWorkspace}
          />
        )}

        {/* Main content area */}
        {currentView === 'home' && (
          <HomeDashboard
            user={user}
            projects={savedLibrary}
            onOpenProject={handleOpenProject}
            onNewProject={handleNewProject}
            onGoToMoodboard={handleGoToMoodboard}
            onViewAll={handleNavigate}
            onPromptGenerate={handlePromptGenerate}
            onRenameProject={handleRenameProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onNewPrototype={handleNewPrototype}
          />
        )}
        {currentView === 'editor' && renderEditorView()}
        {currentView === 'prototype' && (
          <PrototypeEditor
            state={state}
            onUpdate={update}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onOpenGeminiModal={handleOpenGeminiModal}
            onLoadTheme={() => user ? setShowLoadTheme(true) : setShowAuth(true)}
            activeTheme={activeTheme}
          />
        )}
        {currentView === 'gallery' && (
          <TemplateGallery onUseTemplate={handleUseCommunityTemplate} />
        )}
        {currentView === 'projects' && renderProjectsView()}
      </div>

      <AnimatePresence>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        {showGeminiModal && (
          <GeminiPromptModal
            onClose={() => setShowGeminiModal(false)}
            onGenerate={handleGeminiGenerate}
            designSystem={designSystem}
          />
        )}
        {showSaveTheme && (
          <SaveThemeModal
            designSystem={designSystem}
            workspaceId={activeWorkspaceId}
            onClose={() => setShowSaveTheme(false)}
            onSaved={(theme) => setActiveTheme(theme)}
          />
        )}
        {showLoadTheme && (
          <LoadThemeModal
            workspaceId={activeWorkspaceId}
            onClose={() => setShowLoadTheme(false)}
            onApplyTheme={(theme) => {
              setActiveTheme(theme);
              update({
                palette: theme.colors,
                fonts: theme.fonts,
                background: theme.background,
                sentinels: theme.sentinels,
              });
            }}
            currentDesignSystem={designSystem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
