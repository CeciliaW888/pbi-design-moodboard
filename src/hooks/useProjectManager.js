import { useState, useCallback } from 'react'
import { saveProjectState, setActiveProject, deleteProjectState } from '../lib/storage'
import {
  saveMoodboard, getUserMoodboards, getRecentMoodboards, deleteMoodboard,
  renameMoodboard, duplicateMoodboard,
  createWorkspace, getUserWorkspaces, getWorkspaceProjects, saveWorkspaceProject,
  deleteWorkspaceProject, renameWorkspaceProject, duplicateWorkspaceProject,
} from '../firebase'
import { migrateUserToWorkspaces, ensurePersonalWorkspace } from '../lib/migration'

const DEFAULT_STATE = {
  screenshots: [],
  visuals: [],
  palette: [],
  fonts: { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 18, bodySize: 10 },
  background: '#ffffff',
  formatRules: [],
  sentinels: { good: '#107C10', neutral: '#F2C811', bad: '#D83B01' },
  name: 'My Dashboard Theme'
}

export { DEFAULT_STATE }

export function useProjectManager({ user, setState, setSelectedId, setCurrentView, setCurrentProjectId, setShowGeminiModal }) {
  const [workspaces, setWorkspaces] = useState([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null)
  const [savedLibrary, setSavedLibrary] = useState([])

  async function loadWorkspaceProjects(workspaceId) {
    try {
      const projects = await getWorkspaceProjects(workspaceId)
      setSavedLibrary(projects)
    } catch (e) {
      console.warn('[App] loadWorkspaceProjects failed:', e)
    }
  }

  async function initWorkspaces(uid) {
    try {
      await migrateUserToWorkspaces(uid)

      let ws = await getUserWorkspaces(uid)

      if (ws.length === 0) {
        const personalId = await ensurePersonalWorkspace(uid, ws)
        ws = await getUserWorkspaces(uid)
      }

      setWorkspaces(ws)

      const firstWs = ws[0]
      if (firstWs) {
        setActiveWorkspaceId(firstWs.id)
        await loadWorkspaceProjects(firstWs.id)
      }
    } catch (e) {
      console.warn('[App] Workspace init failed, falling back to legacy:', e)
      try {
        const boards = await getRecentMoodboards(uid, 20)
        setSavedLibrary(boards)
      } catch (e2) {
        try {
          const boards = await getUserMoodboards(uid)
          setSavedLibrary(boards)
        } catch (e3) { console.warn('Could not load library:', e3) }
      }
    }
  }

  const clearWorkspaceState = useCallback(() => {
    setWorkspaces([])
    setActiveWorkspaceId(null)
    setSavedLibrary([])
  }, [])

  const handleOpenProject = useCallback((project) => {
    const projectState = {
      ...DEFAULT_STATE,
      ...project,
      id: project.id,
    }
    setState(projectState)
    setCurrentProjectId(project.id)
    setActiveProject(project.id)
    setCurrentView(project.type === 'prototype' ? 'prototype' : 'editor')
    setSelectedId(null)
  }, [setState, setCurrentProjectId, setCurrentView, setSelectedId])

  const handleNewProject = useCallback(() => {
    setCurrentView('home')
    setSelectedId(null)
  }, [setCurrentView, setSelectedId])

  const handleGoToMoodboard = useCallback(async () => {
    const newId = crypto.randomUUID()
    const newState = { ...DEFAULT_STATE, id: newId, name: 'Untitled Project', createdAt: Date.now(), updatedAt: Date.now() }
    setState(newState)
    setCurrentProjectId(newId)
    setActiveProject(newId)
    saveProjectState(newId, newState)

    if (activeWorkspaceId && user) {
      try {
        await saveWorkspaceProject(activeWorkspaceId, { ...newState, screenshots: [] })
      } catch (e) { console.warn('Could not save new project to workspace:', e) }
    }

    setCurrentView('editor')
    setSelectedId(null)
  }, [activeWorkspaceId, user, setState, setCurrentProjectId, setCurrentView, setSelectedId])

  const handleNewPrototype = useCallback(async () => {
    const newId = crypto.randomUUID()
    const newState = {
      ...DEFAULT_STATE,
      id: newId,
      name: 'Untitled Prototype',
      type: 'prototype',
      pageWidth: 1280,
      pageHeight: 720,
      gridEnabled: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setState(newState)
    setCurrentProjectId(newId)
    setActiveProject(newId)
    saveProjectState(newId, newState)

    if (activeWorkspaceId && user) {
      try {
        await saveWorkspaceProject(activeWorkspaceId, { ...newState, screenshots: [] })
      } catch (e) { console.warn('Could not save new prototype to workspace:', e) }
    }

    setCurrentView('prototype')
    setSelectedId(null)
  }, [activeWorkspaceId, user, setState, setCurrentProjectId, setCurrentView, setSelectedId])

  const handleUseCommunityTemplate = useCallback(async (template) => {
    const project = {
      ...template,
      id: crypto.randomUUID(),
      type: 'prototype',
      screenshots: [],
      visuals: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setState(project)
    setCurrentProjectId(project.id)
    setActiveProject(project.id)
    saveProjectState(project.id, project)

    if (activeWorkspaceId && user) {
      try {
        await saveWorkspaceProject(activeWorkspaceId, project)
      } catch (e) { console.warn('Could not save community template project:', e) }
    }

    setCurrentView('prototype')
    setSelectedId(null)
  }, [activeWorkspaceId, user, setState, setCurrentProjectId, setCurrentView, setSelectedId])

  const handlePromptGenerate = useCallback(async (promptText) => {
    const newId = crypto.randomUUID()
    const newState = { ...DEFAULT_STATE, id: newId, name: promptText.slice(0, 40), createdAt: Date.now(), updatedAt: Date.now() }
    setState(newState)
    setCurrentProjectId(newId)
    setActiveProject(newId)
    saveProjectState(newId, newState)

    if (activeWorkspaceId && user) {
      try {
        await saveWorkspaceProject(activeWorkspaceId, { ...newState, screenshots: [] })
      } catch (e) { console.warn('Could not save project to workspace:', e) }
    }

    setCurrentView('editor')
    setSelectedId(null)
    setTimeout(() => setShowGeminiModal(true), 100)
  }, [activeWorkspaceId, user, setState, setCurrentProjectId, setCurrentView, setSelectedId, setShowGeminiModal])

  const handleCreateWorkspace = useCallback(async (name) => {
    if (!user) return
    try {
      const id = await createWorkspace(user.uid, name)
      const ws = await getUserWorkspaces(user.uid)
      setWorkspaces(ws)
      setActiveWorkspaceId(id)
      await loadWorkspaceProjects(id)
    } catch (e) { console.warn('Create workspace failed:', e) }
  }, [user])

  const handleSelectWorkspace = useCallback(async (workspaceId) => {
    setActiveWorkspaceId(workspaceId)
    await loadWorkspaceProjects(workspaceId)
  }, [])

  const handleRenameProject = useCallback(async (projectId, newName) => {
    if (activeWorkspaceId && user) {
      try {
        await renameWorkspaceProject(activeWorkspaceId, projectId, newName)
        await loadWorkspaceProjects(activeWorkspaceId)
        return
      } catch (e) { console.warn('Workspace rename failed, trying legacy:', e) }
    }
    if (user) {
      try {
        await renameMoodboard(user.uid, projectId, newName)
      } catch (e) { console.warn('Rename failed:', e) }
    }
    setSavedLibrary(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p))
  }, [user, activeWorkspaceId])

  const handleDuplicateProject = useCallback(async (projectId) => {
    if (activeWorkspaceId && user) {
      try {
        await duplicateWorkspaceProject(activeWorkspaceId, projectId)
        await loadWorkspaceProjects(activeWorkspaceId)
        return
      } catch (e) { console.warn('Workspace duplicate failed, trying legacy:', e) }
    }
    if (user) {
      try {
        await duplicateMoodboard(user.uid, projectId)
        const boards = await getUserMoodboards(user.uid)
        setSavedLibrary(boards)
      } catch (e) { console.warn('Duplicate failed:', e) }
    }
  }, [user, activeWorkspaceId])

  const handleDeleteProject = useCallback(async (projectId) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    if (activeWorkspaceId && user) {
      try {
        await deleteWorkspaceProject(activeWorkspaceId, projectId)
        await loadWorkspaceProjects(activeWorkspaceId)
        deleteProjectState(projectId)
        return
      } catch (e) { console.warn('Workspace delete failed, trying legacy:', e) }
    }
    if (user) {
      try {
        await deleteMoodboard(user.uid, projectId)
      } catch (e) { console.warn('Delete failed:', e) }
    }
    deleteProjectState(projectId)
    setSavedLibrary(prev => prev.filter(p => p.id !== projectId))
  }, [user, activeWorkspaceId])

  const handleSaveToLibrary = useCallback(async (state, currentProjectId, setShowAuth) => {
    if (!user) { setShowAuth(true); return }
    try {
      const toSave = {
        ...state,
        screenshots: state.screenshots.map(s => ({ ...s, dataUrl: undefined })),
        id: currentProjectId || state.id,
      }
      if (activeWorkspaceId) {
        await saveWorkspaceProject(activeWorkspaceId, toSave)
        await loadWorkspaceProjects(activeWorkspaceId)
      } else {
        await saveMoodboard(user.uid, toSave)
        const boards = await getUserMoodboards(user.uid)
        setSavedLibrary(boards)
      }
    } catch (e) { console.error('Save failed:', e) }
  }, [user, activeWorkspaceId])

  return {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    savedLibrary,
    setSavedLibrary,
    initWorkspaces,
    loadWorkspaceProjects,
    clearWorkspaceState,
    handleOpenProject,
    handleNewProject,
    handleGoToMoodboard,
    handleNewPrototype,
    handleUseCommunityTemplate,
    handlePromptGenerate,
    handleCreateWorkspace,
    handleSelectWorkspace,
    handleRenameProject,
    handleDuplicateProject,
    handleDeleteProject,
    handleSaveToLibrary,
  }
}
