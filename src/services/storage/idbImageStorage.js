/**
 * IndexedDB Image Storage Service
 *
 * Dedicated for storing uploaded image blobs and files without using
 * LocalStorage quota. LocalStorage remains lightweight (<100KB) and fast,
 * while large media is handled asynchronously via IndexedDB.
 */

const DB_NAME = 'MMG_Media_Database';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_images';

let dbPromise = null;

function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/**
 * Save an uploaded File/Blob to IndexedDB.
 * Returns an object with the persistent ID and temporary ObjectURL for preview.
 */
export async function saveImageFile(file, customId = null) {
  const db = await getDB();
  const id = customId || `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const record = {
    id,
    name: file.name || 'image.jpg',
    type: file.type || 'image/jpeg',
    size: file.size || 0,
    blob: file,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => {
      const previewUrl = URL.createObjectURL(file);
      resolve({ id, previewUrl, name: record.name, size: record.size });
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve an image Blob by ID from IndexedDB.
 */
export async function getImageBlob(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result && request.result.blob) {
        resolve(request.result.blob);
      } else {
        resolve(null);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve an ObjectURL for an image by ID.
 */
export async function getImageUrl(id) {
  const blob = await getImageBlob(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/**
 * Delete an image by ID from IndexedDB.
 */
export async function deleteImage(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * List all image records stored in IndexedDB.
 */
export async function getAllImages() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

