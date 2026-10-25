import { Link } from 'react-router-dom';
import { Users, Heart, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { getWhatsAppUrl } from '../../utils/helpers';

export default function VolunteerCTASection() {
  const { siteInfo } = useSite();

  return (
    <section className="bg-white py-16 sm:py-20 border-b border-gray-100" id="volunteer">
      <div className="site-container">
        
        <div className="relative rounded-3xl overflow-hidden bg-[#173B2A] text-white p-8 sm:p-12 lg:p-16 shadow-xl">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading and Messaging */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-accent border border-white/15 mb-4">
                <Sparkles size={13} className="text-accent" />
                <span>Join Our Field Volunteer Network</span>
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Lend Your Time & Skills for Tamil Nadu's Villages
              </h2>

              <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6 font-normal">
                Whether you are a student, teacher, doctor, software professional, or farmer — your
                presence makes an enduring difference. Help teach children, organize village medical
                checkups, or plant native saplings in Palacode.
              </p>

              {/* Roles Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  'Weekend Evening Tuition Mentors',
                  'Water Testing & Filter Monitoring',
                  'Tree Planting & Green Ambassadors',
                  'Free Health Camp Logistics Support',
                ].map((role, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-accent shrink-0" />
                    <span className="text-xs sm:text-sm text-white/90 font-medium">{role}</span>
                  </div>
                ))}
              </div>

              {/* Direct Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/volunteer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF9800] hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-sm shadow-md transition-all duration-150 transform hover:-translate-y-0.5"
                >
                  <Users size={16} />
                  <span>Register as a Volunteer</span>
                  <ArrowRight size={15} />
                </Link>

                <a
                  href={siteInfo.whatsappUrl || getWhatsAppUrl(siteInfo.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/20 transition-colors"
                >
                  <span>Quick Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Column: Visual Stat Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-accent text-[#173B2A] font-bold">
                      <Heart size={22} className="fill-[#173B2A]" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">Community First</p>
                      <p className="text-xs text-white/70">Grassroots Volunteer Spirit</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-6">
                    "When village youth come together, every dry pond can be revitalized and every child
                    can access quality education. We believe change begins with the people of the soil."
                  </p>
                </div>

                <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
                  <span>Based in Dharmapuri, TN</span>
                  <span className="text-accent font-semibold">100% Non-Profit Trust</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

