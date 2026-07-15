import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Award, ShieldCheck } from 'lucide-react';

const CertificateSearch = () => {
  const [certId, setCertId] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (certId.trim()) {
      navigate(`/verify/${certId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#0A66C2] p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Award className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verify Certificate</h1>
          <p className="text-blue-100 text-sm">
            Enter the unique Certificate ID to verify its authenticity and view completion details.
          </p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="certId" className="block text-sm font-medium text-slate-700 mb-2">
                Certificate ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="certId"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-[#0A66C2] text-sm"
                  placeholder="e.g. TL-2026-123456"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0A66C2] hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Verify Authenticity
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CertificateSearch;
