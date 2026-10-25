import {
  FolderKanban,
  Megaphone,
  Users,
  Briefcase,
  Heart,
  MessageSquare,
  ArrowRight,
  Database,
  Plus,
  FileText,
  Calendar,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite, useDonationModal } from '../../context/SiteContext';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function AdminDashboard() {
  const {
    programmes,
    campaigns,
    volunteerApplications,
    volunteers,
    careers,
    gallery,
    impact,
    donationPledges,
    demoDonations,
    contactEnquiries,
    siteInfo,
  } = useSite();

  const { openDonationModal } = useDonationModal();

  const volList = volunteerApplications || volunteers || [];
  const enqList = contactEnquiries || [];
  const donationsList = donationPledges || demoDonations || [];
  const progList = programmes || [];
  const campList = campaigns || [];

  const activeProgrammesCount = progList.filter((p) => p.status === 'active').length;
  const activeCampaignsList = campList.filter((c) => c.status === 'active');
  const activeCampaignsCount = activeCampaignsList.length;

  const totalDonationsAmount = donationsList.reduce(
    (sum, d) => sum + (Number(d.amount) || 0),
    0
  );

  const pendingVolunteers = volList.filter((v) => v.status === 'New' || v.status === 'pending').length;
  const newEnquiries = enqList.filter((e) => e.status === 'new').length;

  const cards = [
    {
      label: 'Published Programmes',
      count: activeProgrammesCount,
      sublabel: `${progList.length} total verticals`,
      icon: FolderKanban,
      to: '/admin/programmes',
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Active Campaigns',
      count: activeCampaignsCount,
      sublabel: `${campList.length} total campaigns`,
      icon: Megaphone,
      to: '/admin/campaigns',
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Volunteer Applications',
      count: volList.length,
      sublabel: `${pendingVolunteers} pending review`,
      icon: Users,
      to: '/admin/volunteers',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Supporter Pledges',
      count: formatCurrency(totalDonationsAmount),
      sublabel: `${donationsList.length} recorded pledges`,
      icon: Heart,
      to: '/admin/campaigns',
      color: 'bg-rose-50 text-rose-700',
    },
    {
      label: 'Contact Enquiries',
      count: enqList.length,
      sublabel: `${newEnquiries} unread messages`,
      icon: MessageSquare,
      to: '/admin/enquiries',
      color: 'bg-teal-50 text-teal-700',
    },
    {
      label: 'Open Careers',
      count: careers?.filter((c) => c.status === 'open').length || 0,
      sublabel: `${careers?.length || 0} total listings`,
      icon: Briefcase,
      to: '/admin/careers',
      color: 'bg-purple-50 text-purple-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Supabase Central Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">Admin Control Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time content management, verified submissions, and campaign records for {siteInfo.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink size={13} />
          </Link>
          <button
            onClick={() => openDonationModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#FF9800] hover:bg-amber-600 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Heart size={14} className="fill-white/30" />
            <span>Record Pledge</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-emerald-500/50 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-2xl font-extrabold text-primary-dark mt-1">{card.count}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{card.sublabel}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon size={22} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Campaign Progress Summaries */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-primary-dark">Active Campaign Progress</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Live fundraising targets and simulated supporter pledges across villages.
            </p>
          </div>
          <Link
            to="/admin/campaigns"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Manage All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-4">
          {activeCampaignsList.slice(0, 3).map((camp) => {
            const pct = Math.min(
              100,
              camp.goalAmount > 0
                ? Math.round((Number(camp.raisedAmount || 0) / Number(camp.goalAmount)) * 100)
                : 0
            );

            return (
              <div key={camp.id} className="p-4 bg-stone-50/70 border border-stone-200 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                      {camp.category}
                    </span>
                    <h3 className="text-sm font-bold text-primary-dark">{camp.title}</h3>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="text-sm font-extrabold text-primary-dark">
                      {formatCurrency(camp.raisedAmount || 0)}
                    </span>
                    <span className="text-xs text-stone-500"> / {formatCurrency(camp.goalAmount)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pct >= 100 ? 'bg-emerald-500' : 'bg-primary'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>{pct}% of goal reached</span>
                  <span>{camp.donorsCount || 0} supporters pledged</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Quick Actions & Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Launch Actions */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-primary-dark mb-1">Quick Administrative Actions</h2>
            <p className="text-xs text-stone-500 mb-4">
              Direct access to common content management operations.
            </p>

            <div className="space-y-2.5">
              <Link
                to="/admin/programmes"
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                    <FolderKanban size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">Add or Edit Programmes</p>
                    <p className="text-[11px] text-stone-500">6 focus development verticals</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/admin/campaigns"
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                    <Megaphone size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">Configure Campaigns & Pledges</p>
                    <p className="text-[11px] text-stone-500">Targets, deadlines, & donations</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/admin/content"
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">Edit Website Copy & Mission</p>
                    <p className="text-[11px] text-stone-500">Hero banner, vision & announcements</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/admin/volunteers"
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">Review Volunteer Applications</p>
                    <p className="text-[11px] text-stone-500">{pendingVolunteers} waiting for review</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
            <Link
              to="/admin/settings"
              className="text-xs font-semibold text-stone-600 hover:text-primary flex items-center gap-1.5"
            >
              <Database size={13} />
              <span>Storage Diagnostics & Reset</span>
            </Link>
          </div>
        </div>

        {/* Recent Demonstration Activity Log */}
        <div id="recent-activity" className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs scroll-mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-primary-dark">Recent Activity & Submissions</h2>
            <span className="text-xs text-stone-400">Live storage feed</span>
          </div>

          <div className="space-y-3">
            {volList.slice(0, 2).map((v) => (
              <div
                key={v.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs"
              >
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
                  <Users size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-800">
                    Volunteer Application: <span className="font-normal">{v.name}</span>
                  </p>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Area: {v.area} • Status: <span className="capitalize font-semibold">{v.status}</span>
                  </p>
                </div>
                <span className="text-[10px] text-stone-400 whitespace-nowrap">
                  {formatDate(v.submittedAt)}
                </span>
              </div>
            ))}

            {donationsList.slice(-2).reverse().map((d) => (
              <div
                key={d.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs"
              >
                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
                  <Heart size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-800">
                    Simulated Pledge: <span className="text-emerald-700">{formatCurrency(d.amount)}</span>
                  </p>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    By {d.donorName} for &quot;{d.campaignTitle}&quot;
                  </p>
                </div>
                <span className="text-[10px] text-stone-400 whitespace-nowrap">
                  {formatDate(d.timestamp)}
                </span>
              </div>
            ))}

            {enqList.slice(0, 1).map((e) => (
              <div
                key={e.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs"
              >
                <div className="p-2 bg-teal-100 text-teal-700 rounded-lg shrink-0 mt-0.5">
                  <MessageSquare size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-800">
                    Contact Message: <span className="font-normal">{e.name}</span>
                  </p>
                  <p className="text-stone-500 text-[11px] mt-0.5 line-clamp-1">&quot;{e.message}&quot;</p>
                </div>
                <span className="text-[10px] text-stone-400 whitespace-nowrap">
                  {formatDate(e.submittedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
