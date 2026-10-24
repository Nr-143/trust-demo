/**
 * Website Content Repository
 * Manages siteInfo, marketing copy, and contact info.
 */

import { siteInfoSchema } from '../validation/schemas.js';
import * as dbEngine from '../storage/localStorageEngine.js';

export const contentRepository = {
  get() {
    const db = dbEngine.loadDatabase();
    return db.siteInfo;
  },

  update(updates) {
    const db = dbEngine.loadDatabase();
    const current = db.siteInfo || {};
    const merged = { ...current, ...updates };

    const result = siteInfoSchema.safeParse(merged);
    if (!result.success) {
      const errList = result.error?.issues || result.error?.errors || [];
      const issues = errList
        .map((e) => `${e.path?.join('.') || 'root'}: ${e.message}`)
        .join('; ');
      throw new Error(`Content Validation Error: ${issues}`);
    }

    db.siteInfo = result.data;
    dbEngine.saveDatabase(db);
    return { siteInfo: result.data, updatedDatabase: db };
  },
};
