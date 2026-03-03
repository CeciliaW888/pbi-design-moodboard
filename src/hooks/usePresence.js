import { useState, useEffect, useRef } from 'react';
import { subscribeToPresence, setPresence, removePresence } from '../firebase';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const STALE_THRESHOLD = 90000; // 90 seconds — consider user gone if no heartbeat

/**
 * Manages presence for the current user in a workspace project.
 * Sends heartbeats every 30s and cleans up on unmount.
 * Returns activeUsers array filtered for staleness.
 */
export function usePresence(workspaceId, projectId, user) {
  const [activeUsers, setActiveUsers] = useState([]);
  const heartbeatRef = useRef(null);

  useEffect(() => {
    if (!workspaceId || !projectId || !user) {
      setActiveUsers([]);
      return;
    }

    const userData = {
      displayName: user.displayName || user.email,
      photoURL: user.photoURL || null,
      email: user.email,
    };

    // Set initial presence
    setPresence(workspaceId, projectId, user.uid, userData).catch(() => {});

    // Heartbeat
    heartbeatRef.current = setInterval(() => {
      setPresence(workspaceId, projectId, user.uid, userData).catch(() => {});
    }, HEARTBEAT_INTERVAL);

    // Subscribe to presence changes
    const unsub = subscribeToPresence(workspaceId, projectId, (users) => {
      const now = Date.now();
      const active = users.filter(u => {
        if (!u.lastSeen) return true; // Just joined
        const lastSeen = u.lastSeen.toDate ? u.lastSeen.toDate().getTime() : (u.lastSeen.seconds ? u.lastSeen.seconds * 1000 : 0);
        return now - lastSeen < STALE_THRESHOLD;
      });
      setActiveUsers(active);
    });

    // Cleanup
    return () => {
      clearInterval(heartbeatRef.current);
      removePresence(workspaceId, projectId, user.uid).catch(() => {});
      unsub();
    };
  }, [workspaceId, projectId, user?.uid]);

  return activeUsers;
}
