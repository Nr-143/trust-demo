/**
 * Supabase Data Service
 *
 * Centralized, authoritative data access layer for Mannin Maindhan Grama Arakkattalai.
 * Performs direct, secure Supabase queries and mutations with full Row Level Security compliance.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { initialData } from '../data/initialData';
import { getDialablePhone, getWhatsAppUrl } from '../utils/helpers';
import { processGalleryMedia } from './mediaProcessing';

// Helper to normalize Supabase errors
function handleDbError(operation, error) {
  console.error(`[Supabase Error in ${operation}]:`, error);
  if (error?.code === 'PGRST205' || error?.message?.includes('schema cache')) {
    throw new Error(
      `Database table not found. Please run the 'supabase/schema.sql' script in your Supabase SQL Editor to initialize the tables.`
    );
  }
  throw new Error(error.message || `Database operation failed during ${operation}.`);
}

// ==============================================================================
// 1. SITE CONTENT (Global website info, hero, mission, vision, contact)
// ==============================================================================
export async function fetchSiteContent() {
  if (!isSupabaseConfigured() || !supabase) {
    return initialData.siteInfo;
  }
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', 'main')
      .maybeSingle();

    if (error) throw error;
    if (data && data.data) {
      const merged = { ...initialData.siteInfo, ...data.data };

      // Ensure computed dialable and messaging links reflect current database values
      if (merged.phone) {
        merged.phoneRaw = getDialablePhone(merged.phone);
      }
      if (merged.whatsappNumber) {
        const cleanDigits = String(merged.whatsappNumber).replace(/\D/g, '');
        merged.whatsappNumber = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
        merged.whatsappUrl = getWhatsAppUrl(merged.whatsappNumber);
      }
      if (merged.district || merged.state) {
        const parts = [merged.district, merged.state].filter(Boolean);
        merged.locationShort = `${parts.join(', ')}${merged.pincode ? ` - ${merged.pincode}` : ''}`;
      }

      return merged;
    }
    return initialData.siteInfo;
  } catch (err) {
    console.warn('[Supabase] Could not fetch site_content from database, using verified initial profile.', err);
    return initialData.siteInfo;
  }
}

export async function saveSiteContent(contentData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase database connection is not configured.');
  }
  const { data, error } = await supabase
    .from('site_content')
    .upsert({
      id: 'main',
      data: contentData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) handleDbError('saveSiteContent', error);
  return data?.data || contentData;
}

// ==============================================================================
// 2. PROGRAMMES
// ==============================================================================
export async function fetchProgrammes() {
  if (!isSupabaseConfigured() || !supabase) {
    return initialData.programmes;
  }
  try {
    const { data, error } = await supabase
      .from('programmes')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((p) => ({
        ...p,
        fullTitle: p.full_title || p.fullTitle || p.title,
        titleTamil: p.title_tamil || p.titleTamil || '',
        imageUrl: p.image_url || p.imageUrl,
      }));
    }
    return initialData.programmes;
  } catch (err) {
    console.warn('[Supabase] Could not fetch programmes from database, using verified initial programmes.', err);
    return initialData.programmes;
  }
}

export async function createProgramme(programmeData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }

  const id = programmeData.id || `prog-${Date.now()}`;
  const cleanTitle = (programmeData.title || '').trim();
  const slug =
    (programmeData.slug || cleanTitle)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `prog-${Date.now()}`;

  const payload = {
    id,
    slug,
    title: cleanTitle,
    full_title: (programmeData.fullTitle || cleanTitle).trim(),
    title_tamil: (programmeData.titleTamil || '').trim(),
    category: programmeData.category,
    icon: programmeData.icon || 'GraduationCap',
    image_url: programmeData.imageUrl,
    description: (programmeData.description || '').trim(),
    details: (programmeData.details || '').trim(),
    highlights: Array.isArray(programmeData.highlights) ? programmeData.highlights : [],
    projects: Array.isArray(programmeData.projects) ? programmeData.projects : [],
    status: programmeData.status || 'active',
    display_order: Number(programmeData.displayOrder || 0),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('programmes')
    .insert([payload])
    .select()
    .single();

  if (error) handleDbError('createProgramme', error);
  return {
    ...data,
    fullTitle: data.full_title,
    titleTamil: data.title_tamil,
    imageUrl: data.image_url,
  };
}

export async function updateProgramme(id, programmeData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }

  const payload = {
    title: programmeData.title,
    full_title: programmeData.fullTitle || programmeData.title,
    title_tamil: programmeData.titleTamil || '',
    category: programmeData.category,
    icon: programmeData.icon,
    image_url: programmeData.imageUrl,
    description: programmeData.description,
    details: programmeData.details,
    highlights: programmeData.highlights,
    projects: programmeData.projects,
    status: programmeData.status || 'active',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('programmes')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) handleDbError('updateProgramme', error);
  return {
    ...data,
    fullTitle: data.full_title,
    titleTamil: data.title_tamil,
    imageUrl: data.image_url,
  };
}

export async function deleteProgramme(id) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }
  const { error } = await supabase.from('programmes').delete().eq('id', id);
  if (error) handleDbError('deleteProgramme', error);
  return true;
}

// ==============================================================================
// 3. CAMPAIGNS
// ==============================================================================
export async function fetchCampaigns() {
  if (!isSupabaseConfigured() || !supabase) {
    return initialData.campaigns;
  }
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((c) => ({
        ...c,
        fullTitle: c.full_title || c.fullTitle || c.title,
        shortDescription: c.short_description || c.shortDescription || c.description,
        fullDescription: c.full_description || c.fullDescription || '',
        goalAmount: Number(c.goal_amount ?? c.goalAmount ?? 0),
        raisedAmount: Number(c.raised_amount ?? c.raisedAmount ?? 0),
        donorsCount: Number(c.donors_count ?? c.donorsCount ?? 0),
        startDate: c.start_date || c.startDate || '',
        endDate: c.end_date || c.endDate || '',
        imageUrl: c.image_url || c.imageUrl,
        cloudinaryPublicId: c.cloudinary_public_id || c.cloudinaryPublicId || null,
        publicationStatus: c.publication_status || c.publicationStatus || 'published',
      }));
    }
    return initialData.campaigns;
  } catch (err) {
    console.warn('[Supabase] Could not fetch campaigns from database, using verified initial campaigns.', err);
    return initialData.campaigns;
  }
}

export async function createCampaign(campaignData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }

  const id = campaignData.id || `camp-${Date.now()}`;
  const slug = campaignData.slug || campaignData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const payload = {
    id,
    slug,
    title: campaignData.title,
    full_title: campaignData.fullTitle || campaignData.title,
    category: campaignData.category,
    description: campaignData.description,
    short_description: campaignData.shortDescription || campaignData.description,
    full_description: campaignData.fullDescription || '',
    goal_amount: Number(campaignData.goalAmount || 0),
    raised_amount: Number(campaignData.raisedAmount || 0),
    donors_count: Number(campaignData.donorsCount || 0),
    start_date: campaignData.startDate || '',
    end_date: campaignData.endDate || '',
    image_url: campaignData.imageUrl || null,
    cloudinary_public_id: campaignData.cloudinaryPublicId || null,
    status: campaignData.status || 'active',
    publication_status: campaignData.publicationStatus || 'published',
    location: campaignData.location || 'Dharmapuri, Tamil Nadu',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('campaigns')
    .insert([payload])
    .select()
    .single();

  if (error) handleDbError('createCampaign', error);
  return {
    ...data,
    fullTitle: data.full_title,
    shortDescription: data.short_description,
    fullDescription: data.full_description,
    goalAmount: Number(data.goal_amount),
    raisedAmount: Number(data.raised_amount),
    donorsCount: Number(data.donors_count),
    startDate: data.start_date,
    endDate: data.end_date,
    imageUrl: data.image_url,
    cloudinaryPublicId: data.cloudinary_public_id || null,
    publicationStatus: data.publication_status,
  };
}

export async function updateCampaign(id, campaignData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }

  const payload = {
    title: campaignData.title,
    full_title: campaignData.fullTitle || campaignData.title,
    category: campaignData.category,
    description: campaignData.description,
    short_description: campaignData.shortDescription || campaignData.description,
    full_description: campaignData.fullDescription || '',
    goal_amount: Number(campaignData.goalAmount || 0),
    raised_amount: Number(campaignData.raisedAmount || 0),
    donors_count: Number(campaignData.donorsCount || 0),
    start_date: campaignData.startDate || '',
    end_date: campaignData.endDate || '',
    image_url: campaignData.imageUrl || null,
    cloudinary_public_id: campaignData.cloudinaryPublicId || null,
    status: campaignData.status || 'active',
    publication_status: campaignData.publicationStatus || 'published',
    location: campaignData.location,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('campaigns')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) handleDbError('updateCampaign', error);
  return {
    ...data,
    fullTitle: data.full_title,
    shortDescription: data.short_description,
    fullDescription: data.full_description,
    goalAmount: Number(data.goal_amount),
    raisedAmount: Number(data.raised_amount),
    donorsCount: Number(data.donors_count),
    startDate: data.start_date,
    endDate: data.end_date,
    imageUrl: data.image_url,
    cloudinaryPublicId: data.cloudinary_public_id || null,
    publicationStatus: data.publication_status,
  };
}

export async function deleteCampaign(id) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }
  const { error } = await supabase.from('campaigns').delete().eq('id', id);
  if (error) handleDbError('deleteCampaign', error);
  return true;
}

// ==============================================================================
// 4. IMPACT METRICS
// ==============================================================================
export async function fetchImpactMetrics() {
  if (!isSupabaseConfigured() || !supabase) {
    return initialData.impact.stats;
  }
  try {
    const { data, error } = await supabase
      .from('impact_metrics')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) return data;
    return initialData.impact.stats;
  } catch (err) {
    console.warn('[Supabase] Could not fetch impact_metrics from database, using verified stats.', err);
    return initialData.impact.stats;
  }
}

export async function createImpactMetric(metricData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }

  const id = metricData.id || `stat-${Date.now()}`;
  const payload = {
    id,
    label: metricData.label,
    value: metricData.value,
    description: metricData.description || '',
    icon: metricData.icon || 'CheckCircle2',
    display_order: Number(metricData.displayOrder || 0),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('impact_metrics')
    .insert([payload])
    .select()
    .single();

  if (error) handleDbError('createImpactMetric', error);
  return data;
}

export async function updateImpactMetric(id, metricData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }

  const payload = {
    label: metricData.label,
    value: metricData.value,
    description: metricData.description,
    icon: metricData.icon,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('impact_metrics')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) handleDbError('updateImpactMetric', error);
  return data;
}

export async function deleteImpactMetric(id) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }
  const { error } = await supabase.from('impact_metrics').delete().eq('id', id);
  if (error) handleDbError('deleteImpactMetric', error);
  return true;
}

// ==============================================================================
// 5. GALLERY ITEMS & SUPABASE STORAGE
// ==============================================================================
export async function fetchGalleryItems() {
  if (!isSupabaseConfigured() || !supabase) {
    return initialData.gallery;
  }
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((g) => ({
        ...g,
        imageUrl: g.image_url || g.imageUrl,
        mediaType: g.media_type || 'image',
        cloudinaryPublicId: g.cloudinary_public_id || undefined,
      }));
    }
    return initialData.gallery;
  } catch (err) {
    console.warn('[Supabase] Could not fetch gallery from database, using verified gallery.', err);
    return initialData.gallery;
  }
}

export async function uploadGalleryMedia(file) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Database is not configured.');

  const { file: processedFile, mediaType } = await processGalleryMedia(file);
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error('Could not verify the administrator session.');
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('Administrator sign-in is required to upload media.');

  const signatureResponse = await fetch('/api/cloudinary-signature', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mediaType }),
  });
  if (signatureResponse.status === 404) {
    throw new Error(
      'Cloudinary upload API was not found. Stop the Vite-only server and start the app with "npm run dev:cloudinary".'
    );
  }
  if (!signatureResponse.headers.get('content-type')?.includes('application/json')) {
    throw new Error(
      'Cloudinary upload API returned an unexpected response. Start the app with "npm run dev:cloudinary".'
    );
  }
  const signatureData = await signatureResponse.json();
  if (!signatureResponse.ok) {
    throw new Error(signatureData.error || 'Could not authorize the Cloudinary upload.');
  }

  const formData = new FormData();
  formData.append('file', processedFile);
  formData.append('api_key', signatureData.apiKey);
  formData.append('timestamp', String(signatureData.timestamp));
  formData.append('public_id', signatureData.publicId);
  formData.append('allowed_formats', signatureData.allowedFormats);
  formData.append('overwrite', 'false');
  formData.append('signature', signatureData.signature);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${signatureData.resourceType}/upload`,
    { method: 'POST', body: formData }
  );
  const uploadData = await uploadResponse.json();
  if (!uploadResponse.ok) {
    throw new Error(uploadData.error?.message || 'Cloudinary upload failed.');
  }

  return {
    publicUrl: uploadData.secure_url,
    publicId: uploadData.public_id,
    mediaType,
  };
}

export async function deleteCloudinaryMedia(publicId, mediaType) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error('Could not verify the administrator session.');
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('Administrator sign-in is required to delete media.');

  const response = await fetch('/api/cloudinary-delete', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId, mediaType }),
  });
  if (response.status === 404) {
    throw new Error(
      'Cloudinary delete API was not found. Stop the Vite-only server and start the app with "npm run dev:cloudinary".'
    );
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error(
      'Cloudinary delete API returned an unexpected response. Start the app with "npm run dev:cloudinary".'
    );
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Cloudinary could not delete the media.');
}

export async function createGalleryItem(itemData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }

  const id = itemData.id || `gal-${Date.now()}`;
  const payload = {
    id,
    title: itemData.title,
    category: itemData.category || 'Events',
    image_url: itemData.imageUrl,
    media_type: itemData.mediaType || 'image',
    cloudinary_public_id: itemData.cloudinaryPublicId || null,
    status: itemData.status || 'published',
    display_order: Number(itemData.displayOrder || 0),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('gallery_items')
    .insert([payload])
    .select()
    .single();

  if (error) handleDbError('createGalleryItem', error);
  return {
    ...data,
    imageUrl: data.image_url,
    mediaType: data.media_type || 'image',
    cloudinaryPublicId: data.cloudinary_public_id || undefined,
  };
}

export async function updateGalleryItem(id, itemData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }

  const payload = {
    title: itemData.title,
    category: itemData.category,
    image_url: itemData.imageUrl,
    media_type: itemData.mediaType || 'image',
    cloudinary_public_id: itemData.cloudinaryPublicId || null,
    status: itemData.status,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('gallery_items')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) handleDbError('updateGalleryItem', error);
  return {
    ...data,
    imageUrl: data.image_url,
    mediaType: data.media_type || 'image',
    cloudinaryPublicId: data.cloudinary_public_id || undefined,
  };
}

export async function deleteGalleryItem(id) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }
  const { data: item, error: fetchError } = await supabase
    .from('gallery_items')
    .select('cloudinary_public_id,media_type')
    .eq('id', id)
    .single();
  if (fetchError) handleDbError('deleteGalleryItem', fetchError);

  if (item.cloudinary_public_id) {
    await deleteCloudinaryMedia(item.cloudinary_public_id, item.media_type || 'image');
  }

  const { error } = await supabase.from('gallery_items').delete().eq('id', id);
  if (error) handleDbError('deleteGalleryItem', error);
  return true;
}

// ==============================================================================
// 6. CAREERS
// ==============================================================================
export async function fetchCareers() {
  if (!isSupabaseConfigured() || !supabase) {
    return initialData.careers;
  }
  try {
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((c) => ({
        ...c,
        publicationStatus: c.publication_status || c.publicationStatus || 'published',
        postedDate: c.posted_date || c.postedDate || '',
      }));
    }
    return initialData.careers;
  } catch (err) {
    console.warn('[Supabase] Could not fetch careers from database, using verified careers.', err);
    return initialData.careers;
  }
}

export async function createCareer(careerData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }

  const id = careerData.id || `career-${Date.now()}`;
  const payload = {
    id,
    title: careerData.title,
    location: careerData.location,
    type: careerData.type || 'Full-time',
    description: careerData.description,
    skills: careerData.skills || '',
    status: careerData.status || 'open',
    publication_status: careerData.publicationStatus || 'published',
    posted_date: careerData.postedDate || new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('careers')
    .insert([payload])
    .select()
    .single();

  if (error) handleDbError('createCareer', error);
  return {
    ...data,
    publicationStatus: data.publication_status,
    postedDate: data.posted_date,
  };
}

export async function updateCareer(id, careerData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }

  const payload = {
    title: careerData.title,
    location: careerData.location,
    type: careerData.type,
    description: careerData.description,
    skills: careerData.skills,
    status: careerData.status,
    publication_status: careerData.publicationStatus,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('careers')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) handleDbError('updateCareer', error);
  return {
    ...data,
    publicationStatus: data.publication_status,
    postedDate: data.posted_date,
  };
}

export async function deleteCareer(id) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database is not configured.');
  }
  const { error } = await supabase.from('careers').delete().eq('id', id);
  if (error) handleDbError('deleteCareer', error);
  return true;
}

// ==============================================================================
// 7. DONATION PLEDGES
// ==============================================================================
export async function fetchDonationPledges() {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('donation_pledges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((p) => ({
      ...p,
      campaignId: p.campaign_id,
      campaignTitle: p.campaign_title,
      donorName: p.donor_name,
      donorEmail: p.donor_email,
      donorPhone: p.donor_phone,
      amount: Number(p.amount),
      timestamp: p.created_at,
    }));
  } catch (err) {
    console.warn('[Supabase] Could not fetch donation_pledges:', err);
    return [];
  }
}

export async function createDonationPledge(pledgeData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Database connection is not available. Please verify your Supabase configuration.');
  }

  const payload = {
    campaign_id: pledgeData.campaignId || null,
    campaign_title: pledgeData.campaignTitle || 'Rural Community Development Fund',
    amount: Number(pledgeData.amount),
    donor_name: pledgeData.donorName.trim(),
    donor_email: pledgeData.donorEmail.trim(),
    donor_phone: pledgeData.donorPhone ? pledgeData.donorPhone.trim() : null,
    message: pledgeData.message ? pledgeData.message.trim() : null,
    status: 'pledged',
  };

  const { data, error } = await supabase
    .from('donation_pledges')
    .insert([payload])
    .select()
    .single();

  if (error) handleDbError('createDonationPledge', error);
  return {
    ...data,
    campaignId: data.campaign_id,
    campaignTitle: data.campaign_title,
    donorName: data.donor_name,
    donorEmail: data.donor_email,
    donorPhone: data.donor_phone,
    amount: Number(data.amount),
    timestamp: data.created_at,
  };
}

// ==============================================================================
// 8. BATCH APPLICATION LOADER (Concurrent initialization for SiteContext)
// ==============================================================================
export async function fetchAllApplicationData() {
  const [
    siteContent,
    programmes,
    campaigns,
    impactStats,
    gallery,
    careers,
    donationPledges,
  ] = await Promise.all([
    fetchSiteContent(),
    fetchProgrammes(),
    fetchCampaigns(),
    fetchImpactMetrics(),
    fetchGalleryItems(),
    fetchCareers(),
    fetchDonationPledges(),
  ]);

  return {
    siteInfo: siteContent,
    programmes,
    campaigns,
    impact: {
      stats: impactStats,
    },
    gallery,
    careers,
    donationPledges,
    volunteerOpportunities: initialData.volunteerOpportunities || [],
  };
}
