import { Phone, Mail, MapPin, MessageCircle, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';

export default function QuickContactBar() {
  const { siteInfo } = useSite();

  return (
    <section className="bg-white py-14 sm:py-18 border-b border-gray-100" id="contact-quick">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#176B36] border border-emerald-200/80 mb-2">
            <span>Direct Community Access</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#173B2A] tracking-tight">
            Connect with Our Team
          </h2>
          <p className="mt-1 text-sm text-gray-500 font-normal">
            We are accessible to community members, volunteers, donors, and partners at our Palacode office.
          </p>
        </div>

        {/* 3 Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Phone Card */}
          <div className="bg-[#FAF8F2] rounded-2xl p-6 border border-stone-200 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 rounded-xl bg-emerald-100 text-[#176B36]">
                  <Phone size={20} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-200/60 text-stone-700">
                  Direct Line
                </span>
              </div>
              <h3 className="text-base font-bold text-[#173B2A]">Phone Call</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Speak directly with our trust field coordinator for immediate enquiries.
              </p>
              <p className="text-lg font-extrabold text-[#173B2A] tracking-tight">
                {siteInfo.phone}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200">
              <a
                href={`tel:${siteInfo.phoneRaw || '+919994291195'}`}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#176B36] hover:bg-[#173B2A] text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                <Phone size={13} />
                <span>Call Now (+91 99942 91195)</span>
              </a>
            </div>
          </div>

          {/* WhatsApp Card */}
          <div className="bg-[#FAF8F2] rounded-2xl p-6 border border-stone-200 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
                  <MessageCircle size={20} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-200/70 text-emerald-900">
                  Fast Response
                </span>
              </div>
              <h3 className="text-base font-bold text-[#173B2A]">WhatsApp Chat</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Send photos, questions, volunteer queries, or project recommendations.
              </p>
              <p className="text-lg font-extrabold text-[#173B2A] tracking-tight">
                +91 99942 91195
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200">
              <a
                href={siteInfo.whatsappUrl || 'https://wa.me/919994291195'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                <MessageCircle size={13} />
                <span>Start WhatsApp Chat</span>
              </a>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-[#FAF8F2] rounded-2xl p-6 border border-stone-200 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 rounded-xl bg-amber-100 text-amber-800">
                  <Mail size={20} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-200/60 text-stone-700">
                  Official Email
                </span>
              </div>
              <h3 className="text-base font-bold text-[#173B2A]">Email Communication</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                For formal correspondence, partnerships, CSR inquiries, and documentation.
              </p>
              <p className="text-sm font-bold text-[#173B2A] break-all">
                {siteInfo.email}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200">
              <a
                href={`mailto:${siteInfo.email}`}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                <Mail size={13} />
                <span>Send Email</span>
              </a>
            </div>
          </div>

        </div>

        {/* Physical Office Address Box */}
        <div className="rounded-2xl bg-[#FAF8F2] p-5 sm:p-6 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white text-[#176B36] border border-stone-200 shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Registered Trust Office Address
              </p>
              <p className="text-sm sm:text-base font-bold text-[#173B2A] mt-0.5">
                {siteInfo.address}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Palacode Taluk • Dharmapuri District • Tamil Nadu — 636808
              </p>
            </div>
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-xs font-semibold text-[#173B2A] border border-stone-300 shadow-2xs transition-colors shrink-0"
          >
            <span>Full Contact Page & Form</span>
            <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </section>
  );
}

