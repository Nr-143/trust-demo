import { useEffect, useState } from 'react';
import * as QRCodeModule from 'qrcode';
import { Banknote, Heart, Landmark, Smartphone } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useSite } from '../../context/SiteContext';

const QRCode = QRCodeModule.default || QRCodeModule;

export default function DonatePage() {
  const { siteInfo } = useSite();
  const [qrCode, setQrCode] = useState('');
  const [qrError, setQrError] = useState('');
  const upiId = (siteInfo.upiId || '').trim();
  const payeeName =
    siteInfo.bankAccountName || siteInfo.name || siteInfo.shortName || 'Mannin Maindhan Grama Arakkattalai';
  const upiLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR&tn=${encodeURIComponent('Donation')}`
    : '';

  useEffect(() => {
    let isCurrent = true;

    if (!upiLink) {
      setQrCode('');
      setQrError('');
      return () => {
        isCurrent = false;
      };
    }

    QRCode.toDataURL(upiLink, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 240,
      color: { dark: '#173B2A', light: '#FFFFFF' },
    })
      .then((dataUrl) => {
        if (isCurrent) {
          setQrCode(dataUrl);
          setQrError('');
        }
      })
      .catch((error) => {
        console.error('[DonatePage] Could not generate UPI QR code:', error);
        if (isCurrent) {
          setQrCode('');
          setQrError('The UPI QR code could not be generated. Please use the UPI ID shown below.');
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [upiLink]);

  const hasBankDetails = Boolean(
    siteInfo.bankAccountName ||
      siteInfo.bankAccountNumber ||
      siteInfo.bankName ||
      siteInfo.bankIfscCode
  );

  return (
    <>
      <PageHeader
        title="Contribute to Our Mission"
        description="Your support helps rural communities build a healthier, more sustainable future."
      />

      <section className="site-container py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-8 shadow-2xs mb-6">
            <div className="flex items-center gap-2 text-[#176B36] mb-3">
              <Heart size={19} className="fill-emerald-100" />
              <h2 className="text-lg font-bold text-[#173B2A]">Our fundraising purpose</h2>
            </div>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed whitespace-pre-line">
              {siteInfo.donationDescription ||
                'Your contribution supports the work of Mannin Maindhan Grama Arakkattalai and the rural communities we serve.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 shadow-2xs">
              <div className="flex items-center gap-2 mb-5">
                <Landmark size={19} className="text-[#176B36]" />
                <h2 className="text-lg font-bold text-[#173B2A]">Bank transfer</h2>
              </div>
              {hasBankDetails ? (
                <dl className="divide-y divide-stone-100">
                  {[
                    ['Account holder', siteInfo.bankAccountName],
                    ['Account number', siteInfo.bankAccountNumber],
                    ['Bank', siteInfo.bankName],
                    ['IFSC code', siteInfo.bankIfscCode],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 first:pt-0">
                        <dt className="text-xs font-semibold text-stone-500">{label}</dt>
                        <dd className="text-sm font-bold text-stone-800 break-all sm:text-right">{value}</dd>
                      </div>
                    ))}
                </dl>
              ) : (
                <p className="text-sm text-stone-500">
                  Bank transfer details will be published here once they are added by the trust administrator.
                </p>
              )}
            </section>

            <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-7 shadow-2xs">
              <div className="flex items-center gap-2 mb-5">
                <Smartphone size={19} className="text-[#176B36]" />
                <h2 className="text-lg font-bold text-[#173B2A]">Pay by UPI</h2>
              </div>
              {upiId ? (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {qrCode && (
                    <img
                      src={qrCode}
                      alt={`UPI payment QR code for ${upiId}`}
                      className="w-48 h-48 border border-stone-200 rounded-xl p-2"
                    />
                  )}
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-semibold text-stone-500 mb-1">UPI ID</p>
                    <p className="text-base font-bold text-stone-800 break-all">{upiId}</p>
                    <a
                      href={upiLink}
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-[#176B36] hover:bg-[#14532d] text-white text-sm font-semibold transition-colors"
                    >
                      <Banknote size={16} />
                      Open UPI app
                    </a>
                    {qrError && <p role="alert" className="text-xs text-red-700 mt-3">{qrError}</p>}
                    <p className="text-xs text-stone-500 mt-3">
                      Scan the QR code with your UPI app, or open the payment link on your phone.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-500">
                  UPI payment details will be published here once they are added by the trust administrator.
                </p>
              )}
            </section>
          </div>

          <p className="mt-6 text-xs text-stone-500 text-center">
            Please verify the recipient details in your payment app before confirming a transfer.
          </p>
        </div>
      </section>
    </>
  );
}
