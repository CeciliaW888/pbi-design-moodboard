import { db } from '../firebase';
import {
  collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc,
  query, orderBy, serverTimestamp
} from 'firebase/firestore';

/**
 * Theme schema:
 * {
 *   id, workspaceId, name, description,
 *   colors: [{ hex, rgb, hsl }],
 *   fonts: { heading, body, mono?, titleSize, bodySize },
 *   sentiment: string,
 *   spacing: string,
 *   background: string,
 *   sentinels: { good, neutral, bad },
 *   createdFrom: 'moodboard' | 'template' | 'manual' | 'import',
 *   sourceImage: string | null,
 *   createdAt, updatedAt, version: number
 * }
 */

function themesCollection(workspaceId) {
  return collection(db, 'workspaces', workspaceId, 'themes');
}

function themeDoc(workspaceId, themeId) {
  return doc(db, 'workspaces', workspaceId, 'themes', themeId);
}

export async function saveTheme(workspaceId, theme) {
  const id = theme.id || crypto.randomUUID();
  const data = {
    ...theme,
    id,
    workspaceId,
    version: theme.version || 1,
    updatedAt: serverTimestamp(),
    createdAt: theme.createdAt || serverTimestamp(),
  };
  await setDoc(themeDoc(workspaceId, id), data);
  return id;
}

export async function getThemes(workspaceId) {
  const q = query(themesCollection(workspaceId), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getTheme(workspaceId, themeId) {
  const snap = await getDoc(themeDoc(workspaceId, themeId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateTheme(workspaceId, themeId, updates) {
  await updateDoc(themeDoc(workspaceId, themeId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTheme(workspaceId, themeId) {
  await deleteDoc(themeDoc(workspaceId, themeId));
}

export async function duplicateTheme(workspaceId, themeId) {
  const original = await getTheme(workspaceId, themeId);
  if (!original) throw new Error('Theme not found');
  const newId = crypto.randomUUID();
  const { createdAt, updatedAt, ...rest } = original;
  await setDoc(themeDoc(workspaceId, newId), {
    ...rest,
    id: newId,
    name: `${original.name} (Copy)`,
    version: (original.version || 1) + 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return newId;
}

/**
 * Export theme as downloadable JSON file.
 */
export function exportThemeJSON(theme) {
  const exportData = {
    name: theme.name,
    description: theme.description || '',
    colors: theme.colors,
    fonts: theme.fonts,
    background: theme.background,
    sentinels: theme.sentinels,
    sentiment: theme.sentiment || '',
    spacing: theme.spacing || '',
    version: theme.version || 1,
    exportedAt: new Date().toISOString(),
    source: 'ditto',
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${theme.name || 'theme'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import theme from JSON file. Returns a theme object (not saved yet).
 */
export function importThemeJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve({
          id: crypto.randomUUID(),
          name: data.name || 'Imported Theme',
          description: data.description || '',
          colors: data.colors || [],
          fonts: data.fonts || { heading: 'Segoe UI Semibold', body: 'Segoe UI', titleSize: 18, bodySize: 10 },
          background: data.background || '#ffffff',
          sentinels: data.sentinels || { good: '#107C10', neutral: '#F2C811', bad: '#D83B01' },
          sentiment: data.sentiment || '',
          spacing: data.spacing || '',
          version: 1,
          createdFrom: 'import',
        });
      } catch (err) {
        reject(new Error('Invalid theme JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
