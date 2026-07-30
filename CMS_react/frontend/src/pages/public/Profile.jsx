import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Settings, Save, Loader, Shield, Edit3, Image as ImageIcon } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Determine user specific data
  const isLearner = user?.user_type === 'learner';
  const isInstructor = user?.user_type === 'instructor';
  const profileSpecificData = isLearner ? user?.learner_profile : user?.instructor_profile;

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.extended_profile?.bio || profileSpecificData?.bio || '',
    phone_number: profileSpecificData?.phone_number || '',
    city: user?.extended_profile?.city || '',
    country: user?.extended_profile?.country || '',
    profile_picture: null
  });

  useEffect(() => {
    if (user) {
      const pSpecific = user.user_type === 'learner' ? user.learner_profile : user.instructor_profile;
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.extended_profile?.bio || pSpecific?.bio || '',
        phone_number: pSpecific?.phone_number || '',
        city: user.extended_profile?.city || '',
        country: user.extended_profile?.country || '',
        profile_picture: null
      }));
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
      setMessage({ text: 'Profile configurations successfully updated.', type: 'success' });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({ text: 'Failed to update configurations. Please try again.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin text-[#D4AF37] mb-4" size={40} />
          <p className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    if (user.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#030712] text-white font-['Work_Sans',sans-serif] pb-20">
      
      {/* Header Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-cyber opacity-30 pointer-events-none z-0"></div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="flex items-center gap-4 justify-center mb-6">
            <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
            <h2 className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">Command Center</h2>
            <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Operative Profile
          </h1>
          <p className="text-lg text-gray-400">
            Manage your digital footprint, security clearances, and communication channels.
          </p>
        </div>
      </section>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/3">
             <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    {user.extended_profile?.profile_picture || (isInstructor && profileSpecificData?.profile_picture_url) ? (
                      <img 
                        src={user.extended_profile?.profile_picture || profileSpecificData?.profile_picture_url} 
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-black ring-2 ring-[#D4AF37]/50 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-black/50 border-4 border-black ring-2 ring-[#D4AF37]/50 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                        <span className="text-4xl font-bold text-[#D4AF37]">{getInitials()}</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.username || 'User')}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-6">
                    <Shield size={14} />
                    {user.user_type || 'Student'}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-8 bg-black/30 px-4 py-2 rounded-xl border border-white/5">
                    <Mail size={16} className="text-[#D4AF37]" />
                    <span>{user.email}</span>
                  </div>
                  
                  <div className="w-full space-y-3">
                    {user.is_learner && (
                      <Link to="/edit-profile" className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors font-bold text-white">
                        <Edit3 size={18} /> Edit Core Profile
                      </Link>
                    )}
                    {user.is_instructor && (
                      <Link to="/edit-profile/instructor" className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors font-bold text-white">
                        <Edit3 size={18} /> Edit Core Profile
                      </Link>
                    )}
                    
                    <button 
                      onClick={() => setShowSettings(!showSettings)}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#D4AF37] hover:bg-[#c29e2f] text-black font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    >
                      <Settings size={18} /> Profile Settings
                    </button>
                  </div>
                </div>
             </div>
          </div>

          {/* Main Column */}
          <div className="w-full lg:w-2/3 space-y-8">
             
             {/* Info Card */}
             <div className="bg-[#111827] border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                  <User size={24} className="text-[#D4AF37]" /> Operational Bio
                </h3>
                <p className="text-gray-400 leading-relaxed mb-10">
                  {user.extended_profile?.bio || "No bio information found. Update your profile to add your operational background."}
                </p>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4 mt-8">
                  <Phone size={24} className="text-[#D4AF37]" /> Contact Intel
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Comm Link</p>
                      <p className="text-white font-medium">{profileSpecificData?.phone_number || "Classified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Base of Operations</p>
                      <p className="text-white font-medium">
                        {user.extended_profile?.city || "Unknown"}, {user.extended_profile?.country || "Location"}
                      </p>
                    </div>
                  </div>
                </div>
             </div>

             {/* Settings Form */}
             {showSettings && (
               <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 border-t-4 border-t-[#D4AF37] animate-fade-in-up transition-all duration-300">
                 <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">System Configurations</h3>
                 
                 {message.text && (
                   <div className={`p-4 rounded-xl mb-8 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                     {message.text}
                   </div>
                 )}

                 <form onSubmit={handleSaveSettings} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     
                     <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Profile Avatar</label>
                        <div className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/10">
                          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                            <ImageIcon size={20} />
                          </div>
                          <input 
                            type="file" 
                            name="profile_picture" 
                            onChange={handleChange} 
                            accept="image/*"
                            className="text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#D4AF37]/10 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/20 file:transition-colors file:cursor-pointer"
                          />
                        </div>
                     </div>

                     <div>
                       <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">First Name</label>
                       <input 
                         type="text" 
                         name="first_name" 
                         value={formData.first_name} 
                         readOnly 
                         className="w-full bg-black/50 border border-white/5 rounded-xl p-3.5 text-gray-500 cursor-not-allowed outline-none" 
                       />
                     </div>

                     <div>
                       <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Last Name</label>
                       <input 
                         type="text" 
                         name="last_name" 
                         value={formData.last_name} 
                         readOnly 
                         className="w-full bg-black/50 border border-white/5 rounded-xl p-3.5 text-gray-500 cursor-not-allowed outline-none" 
                       />
                     </div>

                     <div className="md:col-span-2">
                       <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Email Designation</label>
                       <input 
                         type="email" 
                         name="email" 
                         value={user.email || ''} 
                         readOnly 
                         className="w-full bg-black/50 border border-white/5 rounded-xl p-3.5 text-gray-500 cursor-not-allowed outline-none" 
                       />
                     </div>

                     <div className="md:col-span-2">
                       <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Comm Link (Phone)</label>
                       <input 
                         type="tel" 
                         name="phone_number" 
                         value={formData.phone_number} 
                         onChange={handleChange} 
                         className="w-full bg-black/30 border border-white/10 rounded-xl p-3.5 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all" 
                       />
                     </div>

                     <div className="md:col-span-2">
                       <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Operational Bio</label>
                       <textarea 
                         name="bio" 
                         rows="4" 
                         value={formData.bio} 
                         onChange={handleChange}
                         className="w-full bg-black/30 border border-white/10 rounded-xl p-3.5 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all resize-y"
                       ></textarea>
                     </div>

                     <div>
                       <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">City</label>
                       <input 
                         type="text" 
                         name="city" 
                         value={formData.city} 
                         onChange={handleChange} 
                         className="w-full bg-black/30 border border-white/10 rounded-xl p-3.5 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all" 
                       />
                     </div>

                     <div>
                       <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Country</label>
                       <input 
                         type="text" 
                         name="country" 
                         value={formData.country} 
                         onChange={handleChange} 
                         className="w-full bg-black/30 border border-white/10 rounded-xl p-3.5 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all" 
                       />
                     </div>
                   </div>

                   <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                     <button 
                       type="submit" 
                       disabled={loading}
                       className="flex items-center justify-center gap-2 w-full sm:w-auto bg-[#D4AF37] hover:bg-[#c29e2f] text-black font-bold py-3.5 px-8 rounded-xl transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                       {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                       {loading ? 'Saving Parameters...' : 'Save Configurations'}
                     </button>
                   </div>
                 </form>
               </div>
             )}

          </div>
        </div>
      </div>
    </div>
  );
}
