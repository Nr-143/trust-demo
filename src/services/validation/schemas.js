/**
 * Domain Validation Schemas using Zod
 *
 * Ensures all records are strictly validated before being saved to LocalStorage
 * or processed by repositories and UI components.
 */

import { z } from 'zod';

export const siteInfoSchema = z.object({
  name: z.string().min(2, 'Organisation name is required'),
  nameTamil: z.string().min(2, 'Tamil name is required'),
  shortName: z.string().min(2, 'Short name is required'),
  tagline: z.string().min(5, 'Tagline is required'),
  taglineTamil: z.string().min(5, 'Tamil tagline is required'),
  heroHeading: z.string().min(5, 'Hero heading is required'),
  heroSubheading: z.string().min(10, 'Hero supporting text is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  phoneFormatted: z.string().optional(),
  phoneRaw: z.string().optional(),
  whatsappNumber: z.string().optional(),
  whatsappUrl: z.string().url('Valid WhatsApp URL is required').optional(),
  address: z.string().min(5, 'Office address is required'),
  locationShort: z.string().optional(),
  district: z.string().default('Dharmapuri'),
  state: z.string().default('Tamil Nadu'),
  pincode: z.string().default('636808'),
  founded: z.string().default('2024'),
  logoFull: z.string().optional(),
  logoBadge: z.string().optional(),
  missionStatement: z.string().optional().default(''),
  visionStatement: z.string().optional().default(''),
  announcementBanner: z.string().optional().default(''),
  announcementActive: z.boolean().optional().default(false),
  primaryCtaText: z.string().optional().default('Support Our Mission'),
  secondaryCtaText: z.string().optional().default('Become a Volunteer'),
  footerAboutText: z.string().optional().default(''),
  footerCopyright: z.string().optional().default(''),
});

export const programmeSchema = z.object({
  id: z.string().min(1),
  slug: z.string().optional(),
  title: z.string().min(2, 'Programme title is required'),
  fullTitle: z.string().optional(),
  titleTamil: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  icon: z.string().default('GraduationCap'),
  imageUrl: z.string().min(1, 'Image URL or identifier is required'),
  description: z.string().min(10, 'Short description is required'),
  details: z.string().optional(),
  highlights: z.array(z.string()).optional().default([]),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
  isDemo: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const campaignSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3, 'Campaign title is required'),
  slug: z.string().optional(),
  fullTitle: z.string().optional(),
  category: z.string().default('Rural Cause'),
  description: z.string().min(10, 'Campaign description is required'),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  goalAmount: z.coerce.number().positive('Goal amount must be greater than zero'),
  raisedAmount: z.coerce.number().min(0, 'Raised amount cannot be negative').default(0),
  donorsCount: z.coerce.number().int().min(0, 'Donors count cannot be negative').default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  imageUrl: z.string().min(1, 'Campaign image is required'),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
  publicationStatus: z.enum(['published', 'draft', 'archived']).default('published'),
  location: z.string().optional(),
  isDemo: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const impactStatSchema = z.object({
  id: z.string().min(1),
  key: z.string().optional(),
  label: z.string().min(2, 'Metric label is required'),
  labelTamil: z.string().optional(),
  value: z.string().min(1, 'Metric value is required'),
  icon: z.string().default('Users'),
  description: z.string().optional(),
  isDemo: z.boolean().default(true),
});

export const volunteerOpportunitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3, 'Opportunity title is required'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(10, 'Description is required'),
  location: z.string().default('Palacode / Dharmapuri'),
  skills: z.string().default('Enthusiasm for grassroots community service'),
  commitment: z.string().default('Weekend / Flexible'),
  status: z.enum(['open', 'closed', 'draft', 'archived']).default('open'),
  isDemo: z.boolean().default(true),
});

export const volunteerApplicationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Applicant name is required'),
  email: z.string().email('Valid applicant email is required'),
  phone: z.string().min(10, 'Valid 10-digit applicant phone is required'),
  opportunityId: z.string().optional(),
  preferredOpportunity: z.string().optional(),
  area: z.string().optional().default('General Rural Development'),
  skills: z.string().optional().default(''),
  availability: z.string().optional().default('Weekends / Flexible'),
  message: z.string().optional().default(''),
  status: z.enum(['New', 'Reviewed', 'Contacted', 'Accepted', 'Rejected', 'pending', 'approved', 'archived']).default('New'),
  submittedAt: z.string().default(() => new Date().toISOString()),
  isDemo: z.boolean().default(true),
});

export const careerSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3, 'Position title is required'),
  location: z.string().min(2, 'Location is required'),
  type: z.string().default('Full-time'),
  description: z.string().min(10, 'Job description is required'),
  skills: z.union([z.string(), z.array(z.string())]).optional().default('Relevant field experience or degree'),
  status: z.enum(['open', 'closed', 'draft', 'archived']).default('open'),
  publicationStatus: z.enum(['published', 'draft', 'archived']).default('published'),
  postedDate: z.string().default(() => new Date().toISOString().slice(0, 10)),
  isDemo: z.boolean().default(true),
});

export const jobApplicationSchema = z.object({
  id: z.string().min(1),
  careerId: z.string().min(1, 'Position ID is required'),
  careerTitle: z.string().min(1, 'Position title is required'),
  name: z.string().min(2, 'Applicant name is required'),
  email: z.string().email('Valid applicant email is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  experience: z.string().optional().default(''),
  skills: z.string().optional().default(''),
  message: z.string().optional().default(''),
  status: z.enum(['New', 'Reviewed', 'Contacted', 'Shortlisted', 'Rejected']).default('New'),
  submittedAt: z.string().default(() => new Date().toISOString()),
  isDemo: z.boolean().default(true),
});

export const galleryItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2, 'Image title is required'),
  category: z.string().min(2, 'Category is required'),
  imageUrl: z.string().min(1, 'Image source URL is required'),
  status: z.enum(['published', 'archived']).default('published'),
  isDemo: z.boolean().default(true),
  createdAt: z.string().optional(),
});

export const storySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(5, 'Story title is required'),
  titleTamil: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  date: z.string().min(2, 'Date is required'),
  location: z.string().min(2, 'Location is required'),
  imageUrl: z.string().min(1, 'Story photo is required'),
  excerpt: z.string().min(10, 'Story excerpt is required'),
  content: z.string().optional(),
  badge: z.string().default('Community Story'),
  status: z.enum(['published', 'archived']).default('published'),
  isDemo: z.boolean().default(true),
});

export const contactEnquirySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message is required'),
  status: z.enum(['new', 'read', 'responded', 'archived']).default('new'),
  submittedAt: z.string().default(() => new Date().toISOString()),
});

export const donationSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1, 'Campaign ID is required'),
  campaignTitle: z.string().min(1, 'Campaign title is required'),
  donorName: z.string().min(2, 'Donor name is required'),
  donorEmail: z.string().email('Valid email is required'),
  donorPhone: z.string().optional(),
  amount: z.coerce.number().min(10, 'Donation amount must be at least ₹10'),
  message: z.string().optional().default(''),
  paymentMethod: z.string().default('Simulated Demo Transfer'),
  timestamp: z.string().default(() => new Date().toISOString()),
  isDemo: z.boolean().default(true),
});

