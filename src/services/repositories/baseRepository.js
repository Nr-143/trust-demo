/**
 * Base Repository
 *
 * Provides standardized CRUD, publish, archive, and validation methods
 * for collections stored in the LocalStorage database engine.
 */

import { generateUUID } from '../storage/localStorageEngine.js';

export class BaseRepository {
  constructor(collectionKey, schema, dbEngine) {
    this.collectionKey = collectionKey;
    this.schema = schema;
    this.dbEngine = dbEngine;
  }

  /**
   * Get all items from the collection, optionally filtered.
   */
  getAll(filterFn = null) {
    const db = this.dbEngine.loadDatabase();
    const items = Array.isArray(db[this.collectionKey]) ? db[this.collectionKey] : [];
    if (typeof filterFn === 'function') {
      return items.filter(filterFn);
    }
    return items;
  }

  /**
   * Find an item by its unique ID.
   */
  getById(id) {
    const items = this.getAll();
    return items.find((item) => item.id === id) || null;
  }

  /**
   * Validate a payload against the module's Zod schema.
   */
  validate(data) {
    const result = this.schema.safeParse(data);
    if (!result.success) {
      const errList = result.error?.issues || result.error?.errors || [];
      const issues = errList
        .map((e) => `${e.path?.join('.') || 'root'}: ${e.message}`)
        .join('; ');
      throw new Error(`Validation Error for ${this.collectionKey}: ${issues}`);
    }
    return result.data;
  }

  /**
   * Create a new record with a stable UUID and timestamps.
   */
  create(data) {
    const db = this.dbEngine.loadDatabase();
    const now = new Date().toISOString();

    const recordWithId = {
      ...data,
      id: data.id || generateUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const validated = this.validate(recordWithId);

    const items = Array.isArray(db[this.collectionKey]) ? db[this.collectionKey] : [];
    const updatedItems = [validated, ...items];

    db[this.collectionKey] = updatedItems;
    this.dbEngine.saveDatabase(db);

    return { success: true, item: validated, updatedDatabase: db };
  }

  /**
   * Update an existing record by ID.
   */
  update(id, updates) {
    const db = this.dbEngine.loadDatabase();
    const items = Array.isArray(db[this.collectionKey]) ? db[this.collectionKey] : [];
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error(`Record with ID "${id}" not found in ${this.collectionKey}`);
    }

    const current = items[index];
    const updatedPayload = {
      ...current,
      ...updates,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    const validated = this.validate(updatedPayload);

    items[index] = validated;
    db[this.collectionKey] = items;
    this.dbEngine.saveDatabase(db);

    return { success: true, item: validated, updatedDatabase: db };
  }

  /**
   * Delete a record by ID.
   */
  delete(id) {
    const db = this.dbEngine.loadDatabase();
    const items = Array.isArray(db[this.collectionKey]) ? db[this.collectionKey] : [];
    const exists = items.some((item) => item.id === id);

    if (!exists) {
      throw new Error(`Record with ID "${id}" not found in ${this.collectionKey}`);
    }

    const filtered = items.filter((item) => item.id !== id);
    db[this.collectionKey] = filtered;
    this.dbEngine.saveDatabase(db);

    return { success: true, id, updatedDatabase: db };
  }

  /**
   * Set status to published/active.
   */
  publish(id) {
    const existing = this.getById(id);
    const publishedStatus = existing && 'status' in existing
      ? (typeof existing.status === 'string' && existing.status === 'draft' ? 'active' : 'published')
      : 'active';

    return this.update(id, { status: publishedStatus });
  }

  /**
   * Set status to archived.
   */
  archive(id) {
    return this.update(id, { status: 'archived' });
  }
}
