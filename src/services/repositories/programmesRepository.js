/**
 * Programmes Repository
 */

import { BaseRepository } from './baseRepository.js';
import { programmeSchema } from '../validation/schemas.js';
import * as dbEngine from '../storage/localStorageEngine.js';

class ProgrammesRepository extends BaseRepository {
  constructor() {
    super('programmes', programmeSchema, dbEngine);
  }

  getActive() {
    return this.getAll((p) => p.status === 'active');
  }

  getByCategory(category) {
    if (!category || category === 'All') return this.getActive();
    return this.getAll((p) => p.status === 'active' && p.category.toLowerCase().includes(category.toLowerCase()));
  }

  archive(id) {
    return this.update(id, { status: 'archived' });
  }

  publish(id) {
    return this.update(id, { status: 'active' });
  }
}

export const programmesRepository = new ProgrammesRepository();
