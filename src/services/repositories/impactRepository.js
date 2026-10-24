/**
 * Impact Statistics Repository
 */

import { impactStatSchema } from '../validation/schemas.js';
import * as dbEngine from '../storage/localStorageEngine.js';
import { generateUUID } from '../storage/localStorageEngine.js';

export const impactRepository = {
  get() {
    const db = dbEngine.loadDatabase();
    return db.impact || { isDemo: true, disclaimer: '', stats: [] };
  },

  getStats() {
    return this.get().stats || [];
  },

  updateMeta({ isDemo, disclaimer }) {
    const db = dbEngine.loadDatabase();
    db.impact = {
      ...(db.impact || {}),
      ...(isDemo !== undefined ? { isDemo } : {}),
      ...(disclaimer !== undefined ? { disclaimer } : {}),
    };
    dbEngine.saveDatabase(db);
    return { impact: db.impact, updatedDatabase: db };
  },

  updateStat(id, updates) {
    const db = dbEngine.loadDatabase();
    const stats = Array.isArray(db.impact?.stats) ? db.impact.stats : [];
    const index = stats.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error(`Impact statistic with ID "${id}" not found`);
    }

    const merged = { ...stats[index], ...updates, id };
    const validated = impactStatSchema.parse(merged);

    stats[index] = validated;
    db.impact.stats = stats;
    dbEngine.saveDatabase(db);

    return { stat: validated, impact: db.impact, updatedDatabase: db };
  },

  createStat(statData) {
    const db = dbEngine.loadDatabase();
    const stats = Array.isArray(db.impact?.stats) ? db.impact.stats : [];

    const record = {
      ...statData,
      id: statData.id || `stat-${generateUUID()}`,
      isDemo: statData.isDemo ?? true,
    };

    const validated = impactStatSchema.parse(record);
    stats.push(validated);

    db.impact.stats = stats;
    dbEngine.saveDatabase(db);

    return { stat: validated, impact: db.impact, updatedDatabase: db };
  },

  deleteStat(id) {
    const db = dbEngine.loadDatabase();
    const stats = Array.isArray(db.impact?.stats) ? db.impact.stats : [];
    const filtered = stats.filter((s) => s.id !== id);

    db.impact.stats = filtered;
    dbEngine.saveDatabase(db);

    return { success: true, id, impact: db.impact, updatedDatabase: db };
  },
};
