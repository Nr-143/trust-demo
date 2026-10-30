import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ScrollToTop from './components/common/ScrollToTop';

// Public pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ProgrammesPage from './pages/public/ProgrammesPage';
import ProgrammeDetailPage from './pages/public/ProgrammeDetailPage';
import CampaignsPage from './pages/public/CampaignsPage';
import CampaignDetailPage from './pages/public/CampaignDetailPage';
import ImpactPage from './pages/public/ImpactPage';
import VolunteerPage from './pages/public/VolunteerPage';
import CareersPage from './pages/public/CareersPage';
import GalleryPage from './pages/public/GalleryPage';
import ContactPage from './pages/public/ContactPage';
import DonatePage from './pages/public/DonatePage';
import NotFoundPage from './pages/public/NotFoundPage';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminContent from './pages/admin/AdminContent';
import AdminProgrammes from './pages/admin/AdminProgrammes';
import AdminCampaigns from './pages/admin/AdminCampaigns';
import AdminImpact from './pages/admin/AdminImpact';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminVolunteers from './pages/admin/AdminVolunteers';
import AdminCareers from './pages/admin/AdminCareers';
import AdminGallery from './pages/admin/AdminGallery';
import AdminSettings from './pages/admin/AdminSettings';
import AdminDonationDetails from './pages/admin/AdminDonationDetails';
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/programmes" element={<ProgrammesPage />} />
          <Route path="/programmes/:slug" element={<ProgrammeDetailPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:slug" element={<CampaignDetailPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Authentication */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="programmes" element={<AdminProgrammes />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="impact" element={<AdminImpact />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="volunteers" element={<AdminVolunteers />} />
          <Route path="careers" element={<AdminCareers />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="donation-details" element={<AdminDonationDetails />} />
        </Route>
      </Routes>
    </>
  );
}
