import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, CheckCircle, ArrowLeft, ShieldCheck, User, Mail, Calendar, BookOpen, Award } from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import CertificateTemplate from '../../components/common/CertificateTemplate';

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
          <button onClick={() => navigate('/verify')} className="px-6 py-2 bg-[#0A66C2] text-white rounded-md font-medium">Try Another ID</button>
        </div>
      </div>
    );
  }

  const learnerName = certificate.learner_name || 'Learner';
  
  // Extract Details object (either Course or Training)
  const details = certificate.course_details || certificate.training_details || {};
  
  const customDuration = details.certificate_duration || (certificate.course_details && details.duration_days ? details.duration_days + ' Days' : '');
  const customCourseName = details.certificate_type_text || (certificate.course_details ? 'Course' : 'Training');
  const programTitle = details.certificate_program_title || details.title || certificate.program_title || 'Program Completion';
  const customDescription = details.certificate_description || details.description || '';

  const issueDateStr = certificate.completed_at || certificate.issued_at || certificate.created_at;
  const issueDate = new Date(issueDateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const enrolledDate = certificate.enrolled_at ? new Date(certificate.enrolled_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const certIdDisplay = certificate.certificate_id || certificate.certificate_code || code;

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-12 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Action Bar - Hidden during printing */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
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

        {/* Verification Metadata Panel - Hidden during printing */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden print:hidden">
          <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center">
            <ShieldCheck className="text-emerald-600 w-6 h-6 mr-3" />
            <h2 className="text-lg font-bold text-emerald-800">Verified Certificate Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 font-medium flex items-center"><Award className="w-4 h-4 mr-2" /> Certificate ID</p>
                <p className="text-slate-800 font-semibold">{certIdDisplay}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium flex items-center"><BookOpen className="w-4 h-4 mr-2" /> Program / Course</p>
                <p className="text-slate-800 font-semibold">{programTitle}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium flex items-center"><User className="w-4 h-4 mr-2" /> Awarded To</p>
                <p className="text-slate-800 font-semibold">{learnerName}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 font-medium flex items-center"><Calendar className="w-4 h-4 mr-2" /> Enrollment Date</p>
                <p className="text-slate-800 font-semibold">{enrolledDate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium flex items-center"><Calendar className="w-4 h-4 mr-2" /> Completion Date</p>
                <p className="text-slate-800 font-semibold">{issueDate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium flex items-center"><Mail className="w-4 h-4 mr-2" /> Contact Info</p>
                <p className="text-slate-800 font-semibold">
                  {certificate.learner_email || 'N/A'} {certificate.learner_phone ? `| ${certificate.learner_phone}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Container */}
        <div id="certificate-container" className="flex justify-center bg-white shadow-xl rounded-xl overflow-hidden print:shadow-none print:rounded-none">
          <CertificateTemplate 
            learnerName={learnerName}
            courseName={customCourseName}
            programTitle={programTitle}
            duration={customDuration}
            description={customDescription}
            instructorName="Jean Chrysostome ND"
            issueDate={issueDate}
            certificateID={certIdDisplay}
            verificationURL={window.location.href}
          />
        </div>
      </div>

      <style>{`
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden;
          }
          #certificate-container, #certificate-container * {
            visibility: visible;
          }
          #certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: 1123px;
            height: 794px;
            display: block;
            overflow: visible;
          }
          @page {
            size: 1123px 794px;
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
