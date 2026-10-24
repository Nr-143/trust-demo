/**
 * Job Applications Repository
 * Manages sample job/internship applications submitted from the public careers page.
 */

import { BaseRepository } from './baseRepository.js';
import { jobApplicationSchema } from '../validation/schemas.js';
import * as dbEngine from '../storage/localStorageEngine.js';

class JobApplicationsRepository extends BaseRepository {
  constructor() {
    super('jobApplications', jobApplicationSchema, dbEngine);
  }

  getByCareer(careerId) {
    return this.getAll((app) => app.careerId === careerId);
  }

  updateStatus(id, status) {
    return this.update(id, { status });
  }
}

export const jobApplicationsRepository = new JobApplicationsRepository();

