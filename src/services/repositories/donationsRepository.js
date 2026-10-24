/**
 * Demo Donations Repository
 * Records mock donation pledges and automatically updates campaign statistics.
 */

import { BaseRepository } from './baseRepository.js';
import { donationSchema } from '../validation/schemas.js';
import * as dbEngine from '../storage/localStorageEngine.js';
import { generateUUID } from '../storage/localStorageEngine.js';

class DonationsRepository extends BaseRepository {
  constructor() {
    super('demoDonations', donationSchema, dbEngine);
  }

  /**
   * Record a donation and atomically update the target campaign's raised amount and donor count.
   */
  recordDonation(donationData) {
    const db = dbEngine.loadDatabase();

    const record = {
      ...donationData,
      id: donationData.id || `don_${generateUUID()}`,
      timestamp: new Date().toISOString(),
      isDemo: true,
    };

    const validatedDonation = this.validate(record);

    // 1. Add donation record
    const donations = Array.isArray(db.demoDonations) ? db.demoDonations : [];
    db.demoDonations = [validatedDonation, ...donations];

    // 2. Increment matching campaign stats
    if (Array.isArray(db.campaigns)) {
      const campIndex = db.campaigns.findIndex((c) => c.id === validatedDonation.campaignId);
      if (campIndex !== -1) {
        const camp = db.campaigns[campIndex];
        db.campaigns[campIndex] = {
          ...camp,
          raisedAmount: (Number(camp.raisedAmount) || 0) + Number(validatedDonation.amount),
          donorsCount: (Number(camp.donorsCount) || 0) + 1,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    dbEngine.saveDatabase(db);

    return { donation: validatedDonation, item: validatedDonation, updatedDatabase: db };
  }

  getByCampaign(campaignId) {
    return this.getAll((d) => d.campaignId === campaignId);
  }

  getTotalDonationsAmount() {
    const all = this.getAll();
    return all.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }
}

export const donationsRepository = new DonationsRepository();
