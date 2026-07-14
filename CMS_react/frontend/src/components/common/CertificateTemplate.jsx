import React from 'react';

const CertificateTemplate = ({ 
  learnerName = "XXXXXXXXXXXXXXXXX",
  programTitle = "SSL/TLS: Securing Communication on the Internet",
  duration = "1.5-Hour",
  description = "SSL/TLS Fundamentals\nCryptography Basics\nHow SSL/TLS Works\nSSL Certificates\nHands-On Lab",
  instructorName = "Jean Chrysostome ND",
  issueDate = "DD/MM/YYYY"
}) => {
  return (
    <div className="relative w-full max-w-[1056px] aspect-[1.414/1] bg-white overflow-hidden shadow-2xl mx-auto flex flex-col items-center justify-center font-serif text-slate-800" style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
      
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </div>

      {/* --- Corner Geometrics (Using SVG for perfect print rendering) --- */}
      
      {/* Top Left Geometrics */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] pointer-events-none">
        {/* Dark Blue Triangle */}
        <svg viewBox="0 0 400 400" className="absolute top-0 left-0 w-full h-full">
          <polygon points="0,0 280,0 0,380" fill="#3B5998" />
        </svg>
        {/* Yellow Stripe */}
        <svg viewBox="0 0 400 400" className="absolute top-0 left-0 w-full h-full">
          <polygon points="0,380 280,0 320,0 0,420" fill="#EAAA00" />
        </svg>
        {/* Grey/Blue smaller triangles */}
        <svg viewBox="0 0 400 400" className="absolute top-0 left-0 w-full h-full opacity-80">
          <polygon points="0,200 120,200 60,300" fill="#7888A8" />
          <polygon points="0,250 80,300 0,350" fill="#3B5998" />
        </svg>
      </div>

      {/* Bottom Right Geometrics */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none">
        <svg viewBox="0 0 400 400" className="absolute bottom-0 right-0 w-full h-full">
          {/* Yellow Stripe */}
          <polygon points="400,0 120,400 80,400 400,-40" fill="#EAAA00" />
          {/* Dark Blue Triangle */}
          <polygon points="400,0 120,400 400,400" fill="#3B5998" />
          {/* Grey/Blue smaller triangles */}
          <polygon points="400,180 340,300 400,340" fill="#7888A8" />
          <polygon points="340,350 400,320 400,400" fill="#EAAA00" />
        </svg>
      </div>

      {/* Top Right Geometrics */}
      <div className="absolute top-0 right-0 w-[200px] h-[200px] pointer-events-none">
        <svg viewBox="0 0 200 200" className="absolute top-0 right-0 w-full h-full">
          <polygon points="200,0 80,0 200,120" fill="#F4F5F7" />
          <polygon points="170,120 190,120 190,140" fill="#3B5998" />
          <polygon points="200,180 170,200 200,200" fill="#EAAA00" />
        </svg>
      </div>

      {/* Bottom Left Geometrics */}
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] pointer-events-none">
        <svg viewBox="0 0 200 200" className="absolute bottom-0 left-0 w-full h-full">
          <polygon points="0,200 120,200 0,80" fill="#F4F5F7" />
          <polygon points="0,40 40,40 20,80" fill="#EAAA00" />
          <polygon points="40,160 60,110 60,160" fill="#7888A8" />
        </svg>
      </div>


      {/* --- Certificate Content --- */}
      
      <div className="relative z-10 w-full px-[10%] flex flex-col items-center mt-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[2.5rem] font-sans font-bold text-[#3B5998] tracking-wider mb-1" style={{ transform: 'scaleY(1.1)' }}>
            TRUSTLABS ACADEMY
          </h1>
          <p className="text-[1.1rem] font-sans text-slate-700 tracking-wide">
            Cybersecurity Excellence | <span className="text-[#3E8E41]">Born in Rwanda</span> | Built for Africa
          </p>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <h2 className="text-[3.5rem] text-[#3B5998] font-serif tracking-widest mb-2 uppercase" style={{ transform: 'scaleY(1.05)' }}>
            CERTIFICATE
          </h2>
          <h3 className="text-[1.8rem] font-serif font-bold text-black tracking-widest uppercase border-b-[3px] border-black inline-block pb-1">
            OF PARTICIPATION
          </h3>
        </div>

        {/* Awardee */}
        <div className="text-center mb-8 w-full">
          <p className="text-[1.2rem] font-sans text-slate-800 mb-6">
            This Certificate is Proudly Awarded to
          </p>
          <div className="relative inline-block w-full max-w-[80%]">
            <h4 className="text-[2.5rem] font-serif font-bold text-[#D4AF37] tracking-wider text-center px-8 border-b border-black pb-2">
              {learnerName}
            </h4>
          </div>
        </div>

        {/* Description */}
        <div className="text-center mb-12 max-w-[85%]">
          <p className="text-[1.4rem] font-serif text-black leading-relaxed mb-2">
            For successful participation in a {duration} Online Cybersecurity Workshop
          </p>
          <p className="text-[1.6rem] font-serif font-bold text-black mb-6">
            “{programTitle}”
          </p>
          
          <div className="flex justify-center text-left max-w-2xl mx-auto">
            <div className="font-bold text-[1.2rem] font-sans mr-4 whitespace-nowrap mt-1">Covered:</div>
            <div className="text-[1.1rem] font-sans leading-relaxed text-slate-800 flex-1 whitespace-pre-line">
              {description}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[1.2rem] font-serif text-black mb-16">
          Issued by: Truster Labs – Kigali, Rwanda
        </p>

        {/* Signatures */}
        <div className="flex justify-between items-end w-full px-8 pb-8 relative">
          {/* Bottom border line */}
          <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-black"></div>
          
          {/* Left Signature */}
          <div className="flex flex-col items-center text-center pb-2">
            <div className="w-64 border-b border-black mb-2"></div>
            <p className="font-bold font-sans text-[1.1rem] text-[#0A2342]">{instructorName}</p>
            <p className="font-sans text-[1rem] text-slate-700">Instructor</p>
          </div>

          {/* Logo */}
          <div className="flex flex-col items-center pb-2 px-8">
            <div className="w-16 h-16 relative flex items-center justify-center">
              {/* Simple mock of TrusterLabs logo (Lock/Shield + Text) */}
              <svg viewBox="0 0 100 100" className="w-12 h-12">
                <path d="M50 10 L80 30 L80 60 Q80 90 50 95 Q20 90 20 60 L20 30 Z" fill="none" stroke="#EAAA00" strokeWidth="6" />
                <rect x="40" y="45" width="20" height="20" fill="#3B5998" />
                <circle cx="50" cy="35" r="10" fill="none" stroke="#EAAA00" strokeWidth="6" />
              </svg>
            </div>
            <div className="text-[#3B5998] font-bold text-[0.6rem] tracking-widest mt-1">
              TRUSTLABS
            </div>
          </div>

          {/* Right Signature */}
          <div className="flex flex-col items-center text-center pb-2">
            <div className="w-64 border-b border-black mb-2"></div>
            <p className="font-bold font-sans text-[1.1rem] text-[#0A2342]">Mr. Dominique HARELIMANA</p>
            <p className="font-sans text-[1rem] text-slate-700">TrusterLabs CEO</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificateTemplate;
