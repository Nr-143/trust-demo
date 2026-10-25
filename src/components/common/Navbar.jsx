import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, Heart, MessageCircle, ChevronRight, ShieldCheck } from 'lucide-react';
import { useSite, useDonationModal } from '../../context/SiteContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/programmes', label: 'Programmes' },
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/impact', label: 'Impact' },
  { to: '/volunteer', label: 'Volunteer' },
  { to: '/careers', label: 'Careers' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { siteInfo } = useSite();
  const { openDonationModal } = useDonationModal();
  const location = useLocation();

  // Close mobile navigation whenever route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Handle Escape key and body scroll locking when mobile menu is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };

    if (mobileOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Desktop navigation link classes
  const linkClasses = ({ isActive }) =>
    `relative px-2.5 py-1.5 text-[13px] 2xl:text-[14px] font-medium tracking-tight rounded-md transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-primary ${
      isActive
        ? 'text-primary font-bold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full'
        : 'text-stone-700 hover:text-primary hover:bg-stone-50 active:bg-stone-100'
    }`;

  // Mobile drawer link classes
  const mobileLinkClasses = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 min-h-[48px] ${
      isActive
        ? 'bg-primary text-white font-bold shadow-xs'
        : 'text-stone-800 hover:bg-stone-100 hover:text-primary active:bg-stone-200'
    }`;

  return (
    <header className="relative bg-white border-b border-stone-200">
      {/* 1. Optional Top Announcement Banner */}
      {siteInfo.announcementActive && siteInfo.announcementBanner && (
        <aside
          aria-label="Announcement"
          className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium shadow-2xs"
        >
          <div className="site-container flex items-center justify-center gap-2">
            <span className="truncate">{siteInfo.announcementBanner}</span>
          </div>
        </aside>
      )}

      {/* 2. Top Utility Contact Bar */}
      <div className="bg-[#173B2A] text-white/90 text-xs border-b border-emerald-950/40">
        <div className="site-container py-1.5 flex items-center justify-between gap-3">
          {/* Contact Details */}
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <a
              href={`tel:${siteInfo.phoneRaw || '+919994291195'}`}
              className="inline-flex items-center gap-1.5 hover:text-accent transition-colors shrink-0"
              title="Call Organization"
              aria-label={`Call organization at ${siteInfo.phone || '+91 9994291195'}`}
            >
              <Phone size={13} className="text-accent shrink-0" />
              <span className="font-medium">{siteInfo.phone || '+91 9994291195'}</span>
            </a>

            <a
              href={`mailto:${siteInfo.email || 'manninmaindhangramatrust@gmail.com'}`}
              className="hidden md:inline-flex items-center gap-1.5 hover:text-accent transition-colors truncate"
              title="Email Organization"
              aria-label={`Email organization at ${siteInfo.email}`}
            >
              <Mail size={13} className="text-accent shrink-0" />
              <span className="truncate">{siteInfo.email || 'manninmaindhangramatrust@gmail.com'}</span>
            </a>

            <div className="hidden 2xl:inline-flex items-center gap-1.5 text-white/70 shrink-0">
              <MapPin size={13} className="text-accent shrink-0" />
              <span>Palacode, Dharmapuri, Tamil Nadu</span>
            </div>
          </div>

          {/* Quick Actions (WhatsApp & Admin) */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={siteInfo.whatsappUrl || 'https://wa.me/919994291195'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-medium transition-colors"
              title="Chat on WhatsApp"
              aria-label="Chat with Mannin Maindhan Trust on WhatsApp"
            >
              <MessageCircle size={12} className="fill-current" />
              <span>WhatsApp Us</span>
            </a>

            <Link
              to="/admin"
              className="text-[11px] text-white/60 hover:text-white transition-colors border-l border-white/20 pl-3 hidden sm:inline-block"
              title="Admin Dashboard"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Bar */}
      <div className="site-container">
        <div className="flex items-center justify-between h-20 sm:h-[84px] xl:h-[88px] gap-3 sm:gap-4">
          
          {/* AREA 1: LEFT — NGO Logo & Title */}
          <div className="flex items-center min-w-0 flex-1 xl:flex-initial">
            <Link
              to="/"
              className="flex items-center gap-3 sm:gap-3.5 xl:gap-4 group min-w-0 py-1"
              aria-label="Mannin Maindhan Grama Arakkattalai - Home"
            >
              <div className="relative shrink-0">
                <img
                  src={siteInfo.logoBadge || '/images/originalLogo.jpeg'}
                  alt={siteInfo.shortName || 'MMG Trust Logo'}
                  className="h-11 w-11 sm:h-13 sm:w-13 xl:h-14 xl:w-14 2xl:h-15 2xl:w-15 rounded-full object-cover ring-2 ring-emerald-700/25 group-hover:ring-emerald-700 transition-all shadow-xs"
                  onError={(e) => {
                    e.currentTarget.src = '/images/originalLogo.jpeg';
                  }}
                />
              </div>
              <div className="flex flex-col min-w-0 justify-center">
                <span className="text-[14px] xs:text-[15px] sm:text-[17px] md:text-[18px] xl:text-[17.5px] 2xl:text-[20px] font-extrabold text-[#173B2A] tracking-tight leading-snug group-hover:text-primary transition-colors truncate">
                  {siteInfo.name || 'Mannin Maindhan Grama Arakkattalai'}
                </span>
                <span className="text-[11px] xs:text-[12px] sm:text-[13px] md:text-[13.5px] xl:text-[13px] 2xl:text-[14.5px] text-stone-600 font-tamil font-semibold leading-tight mt-0.5 truncate">
                  {siteInfo.nameTamil || 'மண்ணின் மைந்தன் கிராம அறக்கட்டளை'}
                </span>
              </div>
            </Link>
          </div>

          {/* AREA 2: CENTRE — Desktop 9 Navigation Links (xl+ only) */}
          <nav
            aria-label="Main Navigation"
            className="hidden xl:flex items-center justify-center gap-0.5 2xl:gap-1.5 flex-1 px-1"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClasses}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* AREA 3: RIGHT — Desktop Action Buttons (xl+ only) */}
          <div className="hidden xl:flex items-center gap-2 2xl:gap-3 shrink-0">
            <a
              href={siteInfo.whatsappUrl || 'https://wa.me/919994291195'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-9 w-9 2xl:h-10 2xl:w-10 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/60"
              title="Message on WhatsApp"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </a>

            <a
              href={`tel:${siteInfo.phoneRaw || '+919994291195'}`}
              className="inline-flex items-center justify-center h-9 w-9 2xl:h-10 2xl:w-10 rounded-full bg-stone-100 text-[#173B2A] hover:bg-stone-200 transition-colors border border-stone-200"
              title="Call Us Directly"
              aria-label="Call Us"
            >
              <Phone size={16} />
            </a>

            {/* Donate Now CTA */}
            <button
              type="button"
              onClick={() => openDonationModal()}
              className="inline-flex items-center gap-1.5 2xl:gap-2 px-4 2xl:px-5 py-2.5 rounded-lg bg-[#FF9800] hover:bg-amber-600 active:bg-amber-700 text-white text-xs 2xl:text-sm font-semibold shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
              aria-label="Donate Now"
            >
              <Heart size={15} className="fill-white/20" />
              <span>Donate Now</span>
            </button>
          </div>

          {/* MOBILE MENU TOGGLE (Visible below xl breakpoint) */}
          <div className="flex items-center xl:hidden shrink-0">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 hover:text-primary active:bg-stone-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
            >
              {mobileOpen ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
            </button>
          </div>

        </div>
      </div>

      {/* 4. CUSTOM MOBILE NAVIGATION DRAWER & BACKDROP */}
      {mobileOpen && (
        <div
          id="mobile-nav-panel"
          className="xl:hidden fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200 animate-fadeIn"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out border-l border-stone-200">
              
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-stone-200 bg-[#FAF8F2] flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={siteInfo.logoBadge || '/images/originalLogo.jpeg'}
                    alt={siteInfo.shortName}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-700/25 shrink-0 shadow-xs"
                    onError={(e) => {
                      e.currentTarget.src = '/images/originalLogo.jpeg';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-[#173B2A] truncate">
                      {siteInfo.name}
                    </p>
                    <p className="text-[11px] text-stone-600 font-tamil font-semibold truncate mt-0.5">
                      {siteInfo.nameTamil}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ml-2 shrink-0"
                  aria-label="Close navigation menu"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Navigation Links Scroll Area */}
              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-3 mb-2">
                  Navigation Menu
                </p>
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={mobileLinkClasses}
                    end={link.to === '/'}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{link.label}</span>
                    <ChevronRight size={16} className="opacity-60" />
                  </NavLink>
                ))}
              </nav>

              {/* Drawer Actions & Footer */}
              <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3 shrink-0">
                {/* Prominent Donate Now Button */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openDonationModal();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[#FF9800] hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-bold shadow-md transition-colors min-h-[48px] cursor-pointer"
                  aria-label="Donate Now"
                >
                  <Heart size={18} className="fill-white/20" />
                  <span>Donate Now</span>
                </button>

                {/* Direct Contact Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={`tel:${siteInfo.phoneRaw || '+919994291195'}`}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200 min-h-[44px] transition-colors"
                    aria-label={`Call ${siteInfo.phone}`}
                  >
                    <Phone size={14} className="text-primary shrink-0" />
                    <span>Call Us</span>
                  </a>

                  <a
                    href={siteInfo.whatsappUrl || 'https://wa.me/919994291195'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-xs font-semibold border border-emerald-200/80 min-h-[44px] transition-colors"
                    aria-label="Message on WhatsApp"
                  >
                    <MessageCircle size={14} className="text-emerald-600 shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* Admin Portal Link */}
                <div className="pt-2 text-center">
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-primary transition-colors py-1"
                  >
                    <ShieldCheck size={14} className="text-stone-400" />
                    <span>Staff / Admin Portal</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  );
}
