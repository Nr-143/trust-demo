import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Megaphone,
  BarChart3,
  Users,
  Briefcase,
  Image,
  Settings,
  ArrowLeft,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ isOpen, onClose }) {
  const { siteInfo, volunteerApplications, volunteers, campaigns, programmes, contactEnquiries } = useSite();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const volList = volunteerApplications || volunteers || [];
  const pendingVolunteers = volList.filter((v) => v.status === 'New' || v.status === 'pending').length;
  const activeCampaigns = (campaigns || []).filter((c) => c.status === 'active').length;
  const activeProgrammes = (programmes || []).filter((p) => p.status === 'active').length;
  const unreadEnquiries = (contactEnquiries || []).filter((e) => e.status === 'new').length;

  const sidebarLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/content', label: 'Website Content', icon: FileText },
    { to: '/admin/programmes', label: 'Programmes', icon: FolderKanban, badge: activeProgrammes },
    { to: '/admin/campaigns', label: 'Campaigns', icon: Megaphone, badge: activeCampaigns },
    { to: '/admin/impact', label: 'Impact Metrics', icon: BarChart3 },
    {
      to: '/admin/enquiries',
      label: 'Contact Enquiries',
      icon: MessageSquare,
      badge: unreadEnquiries,
      badgeColor: 'bg-teal-600 text-white',
    },
    {
      to: '/admin/volunteers',
      label: 'Volunteers',
      icon: Users,
      badge: pendingVolunteers,
      badgeColor: 'bg-amber-500 text-white',
    },
    { to: '/admin/careers', label: 'Career Listings', icon: Briefcase },
    { to: '/admin/gallery', label: 'Photo Gallery', icon: Image },
    { to: '/admin/settings', label: 'Database & Reset', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-primary text-white shadow-2xs font-bold'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
    }`;

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-stone-200 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <img
              src={siteInfo.logoBadge || '/images/originalLogo.jpeg'}
              alt={siteInfo.shortName}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-600/30 bg-white"
              onError={(e) => {
                e.currentTarget.src = '/images/originalLogo.jpeg';
              }}
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-primary-dark truncate">{siteInfo.shortName}</p>
              <p className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">
                Admin Console
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={linkClasses}
              onClick={onClose}
            >
              <div className="flex items-center gap-2.5">
                <link.icon size={16} />
                <span>{link.label}</span>
              </div>
              {link.badge !== undefined && link.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    link.badgeColor || 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Bar: Authenticated Session & Navigation */}
        <div className="p-3 border-t border-stone-200 bg-stone-50/70 space-y-2">
          {user && (
            <div className="px-2 py-1 text-[11px] text-stone-500 truncate">
              Signed in as <strong className="text-stone-700 block truncate">{user.email}</strong>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 text-[11px] font-semibold text-stone-700 hover:text-primary hover:bg-stone-100 rounded-xl transition-colors border border-stone-200 bg-white"
            >
              <ArrowLeft size={13} />
              <span>Public Site</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-red-200 bg-white cursor-pointer"
              title="Sign Out of Admin Console"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
