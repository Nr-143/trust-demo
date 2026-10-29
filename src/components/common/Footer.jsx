import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, MessageCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { formatWhatsAppDisplay, getWhatsAppUrl, getDialablePhone } from '../../utils/helpers';

export default function Footer() {
  const { siteInfo } = useSite();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#173B2A] text-white">
      {/* Top Pre-Footer Callout */}
      <div className="border-b border-emerald-900/60 bg-[#122e21]">
        <div className="site-container py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                Together for Rural Tamil Nadu
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Have questions or want to partner with us on the ground?
              </h2>
              <p className="text-sm text-white/75 mt-1">
                Reach out directly via phone or WhatsApp. Our field coordination team in {siteInfo.district || 'Dharmapuri'} is ready to connect.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href={siteInfo.whatsappUrl || getWhatsAppUrl(siteInfo.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
              >
                <MessageCircle size={16} />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`tel:${getDialablePhone(siteInfo.phoneRaw || siteInfo.phone)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/20 transition-colors"
              >
                <Phone size={16} />
                <span>Call {siteInfo.phone || '+91 99942 91195'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="site-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand & Mission */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3.5 mb-4">
              <img
                src={siteInfo.logoBadge || '/images/originalLogo.jpeg'}
                alt={siteInfo.shortName}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/40 bg-white"
                onError={(e) => {
                  e.currentTarget.src = '/images/originalLogo.jpeg';
                }}
              />
              <div>
                <p className="font-bold text-base text-white">{siteInfo.name}</p>
                <p className="text-xs text-white/70 font-tamil font-medium leading-tight">
                  {siteInfo.nameTamil}
                </p>
              </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed mb-5">
              {siteInfo.footerAboutText ||
                'A community-rooted charitable trust dedicated to holistic rural development in Dharmapuri and across Tamil Nadu through education, clean water, healthcare, environmental protection, and sustainable livelihoods.'}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white/80">
              <ShieldCheck size={14} className="text-accent shrink-0" />
              <span>Registered Rural Development Trust</span>
            </div>
          </div>

          {/* Core Programmes (6 verticals) */}
          <div className="lg:col-span-3">
            <h3 className="font-semibold text-sm mb-4 text-accent tracking-wide uppercase">
              Our 6 Focus Verticals
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { name: 'Education', to: '/programmes/education' },
                { name: 'Livelihood & Women Empowerment', to: '/programmes/livelihood-development-women-empowerment' },
                { name: 'Drug-Free & Sports Development', to: '/programmes/drug-free-communities-sports-development' },
                { name: 'Environment & Renewable Energy', to: '/programmes/environmental-protection-renewable-energy' },
                { name: 'Sanitation & Healthcare', to: '/programmes/sanitation-healthcare' },
                { name: 'Community Water Management', to: '/programmes/community-water-management' },
              ].map((prog) => (
                <li key={prog.name}>
                  <Link
                    to={prog.to}
                    className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span className="h-1 w-1 rounded-full bg-accent group-hover:w-2 transition-all"></span>
                    <span>{prog.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links & Transparency */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-sm mb-4 text-accent tracking-wide uppercase">
              Organization
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/about', label: 'About Our Trust' },
                { to: '/programmes', label: 'All Programmes' },
                { to: '/campaigns', label: 'Active Campaigns' },
                { to: '/impact', label: 'Impact & Reports' },
                { to: '/volunteer', label: 'Become a Volunteer' },
                { to: '/careers', label: 'Careers & Field Roles' },
                { to: '/gallery', label: 'Community Gallery' },
                { to: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Registered Address & Contact */}
          <div className="lg:col-span-3">
            <h3 className="font-semibold text-sm mb-4 text-accent tracking-wide uppercase">
              Trust Contact & Location
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-accent mt-1 shrink-0" />
                <span className="text-white/80 leading-relaxed text-xs sm:text-sm">
                  {siteInfo.address}
                </span>
              </li>

              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-accent shrink-0" />
                <a
                  href={`tel:${getDialablePhone(siteInfo.phoneRaw || siteInfo.phone)}`}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {siteInfo.phone || '+91 99942 91195'}
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-accent shrink-0" />
                <a
                  href={`mailto:${siteInfo.email}`}
                  className="text-white/80 hover:text-white transition-colors break-all"
                >
                  {siteInfo.email}
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <MessageCircle size={16} className="text-accent shrink-0" />
                <a
                  href={siteInfo.whatsappUrl || getWhatsAppUrl(siteInfo.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  WhatsApp: {formatWhatsAppDisplay(siteInfo.whatsappNumber)}
                </a>
              </li>
            </ul>

            <div className="mt-5 pt-4 border-t border-white/10">
              <Link
                to="/donate"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#FF9800] hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Heart size={14} className="fill-current" />
                <span>Support Our Projects</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Note */}
        <div className="mt-12 pt-6 border-t border-white/15">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
            <p>
              © {currentYear} {siteInfo.footerCopyright || `${siteInfo.name} (${siteInfo.nameTamil}). All rights reserved.`}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
