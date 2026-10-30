import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { formatWhatsAppDisplay, getWhatsAppUrl, getDialablePhone } from '../../utils/helpers';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  // Honeypot field for anti-spam bots
  honeypot: z.string().optional(),
});

export default function ContactPage() {
  const { siteInfo } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    // Spam bot check
    if (data.honeypot) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Database connection is not available. Please verify your Supabase configuration.');
      }

      const now = new Date().toISOString();
      const enquiryPayload = {
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject.trim(),
        message: data.message.trim(),
        status: 'new',
        submitted_at: now,
      };

      const { error } = await supabase
        .from('contact_enquiries')
        .insert([enquiryPayload]);

      if (error) throw error;

      // Keep local state in sync with confirmed database record
      dispatch({
        type: 'ADD_CONTACT_ENQUIRY',
        payload: {
          id: `enq-${Date.now()}`,
          ...enquiryPayload,
          submittedAt: now,
        },
      });

      setSubmitted(true);
      showSuccess(
        `Thank you ${data.name}. Your enquiry has been received and saved successfully.`,
        'Enquiry Saved'
      );
      reset();
    } catch (err) {
      console.error('Contact submission error:', err);
      showError(err.message || 'Failed to submit enquiry. Please try again.', 'Submission Error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    'w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';

  return (
    <>
      <PageHeader
        title="Contact Us"
        titleTamil="எங்களை தொடர்பு கொள்ளுங்கள்"
        description={`Have questions, partnership queries, or want to visit our field office in ${siteInfo.district || 'Palacode'}? We are here to connect.`}
      />

      <div className="site-container py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Contact Details Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-2xs">
              <h2 className="text-lg font-bold text-primary-dark mb-5">Trust Communication</h2>
              
              <div className="space-y-5">
                {/* Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0 mt-0.5">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Direct Phone</p>
                    <a
                      href={`tel:${getDialablePhone(siteInfo.phoneRaw || siteInfo.phone)}`}
                      className="text-sm sm:text-base font-bold text-primary-dark hover:text-primary transition-colors"
                    >
                      {siteInfo.phone || '+91 99942 91195'}
                    </a>
                    <p className="text-[11px] text-gray-400">Available Mon–Sat, 9am–6pm</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">WhatsApp Line</p>
                    <a
                      href={siteInfo.whatsappUrl || getWhatsAppUrl(siteInfo.whatsappNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      {formatWhatsAppDisplay(siteInfo.whatsappNumber)}
                    </a>
                    <p className="text-[11px] text-gray-400">Fast messaging & document sharing</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Official Email</p>
                    <a
                      href={`mailto:${siteInfo.email}`}
                      className="text-sm font-bold text-primary-dark hover:text-primary transition-colors break-all"
                    >
                      {siteInfo.email}
                    </a>
                    <p className="text-[11px] text-gray-400">For formal enquiries & CSR</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3.5 pt-2 border-t border-gray-100">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0 mt-0.5">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered Address</p>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium mt-0.5">
                      {siteInfo.address}
                    </p>
                    {(siteInfo.district || siteInfo.state || siteInfo.pincode) && (
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        {[siteInfo.district, siteInfo.state, siteInfo.pincode].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button Box */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
              <h3 className="font-bold text-sm text-[#173B2A] mb-2">Need Immediate Guidance?</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                You can directly start a WhatsApp conversation with our field volunteers for project details
                or location guidance.
              </p>
              <a
                href={siteInfo.whatsappUrl || getWhatsAppUrl(siteInfo.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <MessageCircle size={15} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-2xs">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle size={48} className="mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold text-primary-dark">Message Sent Successfully!</h3>
                <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                  Thank you for reaching out to Mannin Maindhan Grama Arakkattalai. A coordinator will
                  review your message and get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-primary-dark">Send Us an Enquiry</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Fill out the form below and we will route your inquiry to the respective programme team.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name *</label>
                      <input {...register('name')} className={inputClasses} placeholder="Enter your name" />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                      <input {...register('email')} type="email" className={inputClasses} placeholder="you@example.com" />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Subject / Area of Inquiry *</label>
                    <input
                      {...register('subject')}
                      className={inputClasses}
                      placeholder="e.g. Village drinking water support / CSR collaboration"
                    />
                    {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Your Message *</label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      className={inputClasses}
                      placeholder="Write your message here..."
                    />
                    {/* Hidden Honeypot for Anti-Spam */}
                    <input
                      type="text"
                      {...register('honeypot')}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark active:bg-emerald-900 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Send Message to Trust</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
