/**
 * SiteContext - Central Database-Backed Shared State Layer
 *
 * Provides reactive data across all public and admin views.
 * Authoritative data is persisted directly in Supabase.
 */

import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { initialData } from '../data/initialData.js';
import { fetchAllApplicationData } from '../services/supabaseService.js';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js';
import DonationModal from '../components/common/DonationModal';

const SiteContext = createContext(null);
const SiteDispatchContext = createContext(null);
const DonationModalContext = createContext(null);

function siteReducer(state, action) {
  switch (action.type) {
    case 'SET_INITIAL_STATE':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    // 1. Website Content (siteInfo)
    case 'UPDATE_SITE_INFO': {
      return {
        ...state,
        siteInfo: { ...state.siteInfo, ...action.payload },
      };
    }

    // 2. Programmes
    case 'ADD_PROGRAMME': {
      const programmes = state.programmes || [];
      return {
        ...state,
        programmes: [action.payload, ...programmes],
      };
    }
    case 'UPDATE_PROGRAMME': {
      const programmes = (state.programmes || []).map((p) =>
        p.id === action.payload.id ? { ...p, ...action.payload } : p
      );
      return { ...state, programmes };
    }
    case 'DELETE_PROGRAMME': {
      const programmes = (state.programmes || []).filter((p) => p.id !== action.payload);
      return { ...state, programmes };
    }

    // 3. Campaigns
    case 'ADD_CAMPAIGN': {
      const campaigns = state.campaigns || [];
      return {
        ...state,
        campaigns: [action.payload, ...campaigns],
      };
    }
    case 'UPDATE_CAMPAIGN': {
      const campaigns = (state.campaigns || []).map((c) =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      );
      return { ...state, campaigns };
    }
    case 'DELETE_CAMPAIGN': {
      const campaigns = (state.campaigns || []).filter((c) => c.id !== action.payload);
      return { ...state, campaigns };
    }

    // 4. Impact Statistics
    case 'UPDATE_IMPACT': {
      return {
        ...state,
        impact: { ...state.impact, ...action.payload },
      };
    }
    case 'ADD_IMPACT_STAT': {
      const stats = state.impact?.stats || [];
      return {
        ...state,
        impact: {
          ...state.impact,
          stats: [...stats, action.payload],
        },
      };
    }
    case 'UPDATE_IMPACT_STAT': {
      const stats = (state.impact?.stats || []).map((s) =>
        s.id === action.payload.id ? { ...s, ...action.payload } : s
      );
      return {
        ...state,
        impact: { ...state.impact, stats },
      };
    }
    case 'DELETE_IMPACT_STAT': {
      const stats = (state.impact?.stats || []).filter((s) => s.id !== action.payload);
      return {
        ...state,
        impact: { ...state.impact, stats },
      };
    }

    // 5. Volunteer Applications
    case 'ADD_VOLUNTEER':
    case 'ADD_VOLUNTEER_APPLICATION': {
      const list = state.volunteerApplications || [];
      const updated = [action.payload, ...list];
      return {
        ...state,
        volunteerApplications: updated,
        volunteers: updated,
      };
    }
    case 'UPDATE_VOLUNTEER':
    case 'UPDATE_VOLUNTEER_APPLICATION':
    case 'SET_VOLUNTEER_APPLICATION_STATUS': {
      const list = (state.volunteerApplications || []).map((v) =>
        v.id === action.payload.id ? { ...v, ...action.payload } : v
      );
      return {
        ...state,
        volunteerApplications: list,
        volunteers: list,
      };
    }
    case 'DELETE_VOLUNTEER':
    case 'DELETE_VOLUNTEER_APPLICATION': {
      const list = (state.volunteerApplications || []).filter((v) => v.id !== action.payload);
      return {
        ...state,
        volunteerApplications: list,
        volunteers: list,
      };
    }

    // 6. Careers
    case 'ADD_CAREER': {
      const careers = state.careers || [];
      return {
        ...state,
        careers: [action.payload, ...careers],
      };
    }
    case 'UPDATE_CAREER': {
      const careers = (state.careers || []).map((c) =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      );
      return { ...state, careers };
    }
    case 'DELETE_CAREER': {
      const careers = (state.careers || []).filter((c) => c.id !== action.payload);
      return { ...state, careers };
    }

    // 7. Job Applications
    case 'SET_JOB_APPLICATIONS': {
      return { ...state, jobApplications: action.payload };
    }
    case 'ADD_JOB_APPLICATION': {
      const apps = state.jobApplications || [];
      return {
        ...state,
        jobApplications: [action.payload, ...apps],
      };
    }
    case 'UPDATE_JOB_APPLICATION_STATUS': {
      const apps = (state.jobApplications || []).map((a) =>
        a.id === action.payload.id ? { ...a, status: action.payload.status } : a
      );
      return { ...state, jobApplications: apps };
    }
    case 'DELETE_JOB_APPLICATION': {
      const apps = (state.jobApplications || []).filter((a) => a.id !== action.payload);
      return { ...state, jobApplications: apps };
    }

    // 8. Gallery Items
    case 'ADD_GALLERY_ITEM': {
      const gallery = state.gallery || [];
      return {
        ...state,
        gallery: [action.payload, ...gallery],
      };
    }
    case 'UPDATE_GALLERY_ITEM': {
      const gallery = (state.gallery || []).map((g) =>
        g.id === action.payload.id ? { ...g, ...action.payload } : g
      );
      return { ...state, gallery };
    }
    case 'DELETE_GALLERY_ITEM': {
      const gallery = (state.gallery || []).filter((g) => g.id !== action.payload);
      return { ...state, gallery };
    }

    // 9. Contact Enquiries
    case 'SET_CONTACT_ENQUIRIES': {
      return { ...state, contactEnquiries: action.payload };
    }
    case 'SET_VOLUNTEER_APPLICATIONS': {
      return { ...state, volunteerApplications: action.payload, volunteers: action.payload };
    }
    case 'ADD_CONTACT_ENQUIRY': {
      const enqs = state.contactEnquiries || [];
      return {
        ...state,
        contactEnquiries: [action.payload, ...enqs],
      };
    }
    case 'UPDATE_CONTACT_ENQUIRY': {
      const enqs = (state.contactEnquiries || []).map((e) =>
        e.id === action.payload.id ? { ...e, ...action.payload } : e
      );
      return { ...state, contactEnquiries: enqs };
    }
    case 'DELETE_CONTACT_ENQUIRY': {
      const enqs = (state.contactEnquiries || []).filter((e) => e.id !== action.payload);
      return { ...state, contactEnquiries: enqs };
    }

    // 10. Donation Pledges
    case 'RECORD_PLEDGE':
    case 'RECORD_DONATION': {
      const pledges = state.donationPledges || state.demoDonations || [];
      return {
        ...state,
        donationPledges: [action.payload, ...pledges],
        demoDonations: [action.payload, ...pledges],
      };
    }

    default:
      return state;
  }
}

