import React, { useState, useEffect } from 'react';
import Card, { CardContent } from '../../components/common/Card';
import CertificateTemplate from '../../components/common/CertificateTemplate';
import { apiClient } from '../../api/apiClient';
import { Eye } from 'lucide-react';

const CertificateOverview = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await apiClient.get('/certification/api/certificates/');
      setCertificates(res.results || res);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Certificate Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view all awarded certificates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Certificate Winners</h2>
                <p className="text-sm text-slate-500">List of all learners who have been awarded certificates.</p>
              </div>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse relative">
                  <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm shadow-slate-200/50">
                    <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4 font-semibold">Learner Name</th>
                      <th className="px-6 py-4 font-semibold">Program</th>
                      <th className="px-6 py-4 font-semibold">Issue Date</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A66C2] mx-auto"></div>
                        </td>
                      </tr>
                    ) : certificates.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                          No certificates awarded yet.
                        </td>
                      </tr>
                    ) : (
                      certificates.filter(c => c.is_issued).map(cert => (
                        <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-900">{cert.learner_name}</p>
                            <p className="text-xs text-slate-500">{cert.certificate_id}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-700">{cert.program_title}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(cert.issued_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a 
                              href={`/verify/${cert.certificate_code}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-[#0A66C2] hover:text-blue-800 text-sm font-medium"
                            >
                              <Eye size={16} className="mr-1" /> View
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Template Preview</h2>
              <div className="w-full flex justify-center bg-slate-100 p-4 rounded-xl shadow-inner border border-slate-200">
                <CertificateTemplate />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CertificateOverview;
