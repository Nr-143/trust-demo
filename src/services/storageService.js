/**
 * Storage Service Facade
 *
 * Provides backward-compatible hooks to the storage engine while exposing
 * all new repository and IndexedDB services.
 */

import * as dbEngine from './storage/localStorageEngine.js';

export const STORAGE_KEY = dbEngine.STORAGE_KEY;

export const loadDatabase = dbEngine.loadDatabase;
export const saveDatabase = dbEngine.saveDatabase;
export const resetDatabase = dbEngine.resetDatabase;
export const getStorageStats = dbEngine.getStorageStats;
export const exportDatabaseJSON = dbEngine.exportDatabaseJSON;
export const importDatabaseJSON = dbEngine.importDatabaseJSON;
export const generateUUID = dbEngine.generateUUID;

// Legacy aliases
export function loadState() {
  return dbEngine.loadDatabase();
}

export function saveState(state) {
  return dbEngine.saveDatabase(state);
}

export function clearState() {
  return dbEngine.resetDatabase();
}

export default {
  loadDatabase,
  saveDatabase,
  resetDatabase,
  getStorageStats,
  exportDatabaseJSON,
  importDatabaseJSON,
};