export function SiteProvider({ children }) {
  const [state, dispatch] = useReducer(siteReducer, {
    ...initialData,
    donationPledges: [],
    isLoading: true,
  });

  const loadData = useCallback(async () => {
    try {
      const cloudData = await fetchAllApplicationData();
      dispatch({ type: 'SET_INITIAL_STATE', payload: cloudData });
    } catch (err) {
      console.error('[SiteContext] Failed to load data from Supabase:', err);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    loadData();

    if (isSupabaseConfigured() && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          loadData();
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [loadData]);

  // Global Donation / Contribution Pledge Modal Controller
  const [donationModalState, setDonationModalState] = useState({
    isOpen: false,
    campaignId: null,
  });

  const openDonationModal = (campaignId = null) => {
    setDonationModalState({ isOpen: true, campaignId });
  };

  const closeDonationModal = () => {
    setDonationModalState({ isOpen: false, campaignId: null });
  };

  return (
    <SiteContext.Provider value={{ ...state, reloadSiteData: loadData }}>
      <SiteDispatchContext.Provider value={dispatch}>
        <DonationModalContext.Provider value={{ openDonationModal, closeDonationModal }}>
          {children}

          {/* Global Contribution Pledge Modal */}
          <DonationModal
            isOpen={donationModalState.isOpen}
            onClose={closeDonationModal}
            defaultCampaignId={donationModalState.campaignId}
          />
        </DonationModalContext.Provider>
      </SiteDispatchContext.Provider>
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used within SiteProvider');
  return context;
}

export function useSiteDispatch() {
  const context = useContext(SiteDispatchContext);
  if (!context) throw new Error('useSiteDispatch must be used within SiteProvider');
  return context;
}

export function useDonationModal() {
  const context = useContext(DonationModalContext);
  if (!context) throw new Error('useDonationModal must be used within SiteProvider');
  return context;
}
