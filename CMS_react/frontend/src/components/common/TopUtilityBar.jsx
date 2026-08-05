import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import useSWR from 'swr';

const TopUtilityBar = () => {
  const { data: rawSettings } = useSWR('/settings/site-settings/', {
    dedupingInterval: 60000,
    keepPreviousData: true,
  });

  const settings = React.useMemo(() => {
    if (!rawSettings) return null;
    if (!rawSettings.results && !Array.isArray(rawSettings)) {
      return rawSettings;
    } else if (rawSettings.results && rawSettings.results.length > 0) {
      return rawSettings.results[0];
    } else if (Array.isArray(rawSettings) && rawSettings.length > 0) {
      return rawSettings[0];
    }
    return null;
  }, [rawSettings]);

  return (
    <div className="bg-[#071321]/90 backdrop-blur-md h-[40px] border-b border-white/10 relative overflow-hidden flex items-center font-['Work_Sans',sans-serif] shadow-[0_0_15px_rgba(59,130,246,0.2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center h-full">
        {/* Left: Scrolling Ticker */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center pr-8 mask-image-linear-right">
          <div className="animate-ticker whitespace-nowrap text-gray-300 text-xs tracking-wide hover:[animation-play-state:paused] flex w-max">
            {/* We duplicate the content to create a seamless infinite loop */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-12 pr-12">
                {settings?.top_announcements ? (
                  settings.top_announcements.split('\n').filter(a => a.trim()).map((announcement, idx) => (
                    <span key={idx}><span className="text-[#D4AF37] mr-2">✦</span>{announcement.trim()}</span>
                  ))
                ) : (
                  <>
                    <span><span className="text-[#D4AF37] mr-2">✦</span>Latest News: TrusterLabs recognized as top cybersecurity provider in East Africa</span>
                    <span><span className="text-[#D4AF37] mr-2">✦</span>Training: Next Cohort for Advanced Penetration Testing starts Sept 1st</span>
                    <span><span className="text-[#D4AF37] mr-2">✦</span>Updates: New Enterprise Security Operations Center (SOC) officially launched</span>
                    <span><span className="text-[#D4AF37] mr-2">✦</span>Services: 24/7 Incident Response and Threat Hunting now available</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Contact Info */}
        <div className="hidden md:flex items-center gap-6 text-gray-300 text-xs font-medium shrink-0 pl-4 border-l border-white/10">
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <Phone size={14} className="text-[#D4AF37]" />
            <span>{settings?.contact_phone || '+250791756434'}</span>
          </div>
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <Mail size={14} className="text-[#D4AF37]" />
            <span>{settings?.contact_email || 'trusteraccademic@gmail.com'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37]">24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUtilityBar;
