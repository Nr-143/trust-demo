/**
 * SiteContext - Central Shared State & Synchronization Layer
 *
 * Provides reactive shared state across all public and admin views,
 * cross-tab synchronization via the browser storage event, and
 * validation-backed persistence to LocalStorage.
 */

import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import * as dbEngine from '../services/storage/localStorageEngine';
import {
  contentRepository,
  programmesRepository,
  campaignsRepository,
  impactRepository,
  volunteerOpportunitiesRepository,
  volunteerApplicationsRepository,
  careersRepository,
  jobApplicationsRepository,
  galleryRepository,
  storiesRepository,
  enquiriesRepository,
  donationsRepository,
} from '../services/repositories';
import DonationModal from '../components/common/DonationModal';

const SiteContext = createContext(null);
const SiteDispatchContext = createContext(null);
const DonationModalContext = createContext(null);

function siteReducer(state, action) {
  switch (action.type) {
    // 1. Cross-Tab or Manual Database Synchronization
    case 'SYNC_FROM_STORAGE':
      return { ...action.payload };

    case 'IMPORT_DATABASE': {
      dbEngine.saveDatabase(action.payload);
      return { ...action.payload };
    }

    case 'RESET_STATE': {
      const resetData = dbEngine.resetDatabase();
      return { ...resetData };
    }

    // 2. Website Content (siteInfo)
    case 'UPDATE_SITE_INFO': {
      const { updatedDatabase } = contentRepository.update(action.payload);
      return { ...updatedDatabase };
    }

    // 3. Programmes
    case 'ADD_PROGRAMME': {
      const { updatedDatabase } = programmesRepository.create(action.payload);
      return { ...updatedDatabase };
    }
    case 'UPDATE_PROGRAMME': {
      const { updatedDatabase } = programmesRepository.update(action.payload.id, action.payload);
      return { ...updatedDatabase };
    }
    case 'DELETE_PROGRAMME': {
      const { updatedDatabase } = programmesRepository.delete(action.payload);
      return { ...updatedDatabase };
    }
    case 'PUBLISH_PROGRAMME': {
      const { updatedDatabase } = programmesRepository.publish(action.payload);
      return { ...updatedDatabase };
    }
    case 'ARCHIVE_PROGRAMME': {
      const { updatedDatabase } = programmesRepository.archive(action.payload);
      return { ...updatedDatabase };
    }

    // 4. Campaigns
    case 'ADD_CAMPAIGN': {
      const { updatedDatabase } = campaignsRepository.create(action.payload);
      return { ...updatedDatabase };
    }
    case 'UPDATE_CAMPAIGN': {
      const { updatedDatabase } = campaignsRepository.update(action.payload.id, action.payload);
      return { ...updatedDatabase };
    }
    case 'DELETE_CAMPAIGN': {
      const { updatedDatabase } = campaignsRepository.delete(action.payload);
      return { ...updatedDatabase };
    }
    case 'PUBLISH_CAMPAIGN': {
      const { updatedDatabase } = campaignsRepository.publish(action.payload);
      return { ...updatedDatabase };
    }
    case 'ARCHIVE_CAMPAIGN': {
      const { updatedDatabase } = campaignsRepository.archive(action.payload);
      return { ...updatedDatabase };
    }

    // 5. Impact Statistics
    case 'UPDATE_IMPACT': {
      const { updatedDatabase } = impactRepository.updateMeta(action.payload);
      return { ...updatedDatabase };
    }
    case 'ADD_IMPACT_STAT': {
      const { updatedDatabase } = impactRepository.createStat(action.payload);
      return { ...updatedDatabase };
    }
    case 'UPDATE_IMPACT_STAT': {
      const { updatedDatabase } = impactRepository.updateStat(action.payload.id, action.payload);
      return { ...updatedDatabase };
    }
    case 'DELETE_IMPACT_STAT': {
      const { updatedDatabase } = impactRepository.deleteStat(action.payload);
      return { ...updatedDatabase };
    }

    // 6. Volunteer Applications
    case 'ADD_VOLUNTEER':
    case 'ADD_VOLUNTEER_APPLICATION': {
      const { updatedDatabase } = volunteerApplicationsRepository.create(action.payload);
      // Synchronize legacy `volunteers` array
      updatedDatabase.volunteers = updatedDatabase.volunteerApplications;
      dbEngine.saveDatabase(updatedDatabase);
      return { ...updatedDatabase };
    }
    case 'UPDATE_VOLUNTEER':
    case 'UPDATE_VOLUNTEER_APPLICATION': {
      const { updatedDatabase } = volunteerApplicationsRepository.update(action.payload.id, action.payload);
      updatedDatabase.volunteers = updatedDatabase.volunteerApplications;
      dbEngine.saveDatabase(updatedDatabase);
      return { ...updatedDatabase };
    }
    case 'DELETE_VOLUNTEER':
    case 'DELETE_VOLUNTEER_APPLICATION': {
      const { updatedDatabase } = volunteerApplicationsRepository.delete(action.payload);
      updatedDatabase.volunteers = updatedDatabase.volunteerApplications;
      dbEngine.saveDatabase(updatedDatabase);
      return { ...updatedDatabase };
    }
    case 'APPROVE_VOLUNTEER_APPLICATION': {
      const { updatedDatabase } = volunteerApplicationsRepository.approve(action.payload);
      updatedDatabase.volunteers = updatedDatabase.volunteerApplications;
      dbEngine.saveDatabase(updatedDatabase);
      return { ...updatedDatabase };
    }
    case 'SET_VOLUNTEER_APPLICATION_STATUS': {
      const { updatedDatabase } = volunteerApplicationsRepository.update(action.payload.id, {
        status: action.payload.status,
      });
      updatedDatabase.volunteers = updatedDatabase.volunteerApplications;
      dbEngine.saveDatabase(updatedDatabase);
      return { ...updatedDatabase };
    }
    case 'ARCHIVE_VOLUNTEER_APPLICATION': {
      const { updatedDatabase } = volunteerApplicationsRepository.archive(action.payload);
      updatedDatabase.volunteers = updatedDatabase.volunteerApplications;
      dbEngine.saveDatabase(updatedDatabase);
      return { ...updatedDatabase };
    }

    // 7. Volunteer Opportunities
    case 'ADD_VOLUNTEER_OPPORTUNITY': {
      const { updatedDatabase } = volunteerOpportunitiesRepository.create(action.payload);
      return { ...updatedDatabase };
    }
    case 'UPDATE_VOLUNTEER_OPPORTUNITY': {
      const { updatedDatabase } = volunteerOpportunitiesRepository.update(action.payload.id, action.payload);
      return { ...updatedDatabase };
    }
    case 'DELETE_VOLUNTEER_OPPORTUNITY': {
      const { updatedDatabase } = volunteerOpportunitiesRepository.delete(action.payload);
      return { ...updatedDatabase };
    }

    // 8. Careers
    case 'ADD_CAREER': {
      const { updatedDatabase } = careersRepository.create(action.payload);
      return { ...updatedDatabase };
    }
    case 'UPDATE_CAREER': {
      const { updatedDatabase } = careersRepository.update(action.payload.id, action.payload);
      return { ...updatedDatabase };
    }
    case 'DELETE_CAREER': {
      const { updatedDatabase } = careersRepository.delete(action.payload);
      return { ...updatedDatabase };
    }
    case 'CLOSE_CAREER': {
      const { updatedDatabase } = careersRepository.close(action.payload);
      return { ...updatedDatabase };
    }
    case 'PUBLISH_CAREER': {
      const { updatedDatabase } = careersRepository.publish(action.payload);
      return { ...updatedDatabase };
    }
    case 'UNPUBLISH_CAREER': {
      const { updatedDatabase } = careersRepository.unpublish(action.payload);
      return { ...updatedDatabase };
    }
    case 'ARCHIVE_CAREER': {
      const { updatedDatabase } = careersRepository.archive(action.payload);
      return { ...updatedDatabase };
    }

    // 9. Job Applications
    case 'ADD_JOB_APPLICATION': {
      const { updatedDatabase } = jobApplicationsRepository.create(action.payload);
      return { ...updatedDatabase };
    }
    case 'UPDATE_JOB_APPLICATION_STATUS': {
      const { updatedDatabase } = jobApplicationsRepository.update(action.payload.id, {
        status: action.payload.status,
      });
      return { ...updatedDatabase };
    }
    case 'DELETE_JOB_APPLICATION': {
      const { updatedDatabase } = jobApplicationsRepository.delete(action.payload);
      return { ...updatedDatabase };
    }

    // 9. Gallery Items
    case 'ADD_GALLERY_ITEM': {
      const { updatedDatabase } = galleryRepository.create(action.payload);
      return { ...updatedDatabase };
    }
    case 'UPDATE_GALLERY_ITEM': {
      const { updatedDatabase } = galleryRepository.update(action.payload.id, action.payload);
      return { ...updatedDatabase };
    }
    case 'DELETE_GALLERY_ITEM': {
      const { updatedDatabase } = galleryRepository.delete(action.payload);
      return { ...updatedDatabase };
    }
    case 'PUBLISH_GALLERY_ITEM': {
      const { updatedDatabase } = galleryRepository.publish(action.payload);
      return { ...updatedDatabase };
    }
    case 'ARCHIVE_GALLERY_ITEM': {
      const { updatedDatabase } = galleryRepository.archive(action.payload);
      return { ...updatedDatabase };
    }

    // 10. Stories
    case 'ADD_STORY': {
      const { updatedDatabase } = storiesRepository.create(action.payload);
      return { ...updatedDatabase };
    }
    case 'UPDATE_STORY': {
      const { updatedDatabase } = storiesRepository.update(action.payload.id, action.payload);
      return { ...updatedDatabase };
    }
    case 'DELETE_STORY': {
      const { updatedDatabase } = storiesRepository.delete(action.payload);
      return { ...updatedDatabase };
    }
    case 'PUBLISH_STORY': {
      const { updatedDatabase } = storiesRepository.publish(action.payload);
      return { ...updatedDatabase };
    }
    case 'ARCHIVE_STORY': {
      const { updatedDatabase } = storiesRepository.archive(action.payload);
      return { ...updatedDatabase };
    }

    // 11. Contact Enquiries
    case 'ADD_CONTACT_ENQUIRY': {
      const { updatedDatabase } = enquiriesRepository.create(action.payload);
      return { ...updatedDatabase };
    }
    case 'UPDATE_CONTACT_ENQUIRY': {
      const { updatedDatabase } = enquiriesRepository.update(action.payload.id, action.payload);
      return { ...updatedDatabase };
    }
    case 'DELETE_CONTACT_ENQUIRY': {
      const { updatedDatabase } = enquiriesRepository.delete(action.payload);
      return { ...updatedDatabase };
    }
    case 'MARK_ENQUIRY_READ': {
      const { updatedDatabase } = enquiriesRepository.markAsRead(action.payload);
      return { ...updatedDatabase };
    }
    case 'MARK_ENQUIRY_RESPONDED': {
      const { updatedDatabase } = enquiriesRepository.markAsResponded(action.payload);
      return { ...updatedDatabase };
    }

    // 12. Demo Donations
    case 'RECORD_DONATION': {
      const { updatedDatabase } = donationsRepository.recordDonation(action.payload);
      return { ...updatedDatabase };
    }

    default:
      return state;
  }
}

export function SiteProvider({ children }) {
  // Load state once on mount from resilient LocalStorage engine
  const [state, dispatch] = useReducer(siteReducer, null, () => {
    return dbEngine.loadDatabase();
  });

  // Global Donation Modal Controller
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

  // Multi-tab synchronization: listen to storage event on window
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e) => {
      if (e.key === dbEngine.STORAGE_KEY && e.newValue) {
        try {
          const freshData = JSON.parse(e.newValue);
          dispatch({ type: 'SYNC_FROM_STORAGE', payload: freshData });
        } catch (err) {
          console.error('Failed to parse storage update from another browser tab:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <SiteContext.Provider value={state}>
      <SiteDispatchContext.Provider value={dispatch}>
        <DonationModalContext.Provider value={{ openDonationModal, closeDonationModal }}>
          {children}

          {/* Global Interactive Donation Modal */}
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
