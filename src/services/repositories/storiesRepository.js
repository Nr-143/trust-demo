/**
 * Community Stories Repository
 */

import { BaseRepository } from './baseRepository.js';
import { storySchema } from '../validation/schemas.js';
import * as dbEngine from '../storage/localStorageEngine.js';

class StoriesRepository extends BaseRepository {
  constructor() {
    super('stories', storySchema, dbEngine);
  }

  getPublished() {
    return this.getAll((s) => s.status === 'published' || !s.status);
  }

  archive(id) {
    return this.update(id, { status: 'archived' });
  }

  publish(id) {
    return this.update(id, { status: 'published' });
  }
}

export const storiesRepository = new StoriesRepository();
