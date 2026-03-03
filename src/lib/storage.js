const STORAGE_KEY = 'pbi-moodboard-state';

export function loadState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function saveState(state) {
  try {
    // Don't save image data URLs directly — too large
    // Save metadata + small thumbnails
    const toSave = {
      ...state,
      screenshots: state.screenshots.map(s => ({
        ...s,
        // Keep data URL for localStorage (user hasn't signed in)
        dataUrl: s.dataUrl
      })),
      visuals: (state.visuals || []).map(v => ({
        ...v,
        // Reset frozen loading states so they don't persist across reloads
        status: v.status === 'generating' ? 'pending' : v.status,
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.warn('localStorage full — consider signing in to save to cloud');
    }
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

// --- Project-keyed storage ---
const PROJECT_PREFIX = 'pbi-project-';
const ACTIVE_PROJECT_KEY = 'pbi-active-project';

export function loadProjectState(projectId) {
  try {
    const data = localStorage.getItem(PROJECT_PREFIX + projectId);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function saveProjectState(projectId, state) {
  try {
    const toSave = {
      ...state,
      screenshots: state.screenshots.map(s => ({ ...s, dataUrl: s.dataUrl })),
      visuals: (state.visuals || []).map(v => ({
        ...v,
        status: v.status === 'generating' ? 'pending' : v.status,
      })),
      updatedAt: Date.now(),
    };
    localStorage.setItem(PROJECT_PREFIX + projectId, JSON.stringify(toSave));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.warn('localStorage full — consider signing in to save to cloud');
    }
  }
}

export function deleteProjectState(projectId) {
  localStorage.removeItem(PROJECT_PREFIX + projectId);
}

export function setActiveProject(projectId) {
  if (projectId) {
    localStorage.setItem(ACTIVE_PROJECT_KEY, projectId);
  } else {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
  }
}

export function getActiveProject() {
  return localStorage.getItem(ACTIVE_PROJECT_KEY) || null;
}

export function getAllLocalProjects() {
  const projects = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(PROJECT_PREFIX)) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        projects.push(data);
      } catch { /* skip corrupted entries */ }
    }
  }
  return projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}
