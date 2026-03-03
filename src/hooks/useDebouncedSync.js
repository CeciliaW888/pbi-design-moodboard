import { useRef, useEffect, useCallback } from 'react';
import { saveWorkspaceProject } from '../firebase';

const DEBOUNCE_DELAY = 1500; // 1.5 seconds

/**
 * Debounced Firestore write for project state.
 * Coordinates with isLocalUpdate ref to suppress echo from own writes.
 * Call `sync(state)` whenever project state changes.
 */
export function useDebouncedSync(workspaceId, projectId, isLocalUpdate) {
  const timerRef = useRef(null);
  const latestState = useRef(null);

  const sync = useCallback((state) => {
    if (!workspaceId || !projectId) return;

    latestState.current = state;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (!latestState.current) return;
      try {
        // Mark as local update so the onSnapshot callback ignores echo
        if (isLocalUpdate) isLocalUpdate.current = true;
        // Strip large data URLs before saving to Firestore
        const toSave = {
          ...latestState.current,
          screenshots: (latestState.current.screenshots || []).map(s => ({
            ...s,
            dataUrl: undefined,
          })),
          visuals: (latestState.current.visuals || []).map(v => ({
            ...v,
            status: v.status === 'generating' ? 'pending' : v.status,
          })),
        };
        await saveWorkspaceProject(workspaceId, { ...toSave, id: projectId });
      } catch (e) {
        console.warn('[useDebouncedSync] Save failed:', e);
      }
    }, DEBOUNCE_DELAY);
  }, [workspaceId, projectId, isLocalUpdate]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return sync;
}
