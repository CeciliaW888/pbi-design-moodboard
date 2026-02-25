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
      }))
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
