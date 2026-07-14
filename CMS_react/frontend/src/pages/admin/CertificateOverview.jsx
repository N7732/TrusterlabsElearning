import React from 'react';
import Card, { CardContent } from '../../components/common/Card';

const CertificateOverview = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Certificate Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Preview of the official TrusterLabs certificate structure</p>
        </div>
      </div>

      <Card className="border border-slate-100 shadow-xl rounded-xl bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="relative p-12 bg-white flex flex-col items-center text-center font-serif border-[16px] border-[#0b162c] m-4">
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

            <h3 className="text-4xl md:text-5xl font-bold text-[#0b162c] mb-6 border-b border-slate-300 pb-2 inline-block px-12">
              [Learner Full Name]
            </h3>

            <p className="text-lg text-slate-500 italic mb-6 max-w-2xl">
              has successfully completed all requirements and is awarded this certificate for the program:
            </p>

            <h4 className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-12 max-w-3xl leading-snug">
              [Program Title (Course or Training)]
            </h4>

            <div className="flex justify-between w-full max-w-3xl mt-12 px-8">
              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-slate-800 mb-2"></div>
                <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Date Issued</p>
                <p className="text-xs text-slate-500">[DD/MM/YYYY]</p>
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
              Certificate ID: [Unique UUID Code]
            </p>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateOverview;
