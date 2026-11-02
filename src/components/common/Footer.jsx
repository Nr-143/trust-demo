import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import { useSite, useDonationModal } from '../../context/SiteContext';
import { formatWhatsAppDisplay, getWhatsAppUrl, getDialablePhone } from '../../utils/helpers';

// Authentic SVG Brand Icons
function InstagramIcon({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YoutubeIcon({ className = 'w-4 h-4', ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function Footer() {
  const { siteInfo } = useSite();
  const { openDonationModal } = useDonationModal();
  const currentYear = new Date().getFullYear();

  const instagramLink =
    siteInfo.instagramUrl || 'https://www.instagram.com/mannin_maindhan_trust?rpxt=OXkweW5jem1haGlu';
  const youtubeLink =
    siteInfo.youtubeUrl || 'https://www.youtube.com/@Mannin_Maindhan_Trust';

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

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white/80 mb-6">
              <ShieldCheck size={14} className="text-accent shrink-0" />
              <span>Registered Rural Development Trust</span>
            </div>

            {/* Social Media Badges */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2.5">
                Follow Our Field Work
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-amber-600 border border-white/10 hover:border-transparent text-xs text-white/90 hover:text-white transition-all group"
                  aria-label="Instagram Profile"
                >
                  <InstagramIcon className="w-4 h-4 text-pink-400 group-hover:text-white transition-colors" />
                  <span className="font-medium">Instagram</span>
                </a>

                <a
                  href={youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#FF0000] border border-white/10 hover:border-transparent text-xs text-white/90 hover:text-white transition-all group"
                  aria-label="YouTube Channel"
                >
                  <YoutubeIcon className="w-4 h-4 text-red-500 group-hover:text-white transition-colors" />
                  <span className="font-medium">YouTube</span>
                </a>
              </div>
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

              <li className="flex items-center gap-2.5">
                <InstagramIcon className="w-4 h-4 text-accent shrink-0" />
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors text-xs"
                >
                  Instagram: @mannin_maindhan_trust
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <YoutubeIcon className="w-4 h-4 text-accent shrink-0" />
                <a
                  href={youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors text-xs"
                >
                  YouTube: @Mannin_Maindhan_Trust
                </a>
              </li>
            </ul>

            <div className="mt-5 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => openDonationModal()}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#FF9800] hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Heart size={14} className="fill-current" />
                <span>Support Our Projects</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Social Links */}
        <div className="mt-12 pt-6 border-t border-white/15">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
            <p className="text-center sm:text-left">
              © {currentYear} {siteInfo.footerCopyright || `${siteInfo.name} (${siteInfo.nameTamil}). All rights reserved.`}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-white/40 uppercase tracking-wider">Social:</span>
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/15 text-white/70 hover:text-pink-400 transition-colors"
                title="Follow us on Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram</span>
              </a>
              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/15 text-white/70 hover:text-red-500 transition-colors"
                title="Subscribe on YouTube"
              >
                <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
