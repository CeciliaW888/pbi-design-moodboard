import { db, getUserMoodboards, createWorkspace } from '../firebase';
import { doc, getDoc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

const PERSONAL_WORKSPACE_NAME = 'Personal';

/**
 * One-time migration: copies projects from users/{uid}/moodboards
 * into a "Personal" workspace under workspaces/{wid}/projects/{pid}.
 * Sets users/{uid}/profile.migrated = true when done.
 */
export async function migrateUserToWorkspaces(userId) {
  // Check if already migrated
  const profileRef = doc(db, 'users', userId, 'profile', 'settings');
  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists() && profileSnap.data().migrated) {
    return null; // Already migrated
  }

  // Get existing moodboards
  const moodboards = await getUserMoodboards(userId);

  // Create "Personal" workspace
  const workspaceId = await createWorkspace(userId, PERSONAL_WORKSPACE_NAME);

  // Batch-write all projects into workspace
  if (moodboards.length > 0) {
    // Firestore batches are limited to 500 operations
    const BATCH_SIZE = 400;
    for (let i = 0; i < moodboards.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = moodboards.slice(i, i + BATCH_SIZE);

      for (const board of chunk) {
        const projectRef = doc(db, 'workspaces', workspaceId, 'projects', board.id);
        batch.set(projectRef, {
          ...board,
          workspaceId,
          updatedAt: board.updatedAt || serverTimestamp(),
          createdAt: board.createdAt || serverTimestamp(),
        });
      }

      await batch.commit();
    }
  }

  // Mark as migrated
  await setDoc(profileRef, { migrated: true, migratedAt: serverTimestamp(), personalWorkspaceId: workspaceId }, { merge: true });

  return workspaceId;
}

/**
 * Gets or creates the user's personal workspace.
 * Returns the workspace ID.
 */
export async function ensurePersonalWorkspace(userId, workspaces) {
  // Check if user already has a personal workspace
  const personal = workspaces.find(w => w.ownerId === userId && w.name === PERSONAL_WORKSPACE_NAME);
  if (personal) return personal.id;

  // Check profile for saved personal workspace ID
  const profileRef = doc(db, 'users', userId, 'profile', 'settings');
  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists() && profileSnap.data().personalWorkspaceId) {
    return profileSnap.data().personalWorkspaceId;
  }

  // Create one
  const id = await createWorkspace(userId, PERSONAL_WORKSPACE_NAME);
  await setDoc(profileRef, { personalWorkspaceId: id }, { merge: true });
  return id;
}
