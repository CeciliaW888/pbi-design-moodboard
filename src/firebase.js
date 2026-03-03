import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
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

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signUpEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
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

// Storage operations
export async function uploadScreenshot(userId, file) {
  const path = `users/${userId}/screenshots/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
