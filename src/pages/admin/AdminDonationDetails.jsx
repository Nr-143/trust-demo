import { useEffect, useState } from 'react';
import { Heart, Save } from 'lucide-react';
import { useSite, useSiteDispatch } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { saveSiteContent } from '../../services/supabaseService';

const emptyDetails = {
  donationDescription: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankName: '',
  bankIfscCode: '',
  upiId: '',
};

const fields = [
  { name: 'bankAccountName', label: 'Account holder name', autocomplete: 'name' },
  { name: 'bankAccountNumber', label: 'Account number', autocomplete: 'off' },
  { name: 'bankName', label: 'Bank name', autocomplete: 'organization' },
  { name: 'bankIfscCode', label: 'IFSC code', autocomplete: 'off' },
  { name: 'upiId', label: 'UPI ID', autocomplete: 'off' },
];

export default function AdminDonationDetails() {
  const { siteInfo } = useSite();
  const dispatch = useSiteDispatch();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({ ...emptyDetails, ...siteInfo });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      ...emptyDetails,
      donationDescription: siteInfo.donationDescription || '',
      bankAccountName: siteInfo.bankAccountName || '',
      bankAccountNumber: siteInfo.bankAccountNumber || '',
      bankName: siteInfo.bankName || '',
      bankIfscCode: siteInfo.bankIfscCode || '',
      upiId: siteInfo.upiId || '',
    });
  }, [siteInfo]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const updatedInfo = { ...siteInfo, ...formData };
      await saveSiteContent(updatedInfo);
      dispatch({ type: 'UPDATE_SITE_INFO', payload: updatedInfo });
      showSuccess('Contribution details saved and published.', 'Details Saved');
    } catch (error) {
      showError(error.message || 'Could not save contribution details.', 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses =
    'w-full px-3.5 py-2.5 text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Heart size={18} className="text-amber-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Public contribution page
          </span>
        </div>
        <h1 className="text-2xl font-bold text-primary-dark">Donation Details</h1>
        <p className="text-sm text-stone-500 mt-1">
          Manage the fundraising message and bank/UPI information shown at <span className="font-semibold">/donate</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-primary-dark">Fundraising message</h2>
            <p className="text-xs text-stone-500 mt-1">
              Describe the current fundraising purpose and how contributions will help.
            </p>
          </div>
          <textarea
            name="donationDescription"
            value={formData.donationDescription}
            onChange={updateField}
            rows={5}
            className={inputClasses}
            placeholder="Explain what you are raising funds for and how contributions will be used."
          />
        </section>

        <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-primary-dark">Bank transfer and UPI</h2>
            <p className="text-xs text-stone-500 mt-1">
              The UPI QR code on the public page is generated from the UPI ID entered here.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5"
                >
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete={field.autocomplete}
                  value={formData[field.name]}
                  onChange={updateField}
                  className={inputClasses}
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <Save size={16} />
            {isSaving ? 'Saving…' : 'Save Donation Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
