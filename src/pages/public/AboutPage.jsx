import PageHeader from '../../components/common/PageHeader';
import { useSite } from '../../context/SiteContext';
import { Heart, Target, Eye, Users, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  const { siteInfo } = useSite();

  return (
    <>
      <PageHeader
        title="About Mannin Maindhan Grama Arakattalai"
        titleTamil="எங்களைப் பற்றி • மண்ணின் மைந்தன் கிராம அறக்கட்டளை"
        description="A grassroots rural development trust anchored in Dharmapuri, working directly with village communities to foster sustainable, self-reliant change."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 text-[#176B36] rounded-2xl">
                <Target size={24} />
              </div>
              <h2 className="text-xl font-bold text-[#173B2A]">Our Mission</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              To empower rural hamlets and agrarian families in Tamil Nadu through holistic initiatives
              spanning foundational education, safe drinking water, preventive healthcare, native afforestation,
              and sustainable livelihood skills — ensuring dignity and lasting self-reliance for every villager.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                <Eye size={24} />
              </div>
              <h2 className="text-xl font-bold text-[#173B2A]">Our Vision</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              A vibrant Tamil Nadu where every rural village thrives with clean water security, well-equipped
              learning spaces for children, accessible primary healthcare, green ecological canopy, and
              empowered rural youth leading community progress.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#173B2A]">Our Guiding Values</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Ethical principles steering every community decision and field project.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Heart,
                title: 'Compassion & Service',
                desc: 'We serve with genuine respect and heartfelt empathy for rural households.',
              },
              {
                icon: Users,
                title: 'Community Ownership',
                desc: 'Every project is shaped with democratic participation of local elders and youth.',
              },
              {
                icon: ShieldCheck,
                title: 'Uncompromising Integrity',
                desc: 'We adhere to complete honesty, open books, and factual reporting of all activities.',
              },
              {
                icon: Target,
                title: 'Ecological Sustainability',
                desc: 'We build climate-resilient solutions that rejuvenate soil, groundwater, and local biodiversity.',
              },
            ].map((value, index) => (
              <div key={index} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs">
                <value.icon size={22} className="text-[#176B36] mb-3" />
                <h3 className="font-bold text-sm text-[#173B2A]">{value.title}</h3>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Profile & Verified Contact */}
        <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-2xs text-center max-w-3xl mx-auto">
          <img
            src={siteInfo.logoFull || '/images/logo-full.jpeg'}
            alt={siteInfo.name}
            className="h-28 w-28 rounded-full object-cover mx-auto mb-4 ring-4 ring-emerald-500/20"
          />
          <h2 className="text-2xl font-bold text-[#173B2A]">{siteInfo.name}</h2>
          <p className="text-base text-gray-500 font-tamil font-medium mt-1">{siteInfo.nameTamil}</p>
          
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#176B36]" />
              <span>{siteInfo.address}</span>
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <Phone size={13} className="text-[#176B36]" />
              <a href={`tel:${siteInfo.phoneRaw}`} className="hover:text-primary">
                {siteInfo.phone}
              </a>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={13} className="text-[#176B36]" />
              <a href={`mailto:${siteInfo.email}`} className="hover:text-primary">
                {siteInfo.email}
              </a>
            </span>
          </div>

          <p className="text-xs text-gray-400 mt-6 max-w-md mx-auto pt-4 border-t border-stone-100">
            Official government trust registration documents and certification copies will be
            published on this transparency page upon formal ratification by the board of trustees.
          </p>
        </div>

      </div>
    </>
  );
}
