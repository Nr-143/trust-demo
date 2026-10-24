/**
 * Career Listings Repository
 */

import { BaseRepository } from './baseRepository.js';
import { careerSchema } from '../validation/schemas.js';
import * as dbEngine from '../storage/localStorageEngine.js';

class CareersRepository extends BaseRepository {
  constructor() {
    super('careers', careerSchema, dbEngine);
  }

  getOpen() {
    return this.getAll((c) => c.status === 'open');
  }

  getPublished() {
    return this.getAll((c) => {
      const isPub = c.publicationStatus === 'published' || (!c.publicationStatus && c.status === 'open');
      return isPub && c.status !== 'archived';
    });
  }

  close(id) {
    return this.update(id, { status: 'closed' });
  }

  open(id) {
    return this.update(id, { status: 'open', publicationStatus: 'published' });
  }

  publish(id) {
    return this.update(id, { publicationStatus: 'published', status: 'open' });
  }

  unpublish(id) {
    return this.update(id, { publicationStatus: 'draft' });
  }

  archive(id) {
    return this.update(id, { status: 'archived', publicationStatus: 'archived' });
  }
}

export const careersRepository = new CareersRepository();
