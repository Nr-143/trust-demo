/**
 * Campaigns Repository
 */

import { BaseRepository } from './baseRepository.js';
import { campaignSchema } from '../validation/schemas.js';
import * as dbEngine from '../storage/localStorageEngine.js';

export function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

class CampaignsRepository extends BaseRepository {
  constructor() {
    super('campaigns', campaignSchema, dbEngine);
  }

  create(data) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.title || 'campaign');
    const desc = data.description || data.shortDescription || '';
    const prepared = {
      ...data,
      slug: slug || `campaign-${Date.now()}`,
      description: desc,
      shortDescription: data.shortDescription || desc,
      fullDescription: data.fullDescription || desc,
      publicationStatus: data.publicationStatus || 'published',
    };
    return super.create(prepared);
  }

  update(id, updates) {
    const prepared = { ...updates };
    if (prepared.slug) {
      prepared.slug = slugify(prepared.slug);
    }
    if (prepared.shortDescription && !prepared.description) {
      prepared.description = prepared.shortDescription;
    }
    if (prepared.description && !prepared.shortDescription) {
      prepared.shortDescription = prepared.description;
    }
    return super.update(id, prepared);
  }

  getBySlug(slug) {
    const all = this.getAll();
    const cleanSlug = (slug || '').toString().toLowerCase().trim();
    return all.find((c) => (c.slug && c.slug.toLowerCase() === cleanSlug) || c.id === slug) || null;
  }

  getPublished() {
    return this.getAll((c) => {
      const isPublished =
        c.publicationStatus === 'published' ||
        (!c.publicationStatus && c.status !== 'archived');
      return isPublished && c.status !== 'archived';
    });
  }

  getActive() {
    return this.getAll((c) => c.status === 'active' && c.publicationStatus === 'published');
  }

  archive(id) {
    return this.update(id, { status: 'archived', publicationStatus: 'archived' });
  }

  publish(id) {
    return this.update(id, { status: 'active', publicationStatus: 'published' });
  }

  unpublish(id) {
    return this.update(id, { publicationStatus: 'draft' });
  }

  /**
   * Increment campaign funds and donor count when a demo donation is made.
   */
  incrementDonation(campaignId, amount) {
    const campaign = this.getById(campaignId);
    if (!campaign) {
      throw new Error(`Campaign with ID "${campaignId}" not found`);
    }

    const currentRaised = Number(campaign.raisedAmount) || 0;
    const currentDonors = Number(campaign.donorsCount) || 0;
    const addedAmount = Number(amount) || 0;

    return this.update(campaignId, {
      raisedAmount: currentRaised + addedAmount,
      donorsCount: currentDonors + 1,
    });
  }
}

export const campaignsRepository = new CampaignsRepository();
