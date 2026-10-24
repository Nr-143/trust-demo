/**
 * Gallery Items Repository
 */

import { BaseRepository } from './baseRepository.js';
import { galleryItemSchema } from '../validation/schemas.js';
import * as dbEngine from '../storage/localStorageEngine.js';

class GalleryRepository extends BaseRepository {
  constructor() {
    super('gallery', galleryItemSchema, dbEngine);
  }

  getPublished() {
    return this.getAll((g) => g.status === 'published' || !g.status);
  }

  getByCategory(category) {
    if (!category || category === 'All') return this.getPublished();
    return this.getAll((g) => (g.status === 'published' || !g.status) && g.category === category);
  }

  archive(id) {
    return this.update(id, { status: 'archived' });
  }

  publish(id) {
    return this.update(id, { status: 'published' });
  }
}

export const galleryRepository = new GalleryRepository();
