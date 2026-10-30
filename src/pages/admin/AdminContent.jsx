import { useState, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { saveSiteContent } from '../../services/supabaseService';
import { getDialablePhone, getWhatsAppUrl } from '../../utils/helpers';
import {
  Save,
  Loader2,
  Megaphone,
  Compass,
  FileText,
  Phone,
  Layout,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Plus,
  Trash2,
} from 'lucide-react';

const guidingValueIcons = ['Heart', 'Users', 'ShieldCheck', 'Target'];

export default function AdminContent() {
  const { siteInfo } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();
  const [activeSection, setActiveSection] = useState('hero');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      name: siteInfo.name || '',
      nameTamil: siteInfo.nameTamil || '',
      shortName: siteInfo.shortName || '',
      tagline: siteInfo.tagline || '',
      taglineTamil: siteInfo.taglineTamil || '',
      heroHeading: siteInfo.heroHeading || '',
      heroSubheading: siteInfo.heroSubheading || '',
      primaryCtaText: siteInfo.primaryCtaText || 'Support Our Mission',
      secondaryCtaText: siteInfo.secondaryCtaText || 'Become a Volunteer',
      missionStatement:
        siteInfo.missionStatement ||
        'To empower rural communities across Dharmapuri and Tamil Nadu by providing sustainable access to quality education, safe drinking water, holistic healthcare, drug awareness, and eco-friendly livelihood solutions.',
      visionStatement:
        siteInfo.visionStatement ||
        'A self-reliant, enlightened, and healthy rural society where every village community thrives in harmony with nature and enjoys equitable opportunities.',
      guidingValues: siteInfo.guidingValues || [],
      announcementBanner:
        siteInfo.announcementBanner ||
        '🌱 Monsoon Village Tree Plantation Drive - Join our weekend volunteers in Palacode!',
      announcementActive: siteInfo.announcementActive ?? true,
      email: siteInfo.email || 'sonofsoiltrust@gmail.com',
      phone: siteInfo.phone || '+91 9994291195',
      whatsappNumber: siteInfo.whatsappNumber || '919994291195',
      address: siteInfo.address || '2/119, Eruthukuttahalli village, Palacode taluk, Dharmapuri - 636808',
      district: siteInfo.district || 'Dharmapuri',
      state: siteInfo.state || 'Tamil Nadu',
      pincode: siteInfo.pincode || '636808',
      founded: siteInfo.founded || '2024',
      footerAboutText:
        siteInfo.footerAboutText ||
        'A community-rooted charitable trust dedicated to holistic rural development in Dharmapuri and across Tamil Nadu through education, clean water, healthcare, environmental protection, and sustainable livelihoods.',
      footerCopyright:
        siteInfo.footerCopyright ||
        'Mannin Maindhan Grama Arakkattalai. All rights reserved. Registered Charitable Trust.',
    },
  });
  const { fields: guidingValueFields, append: appendGuidingValue, remove: removeGuidingValue } = useFieldArray({
    control,
    name: 'guidingValues',
  });

  // Keep form in sync when fresh siteInfo arrives from Supabase
  useEffect(() => {
    if (siteInfo && !isDirty) {
      reset({
        name: siteInfo.name || '',
        nameTamil: siteInfo.nameTamil || '',
        shortName: siteInfo.shortName || '',
        tagline: siteInfo.tagline || '',
        taglineTamil: siteInfo.taglineTamil || '',
        heroHeading: siteInfo.heroHeading || '',
        heroSubheading: siteInfo.heroSubheading || '',
        primaryCtaText: siteInfo.primaryCtaText || 'Support Our Mission',
        secondaryCtaText: siteInfo.secondaryCtaText || 'Become a Volunteer',
        missionStatement: siteInfo.missionStatement || '',
        visionStatement: siteInfo.visionStatement || '',
        guidingValues: siteInfo.guidingValues || [],
        announcementBanner: siteInfo.announcementBanner || '',
        announcementActive: siteInfo.announcementActive ?? true,
        email: siteInfo.email || '',
        phone: siteInfo.phone || '',
        whatsappNumber: siteInfo.whatsappNumber || '',
        address: siteInfo.address || '',
        district: siteInfo.district || '',
        state: siteInfo.state || '',
        pincode: siteInfo.pincode || '',
        founded: siteInfo.founded || '',
        footerAboutText: siteInfo.footerAboutText || '',
        footerCopyright: siteInfo.footerCopyright || '',
      });
    }
  }, [siteInfo, reset, isDirty]);

  const onSubmit = async (formData) => {
    try {
      const cleanPhoneRaw = getDialablePhone(formData.phone);
      const cleanWhatsAppDigits = (formData.whatsappNumber || '919994291195').replace(/\D/g, '');
      const fullWhatsAppNumber = cleanWhatsAppDigits.length === 10 ? `91${cleanWhatsAppDigits}` : (cleanWhatsAppDigits || '919994291195');
      const whatsappUrl = getWhatsAppUrl(fullWhatsAppNumber);

      const locationParts = [formData.district, formData.state].filter(Boolean);
      const locationShort = locationParts.length > 0
        ? `${locationParts.join(', ')}${formData.pincode ? ` - ${formData.pincode}` : ''}`
        : siteInfo.locationShort || 'Palacode, Dharmapuri, Tamil Nadu';

      // Keep existing non-editable logo references and computed values
      const mergedData = {
        ...siteInfo,
        ...formData,
        phoneRaw: cleanPhoneRaw,
        whatsappNumber: fullWhatsAppNumber,
        whatsappUrl,
        locationShort,
      };

      await saveSiteContent(mergedData);
      dispatch({ type: 'UPDATE_SITE_INFO', payload: mergedData });
      showSuccess('Website copy & configuration saved to Supabase and live on public site!', 'Content Saved');
      reset(formData);
    } catch (err) {
      showError(err.message || 'Failed to save website content to database', 'Save Error');
    }
  };

  const currentValues = watch();

  const navTabs = [
    { id: 'hero', label: 'Hero & CTA Labels', icon: Sparkles },
    { id: 'mission', label: 'Mission & Vision', icon: Compass },
    { id: 'announcement', label: 'Announcement Banner', icon: Megaphone },
    { id: 'profile', label: 'Organisation Profile', icon: FileText },
    { id: 'contact', label: 'Contact & Location', icon: Phone },
    { id: 'footer', label: 'Footer Content', icon: Layout },
  ];

  const inputClasses =
    'w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Live Content Manager
            </span>
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">Website Content & Marketing Copy</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit text, statements, banners, and contact information across the public website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-stone-200">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Hero & CTA */}
        {activeSection === 'hero' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-5 animate-fadeIn">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-base font-bold text-primary-dark">Homepage Hero Copy & Actions</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                The primary headline, supporting summary, and button labels shown at the top of the homepage.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Hero Main Heading
              </label>
              <input
                {...register('heroHeading', { required: 'Heading is required' })}
                className={inputClasses}
                placeholder="e.g. Building Stronger Villages. Creating Lasting Change."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Hero Supporting Description
              </label>
              <textarea
                {...register('heroSubheading', { required: 'Description is required' })}
                rows={3}
                className={inputClasses}
                placeholder="Working alongside rural communities to improve access..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Primary CTA Button Label
                </label>
                <input
                  {...register('primaryCtaText')}
                  className={inputClasses}
                  placeholder="Support Our Mission"
                />
                <p className="text-[11px] text-stone-400 mt-1">Opens the public contribution details page</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Secondary CTA Button Label
                </label>
                <input
                  {...register('secondaryCtaText')}
                  className={inputClasses}
                  placeholder="Become a Volunteer"
                />
                <p className="text-[11px] text-stone-400 mt-1">Directs visitors to /volunteer form</p>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="mt-6 p-4 rounded-xl bg-[#FAF8F2] border border-stone-200">
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2">
                Live Hero Preview
              </p>
              <h3 className="text-lg font-extrabold text-[#173B2A] leading-tight">
                {currentValues.heroHeading || 'Building Stronger Villages. Creating Lasting Change.'}
              </h3>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                {currentValues.heroSubheading || 'Working alongside rural communities...'}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-3 py-1.5 text-xs font-bold bg-[#FF9800] text-white rounded-lg">
                  {currentValues.primaryCtaText || 'Support Our Mission'}
                </span>
                <span className="px-3 py-1.5 text-xs font-bold bg-white text-[#173B2A] border border-stone-300 rounded-lg">
                  {currentValues.secondaryCtaText || 'Become a Volunteer'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mission & Vision */}
        {activeSection === 'mission' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-5 animate-fadeIn">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-base font-bold text-primary-dark">Mission & Vision Statements</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Displayed in the About page, Transparency overview, and community briefs.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Official Mission Statement
              </label>
              <textarea
                {...register('missionStatement')}
                rows={3}
                className={inputClasses}
                placeholder="To empower rural communities..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Long-Term Vision Statement
              </label>
              <textarea
                {...register('visionStatement')}
                rows={3}
                className={inputClasses}
                placeholder="A self-reliant, enlightened, and healthy rural society..."
              />
            </div>

            <div className="border-t border-stone-100 pt-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-primary-dark">Guiding Values</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Manage the value cards shown below Mission & Vision on the About page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    appendGuidingValue({
                      id: `guiding-value-${Date.now()}`,
                      icon: 'Heart',
                      title: '',
                      description: '',
                    })
                  }
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
                >
                  <Plus size={14} />
                  Add Value
                </button>
              </div>

              {guidingValueFields.length === 0 ? (
                <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-xs text-stone-500">
                  No guiding values yet. Add a value to display it on the About page.
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {guidingValueFields.map((field, index) => (
                    <div key={field.id} className="rounded-xl border border-stone-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-600">Value {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeGuidingValue(index)}
                          aria-label={`Remove guiding value ${index + 1}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                      <div>
                        <label
                          htmlFor={`guidingValues.${index}.title`}
                          className="block text-xs font-semibold text-stone-700 mb-1"
                        >
                          Title
                        </label>
                        <input
                          id={`guidingValues.${index}.title`}
                          {...register(`guidingValues.${index}.title`)}
                          className={inputClasses}
                          placeholder="e.g. Compassion & Service"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`guidingValues.${index}.description`}
                          className="block text-xs font-semibold text-stone-700 mb-1"
                        >
                          Description
                        </label>
                        <textarea
                          id={`guidingValues.${index}.description`}
                          {...register(`guidingValues.${index}.description`)}
                          rows={3}
                          className={inputClasses}
                          placeholder="Describe this guiding value"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`guidingValues.${index}.icon`}
                          className="block text-xs font-semibold text-stone-700 mb-1"
                        >
                          Card icon
                        </label>
                        <select
                          id={`guidingValues.${index}.icon`}
                          {...register(`guidingValues.${index}.icon`)}
                          className={inputClasses}
                        >
                          {guidingValueIcons.map((icon) => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Announcement Banner */}
        {activeSection === 'announcement' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-5 animate-fadeIn">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-base font-bold text-primary-dark">Top Announcement Banner</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Displays a prominent informational bar across the top of the entire website.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <input
                type="checkbox"
                id="announcementActive"
                {...register('announcementActive')}
                className="h-4 w-4 rounded text-primary focus:ring-primary border-stone-300 cursor-pointer"
              />
              <label htmlFor="announcementActive" className="text-sm font-semibold text-stone-800 cursor-pointer">
                Enable Announcement Banner on Public Website
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Banner Message Text
              </label>
              <input
                {...register('announcementBanner')}
                className={inputClasses}
                placeholder="e.g. 🌱 Monsoon Village Tree Plantation Drive - Join our weekend volunteers in Palacode!"
              />
            </div>

            {currentValues.announcementActive && (
              <div className="mt-4 p-3 bg-amber-500 text-white rounded-xl text-xs font-medium flex items-center justify-between">
                <span>{currentValues.announcementBanner || 'Banner preview is empty.'}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-black/20 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Organisation Profile */}
        {activeSection === 'profile' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-5 animate-fadeIn">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-base font-bold text-primary-dark">Organisation Identity</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Core organizational titles, short name, and Tamil translation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Organisation Name (English)
              </label>
              <input {...register('name', { required: true })} className={inputClasses} />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Organisation Name (Tamil)
              </label>
              <input {...register('nameTamil', { required: true })} className={`${inputClasses} font-tamil`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Short / Acronym Name
                </label>
                <input {...register('shortName')} className={inputClasses} placeholder="e.g. MMG Trust" />
                <p className="text-[11px] text-stone-400 mt-1">Used in sidebar and logo labels</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Founded Year
                </label>
                <input {...register('founded')} className={inputClasses} placeholder="e.g. 2024" />
                <p className="text-[11px] text-stone-400 mt-1">Trust establishment year</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Contact & Location */}
        {activeSection === 'contact' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-5 animate-fadeIn">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-base font-bold text-primary-dark">Official Contact Information</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Client-provided phone numbers, email address, WhatsApp hotline, and taluk office location.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Official Phone Number
                </label>
                <input {...register('phone', { required: true })} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  WhatsApp Number (with country code, digits only)
                </label>
                <input {...register('whatsappNumber')} className={inputClasses} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Official Email Address
              </label>
              <input {...register('email', { required: true })} type="email" className={inputClasses} />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Physical Office Address
              </label>
              <textarea {...register('address', { required: true })} rows={2} className={inputClasses} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  District
                </label>
                <input {...register('district')} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input {...register('state')} className={inputClasses} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  PIN Code
                </label>
                <input {...register('pincode')} className={inputClasses} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Footer Content */}
        {activeSection === 'footer' && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-5 animate-fadeIn">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-base font-bold text-primary-dark">Footer Content & Legal Notice</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                The summary text and copyright declaration displayed at the bottom of every page.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Footer Organization Summary
              </label>
              <textarea {...register('footerAboutText')} rows={3} className={inputClasses} />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Copyright Notice Text
              </label>
              <input {...register('footerCopyright')} className={inputClasses} />
            </div>
          </div>
        )}

        {/* Form Actions Bar */}
        <div className="mt-6 p-4 bg-white border border-stone-200 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            {isDirty ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                Unsaved changes pending
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle size={14} className="text-emerald-600" />
                Persistent in Supabase Database
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving All Content Updates...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save All Content Updates</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
