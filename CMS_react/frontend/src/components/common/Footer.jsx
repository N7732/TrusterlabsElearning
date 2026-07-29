import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import footerLogo from '../../assets/image2.jpeg';
import { apiClient } from '../../api/apiClient';

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiClient.get('/settings/site-settings/');
        // The API returns a single dictionary object for settings, not a list.
        if (data && !data.results && !Array.isArray(data)) {
          setSettings(data);
        } else if (data.results && data.results.length > 0) {
          setSettings(data.results[0]);
        } else if (Array.isArray(data) && data.length > 0) {
          setSettings(data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch site settings:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-[#071321] text-gray-300 pt-16 pb-4 border-t border-white/10 mt-auto font-['Work_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Company Info */}
          <div className="col-span-1">
            <img src={footerLogo} alt="TrusterLabs" className="h-16 w-auto mb-6 object-contain rounded-xl shadow-md" />
            <p className="text-sm text-gray-400 leading-relaxed">
              TrusterLabs is an enterprise-grade cybersecurity company empowering Africa with world-class training, cyber defense, and strategic consultancy.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-b border-white/10 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="text-[#D4AF37] text-xs">▸</span> Home</Link></li>
              <li><Link to="/about" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="text-[#D4AF37] text-xs">▸</span> About Us</Link></li>
              <li><Link to="/courses" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="text-[#D4AF37] text-xs">▸</span> Courses</Link></li>
              <li><Link to="/admission" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="text-[#D4AF37] text-xs">▸</span> Admission</Link></li>
              <li><Link to="/research/articles" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="text-[#D4AF37] text-xs">▸</span> Research</Link></li>
              <li><Link to="/membership" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="text-[#D4AF37] text-xs">▸</span> Membership</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-b border-white/10 pb-2 inline-block">Our Services</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="text-[#D4AF37] text-xs">▸</span> Penetration Testing</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="text-[#D4AF37] text-xs">▸</span> Security Operations Center</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="text-[#D4AF37] text-xs">▸</span> Incident Response</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="text-[#D4AF37] text-xs">▸</span> Strategic Consulting</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors flex items-center gap-2"><span className="text-[#D4AF37] text-xs">▸</span> Corporate Training</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-b border-white/10 pb-2 inline-block">Our Social Media</h3>
            <ul className="space-y-3 text-sm">
              {settings?.twitter_url && (
                <li><a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]">
                    <span className="font-bold text-white">𝕏</span>
                  </div>
                  X (Twitter)
                </a></li>
              )}
              {settings?.linkedin_url && (
                <li><a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]">
                    <span className="font-bold text-white">In</span>
                  </div>
                  LinkedIn
                </a></li>
              )}
              {settings?.facebook_url && (
                <li><a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]">
                    <span className="font-bold text-white">Fb</span>
                  </div>
                  Facebook
                </a></li>
              )}
              {settings?.instagram_url && (
                <li><a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center border border-white/10 hover:shadow-lg">
                    <span className="font-bold text-white">Ig</span>
                  </div>
                  Instagram
                </a></li>
              )}
              {!settings?.twitter_url && !settings?.linkedin_url && !settings?.facebook_url && !settings?.instagram_url && (
                <li><span className="text-gray-500">Social links coming soon</span></li>
              )}
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {settings?.company_name || 'TrusterLabs'}. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</a>
            <Link to="/terms-and-conditions" className="hover:text-[#D4AF37] transition-colors">Terms and Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
