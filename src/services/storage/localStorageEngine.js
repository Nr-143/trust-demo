/**
 * LocalStorage Database Engine
 *
 * Provides resilient, validated, multi-tab synchronized persistence
 * for Mannin Maindhan Grama Arakattalai demo records.
 */

import { initialData } from '../../data/initialData.js';

export const STORAGE_KEY = 'mmg_trust_db_v3';
export const STORAGE_VERSION = '4.0.0';

/**
 * Generate a cryptographically secure or robust UUID v4 identifier.
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Deep clone utility to avoid unintended state mutation.
 */
export function deepClone(obj) {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj));
  }
}

/**
 * Normalise and backfill missing collections when schema evolves,
 * ensuring user-edited content is NEVER overwritten.
 */
function mergeWithDefaults(savedData, defaults) {
  if (!savedData || typeof savedData !== 'object') {
    return deepClone(defaults);
  }

  const merged = { ...savedData };

  // Ensure siteInfo has all default keys without overwriting user changes
  merged.siteInfo = {
    ...defaults.siteInfo,
    ...(savedData.siteInfo || {}),
  };

  // Ensure impact object has structure
  merged.impact = {
    ...defaults.impact,
    ...(savedData.impact || {}),
    stats: Array.isArray(savedData.impact?.stats)
      ? savedData.impact.stats
      : defaults.impact.stats,
  };

  // Ensure array collections exist
  const arrayCollections = [
    'programmes',
    'campaigns',
    'stories',
    'volunteerOpportunities',
    'volunteerApplications',
    'volunteers',
    'careers',
    'jobApplications',
    'gallery',
    'contactEnquiries',
    'demoDonations',
    'transparencyLinks',
  ];

  for (const coll of arrayCollections) {
    if (!Array.isArray(merged[coll])) {
      merged[coll] = Array.isArray(defaults[coll]) ? deepClone(defaults[coll]) : [];
    }
  }

  // Seamlessly migrate legacy 9-programme structure to the exact 6 verticals
  if (Array.isArray(merged.programmes)) {
    const hasOldDrinkingWater = merged.programmes.some((p) => p.id === 'prog-drinking-water');
    if (hasOldDrinkingWater || merged.programmes.length === 9) {
      merged.programmes = deepClone(defaults.programmes);
    }
  }

  // Ensure programmes have consistent slug
  if (Array.isArray(merged.programmes)) {
    merged.programmes = merged.programmes.map((p) => {
      const slug =
        p.slug ||
        (p.id?.replace(/^prog-/, '') || p.title)
          .toString()
          .toLowerCase()
          .trim()
          .replace(/&/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '');
      return {
        ...p,
        slug,
      };
    });
  }

  // Ensure campaigns have slug and publicationStatus
  if (Array.isArray(merged.campaigns)) {
    merged.campaigns = merged.campaigns.map((c) => {
      const slug =
        c.slug ||
        (c.title || c.id || 'campaign')
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '');
      return {
        ...c,
        slug,
        shortDescription: c.shortDescription || c.description,
        fullDescription: c.fullDescription || c.description,
        publicationStatus: c.publicationStatus || 'published',
      };
    });
  }

  // Set schema metadata
  merged._meta = {
    version: STORAGE_VERSION,
    lastSaved: new Date().toISOString(),
    isDemoOnly: true,
  };

  return merged;
}

/**
 * Load database from LocalStorage.
 * Handles missing storage, first-time seeding, and corrupted JSON gracefully.
 */
export function loadDatabase() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return deepClone(initialData);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      // First run: initialise with demonstration data
      const freshData = deepClone(initialData);
      freshData._meta = {
        version: STORAGE_VERSION,
        createdAt: new Date().toISOString(),
        lastSaved: new Date().toISOString(),
        isDemoOnly: true,
      };
      saveDatabase(freshData);
      return freshData;
    }

    const parsed = JSON.parse(raw);

    // Validate that parsed data looks like our database
    if (!parsed || typeof parsed !== 'object' || !parsed.siteInfo) {
      console.warn('Malformed database detected in LocalStorage. Recovering with defaults.');
      const repaired = mergeWithDefaults(parsed, initialData);
      saveDatabase(repaired);
      return repaired;
    }

    // Merge in any new collection fields without overwriting user data
    return mergeWithDefaults(parsed, initialData);
  } catch (error) {
    console.error('Failed to parse LocalStorage JSON. Recovering gracefully:', error);
    const recovered = deepClone(initialData);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recovered));
    } catch (saveErr) {
      console.error('Failed to write recovered database to LocalStorage:', saveErr);
    }
    return recovered;
  }
}

/**
 * Save database to LocalStorage.
 * Catches quota exceeded errors and malformed states.
 */
export function saveDatabase(data) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const payload = {
      ...data,
      _meta: {
        ...(data._meta || {}),
        version: STORAGE_VERSION,
        lastSaved: new Date().toISOString(),
      },
    };

    const serialized = JSON.stringify(payload);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded! Ensure images are stored in IndexedDB:', error);
    } else {
      console.error('Failed to save database to LocalStorage:', error);
    }
    return false;
  }
}

/**
 * Reset demonstration data to default factory state.
 */
export function resetDatabase() {
  const fresh = deepClone(initialData);
  fresh._meta = {
    version: STORAGE_VERSION,
    resetAt: new Date().toISOString(),
    lastSaved: new Date().toISOString(),
    isDemoOnly: true,
  };

  saveDatabase(fresh);

  // Notify other tabs via manual storage event dispatch if needed
  try {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(fresh),
      })
    );
  } catch {
    // StorageEvent may be restricted in some contexts
  }

  return fresh;
}

/**
 * Calculate LocalStorage usage statistics.
 */
export function getStorageStats() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { bytes: 0, kilobytes: '0 KB', lastSaved: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || '';
    const bytes = new Blob([raw]).size;
    const kilobytes = (bytes / 1024).toFixed(2) + ' KB';
    const parsed = raw ? JSON.parse(raw) : null;

    return {
      bytes,
      kilobytes,
      lastSaved: parsed?._meta?.lastSaved || null,
      version: parsed?._meta?.version || STORAGE_VERSION,
      recordCounts: {
        programmes: parsed?.programmes?.length || 0,
        campaigns: parsed?.campaigns?.length || 0,
        stories: parsed?.stories?.length || 0,
        volunteerOpportunities: parsed?.volunteerOpportunities?.length || 0,
        volunteerApplications: parsed?.volunteerApplications?.length || 0,
        careers: parsed?.careers?.length || 0,
        gallery: parsed?.gallery?.length || 0,
        contactEnquiries: parsed?.contactEnquiries?.length || 0,
        demoDonations: parsed?.demoDonations?.length || 0,
      },
    };
  } catch {
    return { bytes: 0, kilobytes: '0 KB', lastSaved: null };
  }
}

/**
 * Export current database as downloadable JSON file.
 */
export function exportDatabaseJSON() {
  const data = loadDatabase();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mmg_trust_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import a database JSON string after validation.
 */
export function importDatabaseJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || !parsed.siteInfo) {
      throw new Error('Invalid MMG Trust backup file structure');
    }

    const validated = mergeWithDefaults(parsed, initialData);
    saveDatabase(validated);
    return { success: true, data: validated };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
