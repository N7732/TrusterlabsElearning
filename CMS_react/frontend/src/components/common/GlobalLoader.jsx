import React from 'react';
import logo from '../../assets/image2.jpeg';

const GlobalLoader = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-[#030712] flex flex-col items-center justify-center min-h-screen w-full">
      <div className="relative flex flex-col items-center">
        {/* Glow effect behind the logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-2xl animate-pulse"></div>
        
        {/* Logo Container */}
        <div className="bg-white rounded-full px-6 py-3 shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-pulse relative z-10 mb-6">
          <img src={logo} alt="Trusterlabs" className="h-16 w-auto object-contain" />
        </div>
        
        {/* Loading Text */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <p className="text-[#D4AF37] font-semibold tracking-widest uppercase mt-4 text-sm animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default GlobalLoader;
