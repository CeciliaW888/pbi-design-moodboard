import { useState, useEffect, useRef } from 'react';
import { subscribeToProject } from '../firebase';

/**
 * Subscribes to a workspace project via Firestore onSnapshot.
 * Returns { projectData, loading, isLocalUpdate }.
 * isLocalUpdate ref is true when the latest change was triggered locally,
 * so callers can suppress echo from their own writes.
 */
export function useRealtimeProject(workspaceId, projectId) {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLocalUpdate = useRef(false);

  useEffect(() => {
    if (!workspaceId || !projectId) {
      setProjectData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsub = subscribeToProject(workspaceId, projectId, (data) => {
      if (isLocalUpdate.current) {
        // This snapshot was triggered by our own write — skip
        isLocalUpdate.current = false;
      } else {
        setProjectData(data);
      }
      setLoading(false);
    });

    return unsub;
  }, [workspaceId, projectId]);

  return { projectData, loading, isLocalUpdate };
}
