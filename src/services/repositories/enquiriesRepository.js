/**
 * Contact Enquiries Repository
 * Manages messages sent via public contact forms.
 */

import { BaseRepository } from './baseRepository.js';
import { contactEnquirySchema } from '../validation/schemas.js';
import * as dbEngine from '../storage/localStorageEngine.js';

class EnquiriesRepository extends BaseRepository {
  constructor() {
    super('contactEnquiries', contactEnquirySchema, dbEngine);
  }

  getUnread() {
    return this.getAll((e) => e.status === 'new');
  }

  markAsRead(id) {
    return this.update(id, { status: 'read' });
  }

  markAsResponded(id) {
    return this.update(id, { status: 'responded' });
  }

  archive(id) {
    return this.update(id, { status: 'archived' });
  }
}

export const enquiriesRepository = new EnquiriesRepository();
