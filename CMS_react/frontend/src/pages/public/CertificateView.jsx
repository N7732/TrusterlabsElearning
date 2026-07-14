import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, CheckCircle, ArrowLeft } from 'lucide-react';
import { apiClient } from '../../api/apiClient';

const CertificateView = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [code]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      // Wait, is it /certification/api/certificates/verify/ or /api/certification/...?
      // Let's try /certification/api/certificates/verify/ first, as used in LearnerDashboard
      const res = await apiClient.get(`/certification/api/certificates/verify/${code}/`).catch(() => 
        apiClient.get(`/api/certification/certificates/verify/${code}/`) // fallback
      );
      setCertificate(res.data || res);
    } catch (err) {
      console.error("Failed to verify certificate", err);
      setError("This certificate could not be verified or does not exist.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A66C2]"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Verification Failed</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#0A66C2] text-white rounded-md font-medium">Return Home</button>
        </div>
      </div>
    );
  }

  const learnerName = certificate.learner_name || 'Learner';
  const programTitle = certificate.course_details ? certificate.course_details.title : (certificate.training_details ? certificate.training_details.title : 'Program Completion');
  const issueDate = new Date(certificate.issued_at || certificate.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-12 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-5xl mx-auto">
        
        {/* Action Bar - Hidden during printing */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
          <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-[#0A66C2] font-medium mb-4 md:mb-0">
            <ArrowLeft size={18} className="mr-2" /> Back
          </button>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {copied ? <CheckCircle size={16} className="text-emerald-500" /> : <Share2 size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button 
              onClick={handleLinkedInShare}
              className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg text-sm font-medium hover:bg-[#004182] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              Share on LinkedIn
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
            >
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>

        {/* Certificate Container */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden print:shadow-none print:rounded-none">
          <div className="relative p-12 bg-white flex flex-col items-center text-center font-serif border-[16px] border-[#0b162c] m-4 print:m-0 print:border-[12px] print:h-[100vh] print:justify-center">
            
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#D4AF37] m-4"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#D4AF37] m-4"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#D4AF37] m-4"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#D4AF37] m-4"></div>

            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-[#0b162c] tracking-widest uppercase mb-2">TrusterLabs</h1>
              <div className="h-1 w-32 bg-[#D4AF37] mx-auto"></div>
            </div>

            <h2 className="text-3xl md:text-4xl text-slate-700 font-bold mb-4 uppercase tracking-widest" style={{ letterSpacing: '0.2em' }}>
              Certificate of Completion
            </h2>

            <p className="text-lg text-slate-500 italic mb-6">
              This is to certify that
            </p>

            <h3 className="text-4xl md:text-5xl font-bold text-[#0b162c] mb-6 border-b border-slate-300 pb-2 inline-block px-12 capitalize">
              {learnerName}
            </h3>

            <p className="text-lg text-slate-500 italic mb-6 max-w-2xl">
              has successfully completed all requirements and is awarded this certificate for the program:
            </p>

            <h4 className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-12 max-w-3xl leading-snug">
              {programTitle}
            </h4>

            <div className="flex justify-between w-full max-w-3xl mt-12 px-8">
              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-slate-800 mb-2"></div>
                <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Date Issued</p>
                <p className="text-xs text-slate-500">{issueDate}</p>
              </div>

              <div className="flex flex-col items-center relative">
                <div className="w-24 h-24 rounded-full border-4 border-[#D4AF37] bg-white absolute -top-16 flex items-center justify-center text-[#D4AF37] font-bold rotate-12 shadow-inner">
                  SEAL
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-slate-800 mb-2"></div>
                <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Authorized Signature</p>
                <p className="text-xs text-slate-500">TrusterLabs Director</p>
              </div>
            </div>
            
            <p className="mt-16 text-xs text-slate-400 font-sans">
              Certificate ID: {certificate.certificate_code}
            </p>
            <p className="mt-2 text-[10px] text-slate-400 font-sans print:block hidden">
              Verify this certificate at: {window.location.href}
            </p>

          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateView;
