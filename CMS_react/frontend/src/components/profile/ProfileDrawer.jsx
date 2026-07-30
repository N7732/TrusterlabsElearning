import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Settings, Save, Loader, Shield, Edit3, Image as ImageIcon, X } from 'lucide-react';

export default function ProfileDrawer() {
  const { user, updateProfile, isProfileOpen, toggleProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Determine user specific data
  const isLearner = user?.user_type === 'learner';
  const isInstructor = user?.user_type === 'instructor';
  const profileSpecificData = isLearner ? user?.learner_profile : user?.instructor_profile;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone_number: '',
    city: '',
    country: '',
    profile_picture: null
  });

  useEffect(() => {
    if (user) {
      const pSpecific = user.user_type === 'learner' ? user.learner_profile : user.instructor_profile;
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.extended_profile?.bio || pSpecific?.bio || '',
        phone_number: pSpecific?.phone_number || '',
        city: user.extended_profile?.city || '',
        country: user.extended_profile?.country || '',
        profile_picture: null
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_picture') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });
      
      await updateProfile(submitData);
      setMessage({ text: 'Profile updated successfully.', type: 'success' });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({ text: 'Failed to update. Please try again.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getInitials = () => {
    if (user.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isProfileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleProfile}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#090c10] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isProfileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#161b22]">
          <div className="flex items-center gap-3">
            <User className="text-[#D4AF37]" size={24} />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Operative Profile</h2>
          </div>
          <button 
            onClick={toggleProfile}
            className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8 bg-[#161b22] p-6 rounded-2xl border border-white/5">
            <div className="relative mb-4">
              {user.extended_profile?.profile_picture || (isInstructor && profileSpecificData?.profile_picture_url) ? (
                <img 
                  src={user.extended_profile?.profile_picture || profileSpecificData?.profile_picture_url} 
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-black ring-2 ring-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-black/50 border-2 border-black ring-2 ring-[#D4AF37]/50 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                  <span className="text-3xl font-bold text-[#D4AF37]">{getInitials()}</span>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.username || 'User')}
            </h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-3">
              <Shield size={12} />
              {user.user_type || 'Student'}
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Mail size={14} className="text-[#D4AF37]" />
              <span>{user.email}</span>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-[#161b22] p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-3">
              <Settings size={20} className="text-[#D4AF37]" /> Update Information
            </h3>

            {message.text && (
              <div className={`p-3 rounded-lg mb-6 text-sm border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Profile Avatar</label>
                <div className="flex items-center gap-3 bg-black/30 p-2 rounded-lg border border-white/5">
                  <div className="w-10 h-10 shrink-0 rounded-md bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                    <ImageIcon size={18} />
                  </div>
                  <input 
                    type="file" 
                    name="profile_picture" 
                    onChange={handleChange} 
                    accept="image/*"
                    className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:font-bold file:bg-[#D4AF37]/10 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/20 cursor-pointer w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">First Name</label>
                  <input 
                    type="text" 
                    name="first_name" 
                    value={formData.first_name} 
                    readOnly 
                    className="w-full bg-black/50 border border-white/5 rounded-lg p-2.5 text-sm text-gray-500 cursor-not-allowed outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Last Name</label>
                  <input 
                    type="text" 
                    name="last_name" 
                    value={formData.last_name} 
                    readOnly 
                    className="w-full bg-black/50 border border-white/5 rounded-lg p-2.5 text-sm text-gray-500 cursor-not-allowed outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="tel" 
                    name="phone_number" 
                    value={formData.phone_number} 
                    onChange={handleChange} 
                    placeholder="Add your phone number"
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 pl-10 text-sm text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">City</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleChange} 
                      placeholder="City"
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 pl-10 text-sm text-white focus:border-[#D4AF37] outline-none transition-all" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Country</label>
                  <input 
                    type="text" 
                    name="country" 
                    value={formData.country} 
                    onChange={handleChange} 
                    placeholder="Country"
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-[#D4AF37] outline-none transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Operational Bio</label>
                <textarea 
                  name="bio" 
                  rows="4" 
                  value={formData.bio} 
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c29e2f] text-black font-bold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-70 mt-4"
              >
                {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                {loading ? 'Saving...' : 'Save Profile Details'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
