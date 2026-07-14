import React from 'react';
import Card, { CardContent } from '../../components/common/Card';
import CertificateTemplate from '../../components/common/CertificateTemplate';

const CertificateOverview = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Certificate Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Preview of the official TrusterLabs certificate layout</p>
        </div>
      </div>

      <div className="w-full flex justify-center bg-slate-100 p-8 rounded-xl shadow-inner border border-slate-200">
        <CertificateTemplate />
      </div>
    </div>
  );
};

export default CertificateOverview;
