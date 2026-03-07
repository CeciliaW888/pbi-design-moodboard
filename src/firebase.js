import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, GithubAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, query, orderBy, limit, where, arrayUnion, arrayRemove, writeBatch, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Replace with your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
const githubProvider = new GithubAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithMicrosoft = () => signInWithPopup(auth, microsoftProvider);
export const signInWithGithub = () => signInWithPopup(auth, githubProvider);
export const signInEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signUpEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
export const logOut = () => signOut(auth);
export { onAuthStateChanged };

// Firestore operations
export async function saveMoodboard(userId, moodboard) {
  const id = moodboard.id || crypto.randomUUID();
  await setDoc(doc(db, 'users', userId, 'moodboards', id), {
    ...moodboard,
    id,
    updatedAt: serverTimestamp(),
    createdAt: moodboard.createdAt || serverTimestamp()
  });
  return id;
}

export async function getUserMoodboards(userId) {
  const snap = await getDocs(collection(db, 'users', userId, 'moodboards'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteMoodboard(userId, moodboardId) {
  await deleteDoc(doc(db, 'users', userId, 'moodboards', moodboardId));
}

export async function getRecentMoodboards(userId, count = 6) {
  const q = query(
    collection(db, 'users', userId, 'moodboards'),
    orderBy('updatedAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function renameMoodboard(userId, moodboardId, newName) {
  await updateDoc(doc(db, 'users', userId, 'moodboards', moodboardId), {
    name: newName,
    updatedAt: serverTimestamp(),
  });
}

export async function duplicateMoodboard(userId, moodboardId) {
  const docSnap = await getDoc(doc(db, 'users', userId, 'moodboards', moodboardId));
  if (!docSnap.exists()) throw new Error('Moodboard not found');
  const data = docSnap.data();
  const newId = crypto.randomUUID();
  await setDoc(doc(db, 'users', userId, 'moodboards', newId), {
    ...data,
    id: newId,
    name: `${data.name || 'Untitled'} (Copy)`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return newId;
}

// ═══════════════════════════════════════════════════════
// Workspace operations (Phase 2)
// ═══════════════════════════════════════════════════════

export async function createWorkspace(userId, name) {
  const id = crypto.randomUUID();
  await setDoc(doc(db, 'workspaces', id), {
    id,
    name,
    ownerId: userId,
    members: [userId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function getUserWorkspaces(userId) {
  const q = query(
    collection(db, 'workspaces'),
    where('members', 'array-contains', userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getWorkspaceProjects(workspaceId) {
  const q = query(
    collection(db, 'workspaces', workspaceId, 'projects'),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveWorkspaceProject(workspaceId, project) {
  const id = project.id || crypto.randomUUID();
  await setDoc(doc(db, 'workspaces', workspaceId, 'projects', id), {
    ...project,
    id,
    updatedAt: serverTimestamp(),
    createdAt: project.createdAt || serverTimestamp(),
  });
  return id;
}

export async function deleteWorkspaceProject(workspaceId, projectId) {
  await deleteDoc(doc(db, 'workspaces', workspaceId, 'projects', projectId));
}

export async function renameWorkspaceProject(workspaceId, projectId, newName) {
  await updateDoc(doc(db, 'workspaces', workspaceId, 'projects', projectId), {
    name: newName,
    updatedAt: serverTimestamp(),
  });
}

export async function duplicateWorkspaceProject(workspaceId, projectId) {
  const docSnap = await getDoc(doc(db, 'workspaces', workspaceId, 'projects', projectId));
  if (!docSnap.exists()) throw new Error('Project not found');
  const data = docSnap.data();
  const newId = crypto.randomUUID();
  await setDoc(doc(db, 'workspaces', workspaceId, 'projects', newId), {
    ...data,
    id: newId,
    name: `${data.name || 'Untitled'} (Copy)`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return newId;
}

export async function addWorkspaceMember(workspaceId, userId) {
  await updateDoc(doc(db, 'workspaces', workspaceId), {
    members: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });
}

export async function removeWorkspaceMember(workspaceId, userId) {
  await updateDoc(doc(db, 'workspaces', workspaceId), {
    members: arrayRemove(userId),
    updatedAt: serverTimestamp(),
  });
}

export async function updateWorkspace(workspaceId, updates) {
  await updateDoc(doc(db, 'workspaces', workspaceId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// ═══════════════════════════════════════════════════════
// Real-time listeners (Phase 3)
// ═══════════════════════════════════════════════════════

export function subscribeToProject(workspaceId, projectId, callback) {
  return onSnapshot(
    doc(db, 'workspaces', workspaceId, 'projects', projectId),
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      }
    }
  );
}

export function subscribeToPresence(workspaceId, projectId, callback) {
  return onSnapshot(
    collection(db, 'workspaces', workspaceId, 'projects', projectId, 'presence'),
    (snap) => {
      const users = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
      callback(users);
    }
  );
}

export async function setPresence(workspaceId, projectId, userId, userData) {
  await setDoc(
    doc(db, 'workspaces', workspaceId, 'projects', projectId, 'presence', userId),
    {
      ...userData,
      lastSeen: serverTimestamp(),
    }
  );
}

export async function removePresence(workspaceId, projectId, userId) {
  await deleteDoc(
    doc(db, 'workspaces', workspaceId, 'projects', projectId, 'presence', userId)
  );
}

// Storage operations
export async function uploadScreenshot(userId, file) {
  const path = `users/${userId}/screenshots/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// ═══════════════════════════════════════════════════════
// Design Pattern Library (Phase 4)
// ═══════════════════════════════════════════════════════

export async function saveDesignPattern(userId, workspaceId, patternId) {
  const docRef = doc(db, 'users', userId, 'workspaces', workspaceId, 'savedPatterns', patternId);
  await setDoc(docRef, {
    patternId,
    savedAt: serverTimestamp(),
  });
}

export async function removeDesignPattern(userId, workspaceId, patternId) {
  await deleteDoc(doc(db, 'users', userId, 'workspaces', workspaceId, 'savedPatterns', patternId));
}

export async function getUserSavedPatterns(userId, workspaceId) {
  const snap = await getDocs(collection(db, 'users', userId, 'workspaces', workspaceId, 'savedPatterns'));
  return snap.docs.map(d => d.id);
}
