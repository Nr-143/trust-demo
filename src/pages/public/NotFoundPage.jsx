import { Link } from 'react-router-dom';
import { Home, FolderKanban, Megaphone, Phone, ArrowLeft, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

export default function NotFoundPage() {
  return (
    <>
      <PageHeader
        title="Page Not Found"
        titleTamil="பக்கம் கிடைக்கவில்லை"
        description="The page you are looking for does not exist or has been moved."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
        <div className="inline-flex p-4 rounded-3xl bg-amber-50 text-amber-700 border border-amber-200/80 mb-6">
          <AlertCircle size={44} />
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173B2A] tracking-tight mb-2">
          404 — Page Not Found
        </h2>
        <p className="text-sm font-tamil text-stone-500 font-medium mb-4">
          நீங்கள் தேடும் பக்கம் கிடைக்கவில்லை
        </p>

        <p className="text-sm sm:text-base text-stone-600 max-w-lg mx-auto leading-relaxed mb-8">
          We couldn't locate the exact page URL you requested. Please use the navigation links below to continue exploring our community work and rural programmes.
        </p>

        {/* Action navigation links */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-[#173B2A] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Home size={15} />
            <span>Return to Homepage</span>
          </Link>

          <Link
            to="/programmes"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-stone-50 text-[#173B2A] text-xs font-semibold border border-stone-200 shadow-2xs transition-colors"
          >
            <FolderKanban size={15} className="text-primary" />
            <span>Our 9 Verticals</span>
          </Link>

          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-stone-50 text-[#173B2A] text-xs font-semibold border border-stone-200 shadow-2xs transition-colors"
          >
            <Megaphone size={15} className="text-accent" />
            <span>Active Campaigns</span>
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-stone-50 text-[#173B2A] text-xs font-semibold border border-stone-200 shadow-2xs transition-colors"
          >
            <Phone size={15} className="text-primary" />
            <span>Contact Field Office</span>
          </Link>
        </div>

        <div className="pt-8 border-t border-stone-200 text-xs text-stone-500">
          <span>Are you looking for the management console? </span>
          <Link to="/admin" className="text-primary font-semibold hover:underline">
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}

