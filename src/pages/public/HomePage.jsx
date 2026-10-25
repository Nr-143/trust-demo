import HeroSection from '../../components/public/HeroSection';
import ImpactSection from '../../components/public/ImpactSection';
import ProgrammesSection from '../../components/public/ProgrammesSection';
import FeaturedCampaignsSection from '../../components/public/FeaturedCampaignsSection';
import CommunityStoriesSection from '../../components/public/CommunityStoriesSection';
import VolunteerCTASection from '../../components/public/VolunteerCTASection';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Impact Section with Configurable Stat Cards */}
      <ImpactSection />

      {/* 3. Programmes Section (All 6 Distinct Verticals) */}
      <ProgrammesSection />

      {/* 4. Featured Campaigns (3 Demonstration Causes) */}
      <FeaturedCampaignsSection />

      {/* 5. Community Stories & Field Activities */}
      <CommunityStoriesSection />

      {/* 6. Volunteer Call-To-Action */}
      <VolunteerCTASection />
    </div>
  );
}
