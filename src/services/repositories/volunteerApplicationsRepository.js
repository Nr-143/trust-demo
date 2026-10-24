/**
 * Volunteer Applications Repository
 * Manages volunteer registrations submitted from the public site.
 */

import { BaseRepository } from './baseRepository.js';
import { volunteerApplicationSchema } from '../validation/schemas.js';
import * as dbEngine from '../storage/localStorageEngine.js';

class VolunteerApplicationsRepository extends BaseRepository {
  constructor() {
    super('volunteerApplications', volunteerApplicationSchema, dbEngine);
  }

  getPending() {
    return this.getAll((v) => v.status === 'New' || v.status === 'pending');
  }

  updateStatus(id, status) {
    return this.update(id, { status });
  }

  approve(id) {
    return this.update(id, { status: 'Accepted' });
  }

  reject(id) {
    return this.update(id, { status: 'Rejected' });
  }

  archive(id) {
    return this.update(id, { status: 'archived' });
  }
}

export const volunteerApplicationsRepository = new VolunteerApplicationsRepository();
