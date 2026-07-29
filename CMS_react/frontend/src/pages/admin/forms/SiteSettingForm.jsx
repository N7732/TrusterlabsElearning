import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../../api/apiClient';
import { Settings, Phone, Share2, Save, ArrowLeft, Image as ImageIcon, ChevronUp, FileText, Megaphone } from 'lucide-react';

const SiteSettingForm = ({ isEditing, settingId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: '',
    contact_phone: '',
    location_address: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    instagram_url: '',
    navbar_logo: null,
    top_announcements: ''
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEditing && settingId) {
      fetchSettingData();
    } else {
      setLoading(false);
    }
  }, [isEditing, settingId]);

  const fetchSettingData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/settings/site-settings/${settingId}/`);
      setFormData({
        company_name: res.company_name || '',
        contact_email: res.contact_email || '',
        contact_phone: res.contact_phone || '',
        location_address: res.location_address || '',
        facebook_url: res.facebook_url || '',
        twitter_url: res.twitter_url || '',
        linkedin_url: res.linkedin_url || '',
        instagram_url: res.instagram_url || '',
        navbar_logo: res.navbar_logo || null,
        top_announcements: res.top_announcements || ''
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load site settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('company_name', formData.company_name);
      data.append('contact_email', formData.contact_email);
      data.append('contact_phone', formData.contact_phone);
      data.append('location_address', formData.location_address);
      data.append('facebook_url', formData.facebook_url);
      data.append('twitter_url', formData.twitter_url);
      data.append('linkedin_url', formData.linkedin_url);
      data.append('instagram_url', formData.instagram_url);
      data.append('top_announcements', formData.top_announcements);
      
      if (logoFile) {
        data.append('navbar_logo', logoFile);
      }

      if (isEditing) {
        await apiClient.put(`/settings/site-settings/${settingId}/`, data);
      } else {
        await apiClient.post('/settings/site-settings/', data);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A66C2]"></div>
      </div>
    );
  }

  // Common input classes
  const inputClass = "w-full p-2 border border-slate-200 rounded focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] text-sm text-slate-700 bg-white";
  const labelClass = "block text-sm text-slate-600";
  const rowClass = "grid grid-cols-[140px_1fr] gap-4 items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0";

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header section identical to screenshot */}
      <div className="flex justify-between items-center bg-white p-4 mb-6 shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 p-2 hover:bg-slate-100 rounded text-slate-600 font-medium transition-colors">
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-slate-300"></div>
          <h2 className="text-xl font-medium text-slate-800 hidden sm:flex items-center gap-2">
            <span className="text-slate-400">≡</span> Website Settings
          </h2>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={saving} 
          className="flex items-center gap-2 bg-[#2D6AE0] hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="mb-6 mx-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 mx-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded shadow-sm flex justify-between items-center transition-all">
          <span>Settings successfully saved and applied!</span>
        </div>
      )}

      {/* Grid Layout matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-6">
        
        {/* Panel 1: General Information */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-fit">
          <div className="flex justify-between items-center p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <FileText size={16} className="text-[#2D6AE0]" />
              <span>General Information</span>
            </div>
            <ChevronUp size={16} className="text-slate-400" />
          </div>
          <div className="p-5 space-y-5">
            <div className={rowClass}>
              <label className={labelClass}>Website Name</label>
              <div className="flex-1">
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. Trusterlabs Academy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-fit">
          <div className="flex justify-between items-center p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Phone size={16} className="text-[#2D6AE0]" />
              <span>Contact Information</span>
            </div>
            <ChevronUp size={16} className="text-slate-400" />
          </div>
          <div className="p-5 space-y-5">
            <div className={rowClass}>
              <label className={labelClass}>Primary Email</label>
              <div className="flex-1">
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. info@domain.com"
                />
              </div>
            </div>
            
            <div className={rowClass}>
              <label className={labelClass}>Primary Phone Number</label>
              <div className="flex-1">
                <input
                  type="text"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. +250 788 123 456"
                />
              </div>
            </div>

            <div className={rowClass}>
              <label className={labelClass}>Office Address</label>
              <div className="flex-1">
                <textarea
                  name="location_address"
                  value={formData.location_address}
                  onChange={handleChange}
                  rows="2"
                  className={inputClass}
                  placeholder="e.g. KG 541 St, Nyarugenge, Kigali, Rwanda"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Social Media */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-fit">
          <div className="flex justify-between items-center p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Share2 size={16} className="text-[#2D6AE0]" />
              <span>Social Media</span>
            </div>
            <ChevronUp size={16} className="text-slate-400" />
          </div>
          <div className="p-5 space-y-5">
            <div className={rowClass}>
              <label className="flex items-center gap-2 text-sm text-slate-600 min-w-[140px] shrink-0">
                <div className="w-5 h-5 rounded bg-[#1877F2] text-white flex items-center justify-center font-bold text-[10px]">f</div>
                Facebook URL
              </label>
              <div className="flex-1">
                <input
                  type="url"
                  name="facebook_url"
                  value={formData.facebook_url}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://facebook.com/trusterlabs"
                />
              </div>
            </div>

            <div className={rowClass}>
              <label className="flex items-center gap-2 text-sm text-slate-600 min-w-[140px] shrink-0">
                <div className="w-5 h-5 rounded bg-black text-white flex items-center justify-center font-bold text-[10px]">X</div>
                X (Twitter) URL
              </label>
              <div className="flex-1">
                <input
                  type="url"
                  name="twitter_url"
                  value={formData.twitter_url}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://twitter.com/trusterlabs"
                />
              </div>
            </div>

            <div className={rowClass}>
              <label className="flex items-center gap-2 text-sm text-slate-600 min-w-[140px] shrink-0">
                <div className="w-5 h-5 rounded bg-[#0A66C2] text-white flex items-center justify-center font-bold text-[10px]">in</div>
                LinkedIn URL
              </label>
              <div className="flex-1">
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://linkedin.com/company/trusterlabs"
                />
              </div>
            </div>

            <div className={rowClass}>
              <label className="flex items-center gap-2 text-sm text-slate-600 min-w-[140px] shrink-0">
                <div className="w-5 h-5 rounded bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white flex items-center justify-center font-bold text-[10px]">Ig</div>
                Instagram URL
              </label>
              <div className="flex-1">
                <input
                  type="url"
                  name="instagram_url"
                  value={formData.instagram_url}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="https://instagram.com/trusterlabs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel 4: Header Top Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-fit lg:col-span-2 xl:col-span-3">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-blue-50/50">
            <div className="flex items-center gap-2 text-[#0A66C2] font-semibold">
              <Megaphone size={18} />
              <span>Header Top Bar (Announcement Belt)</span>
            </div>
            <ChevronUp size={16} className="text-[#0A66C2]" />
          </div>
          <div className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-1/3 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-1">Announcement Text</label>
                <span className="text-xs text-slate-500">Put each scrolling announcement on a new line. They will cycle infinitely on the top banner.</span>
              </div>
              <div className="flex-1 w-full">
                <textarea
                  name="top_announcements"
                  value={formData.top_announcements}
                  onChange={handleChange}
                  rows="4"
                  className={`${inputClass} font-mono text-xs`}
                  placeholder={`✦ Latest News: TrusterLabs recognized as top cybersecurity provider...\n✦ Training: Next Cohort for Advanced Penetration Testing starts Sept 1st`}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SiteSettingForm;
