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
  const flushingRef = useRef(false);

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    if (!latestState.current) return;

    flushingRef.current = true;
    // Snapshot what we're about to save so we can detect new edits after
    const snapshotted = latestState.current;
    try {
      if (isLocalUpdate) isLocalUpdate.current = true;
      const toSave = {
        ...snapshotted,
        screenshots: (snapshotted.screenshots || []).map(s => ({
          ...s,
          dataUrl: undefined,
        })),
        visuals: (snapshotted.visuals || []).map(v => ({
          ...v,
          status: v.status === 'generating' ? 'pending' : v.status,
        })),
      };
      await saveWorkspaceProject(workspaceId, { ...toSave, id: projectId });
    } catch (e) {
      console.warn('[useDebouncedSync] Save failed:', e);
    } finally {
      flushingRef.current = false;
      // State changed while we were saving — schedule another write
      if (latestState.current !== snapshotted) {
        flush();
      }
    }
  }, [workspaceId, projectId, isLocalUpdate]);

  const sync = useCallback((state) => {
    if (!workspaceId || !projectId) return;

    latestState.current = state;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(flush, DEBOUNCE_DELAY);
  }, [workspaceId, projectId, flush]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return sync;
}
