import { Link } from 'react-router-dom';
import { Shield, FileCheck, ArrowRight, Eye, Scale } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

export default function TransparencySection() {
  const { transparencyLinks, siteInfo } = useSite();

  const links = transparencyLinks || [
    {
      title: 'About the Trust',
      titleTamil: 'அறக்கட்டளை நோக்கம்',
      description: 'Founding mission, grassroots mandate, and village-level focus.',
      to: '/about',
      badge: 'Governance',
    },
    {
      title: 'Community Programmes',
      titleTamil: 'செயல்திட்டங்கள்',
      description: 'Overview of 6 active development verticals and village coverage.',
      to: '/programmes',
      badge: 'Operations',
    },
    {
      title: 'Impact Verification',
      titleTamil: 'தாக்கம் & கண்காணிப்பு',
      description: 'Field metrics, monitoring framework, and progress reporting protocol.',
      to: '/impact',
      badge: 'Accountability',
    },
    {
      title: 'Official Reports & Compliance',
      titleTamil: 'அறிக்கைகள் & சான்றிதழ்கள்',
      description:
        'Official trust registration records and compliance filings will be published once fully certified.',
      to: '/about',
      badge: 'Transparency',
    },
  ];

  return (
    <section className="bg-[#FAF8F2] py-16 sm:py-20 border-b border-stone-200/60" id="transparency">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-[#173B2A] border border-emerald-200 mb-3">
            <Shield size={13} className="text-[#176B36]" />
            <span>Governance & Accountability</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#173B2A] tracking-tight">
            Our Commitment to Transparency
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
            We hold ourselves to rigorous standards of integrity, open communication, and responsible
            community stewardship.
          </p>
        </div>

        {/* 4 Transparency Link Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {links.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="group bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                    {item.badge}
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-stone-400 group-hover:text-[#176B36] group-hover:translate-x-1 transition-all"
                  />
                </div>

                <h3 className="text-base font-bold text-[#173B2A] group-hover:text-[#176B36] transition-colors leading-snug">
                  {item.title}
                </h3>

                {item.titleTamil && (
                  <p className="text-xs font-tamil text-gray-500 font-medium mt-0.5 mb-2">
                    {item.titleTamil}
                  </p>
                )}

                <p className="text-xs text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] font-semibold text-[#176B36] flex items-center gap-1">
                <span>View Details</span>
                <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>

        {/* Clear Official Certification Notice - No Invented Certs */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-emerald-50 text-[#176B36] mb-3">
            <Scale size={20} />
          </div>
          <h4 className="text-sm font-bold text-[#173B2A]">
            Official Documentation & Trust Filings
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed mt-1 max-w-xl mx-auto">
            In compliance with truth-in-reporting standards, official registration certificates, 12A/80G
            income-tax exemptions, and certified annual auditor reports will be made downloadable
            directly on this portal following formal ratification by the board of trustees.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-stone-500">
            <Eye size={13} className="text-accent" />
            <span>Open record policy for community scrutiny</span>
          </div>
        </div>

      </div>
    </section>
  );
}

