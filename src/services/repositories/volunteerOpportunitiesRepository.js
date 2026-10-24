/**
 * Volunteer Opportunities Repository
 */

import { BaseRepository } from './baseRepository.js';
import { volunteerOpportunitySchema } from '../validation/schemas.js';
import * as dbEngine from '../storage/localStorageEngine.js';

class VolunteerOpportunitiesRepository extends BaseRepository {
  constructor() {
    super('volunteerOpportunities', volunteerOpportunitySchema, dbEngine);
  }

  getOpen() {
    return this.getAll((item) => item.status === 'open');
  }

  close(id) {
    return this.update(id, { status: 'closed' });
  }

  open(id) {
    return this.update(id, { status: 'open' });
  }
}

export const volunteerOpportunitiesRepository = new VolunteerOpportunitiesRepository();
