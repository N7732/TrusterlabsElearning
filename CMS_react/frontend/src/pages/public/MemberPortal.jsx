import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import { User, Shield, Briefcase, Calendar, ChevronRight, Award, Video, Loader, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';

const MemberPortal = () => {
  const [membershipId, setMembershipId] = useState('');
  const [membership, setMembership] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [trainings, setTrainings] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!membershipId.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await apiClient.get(`/api/membership/memberships/check/?membership_id=${membershipId.trim()}`);
      setMembership(res);
      fetchOpportunities();
    } catch (err) {
      setError('Invalid Membership ID. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    setLoadingData(true);
    try {
      const [trainingsRes, webinarsRes] = await Promise.all([
        apiClient.get('/training/trainings/'),
        apiClient.get('/api/research/webinars/')
      ]);
      const trainingsArr = Array.isArray(trainingsRes) ? trainingsRes : (trainingsRes?.results || []);
      const webinarsArr = Array.isArray(webinarsRes) ? webinarsRes : (webinarsRes?.results || []);
      setTrainings(trainingsArr.slice(0, 4));
      setWebinars(webinarsArr.slice(0, 4));
    } catch (err) {
      console.error('Failed to fetch opportunities', err);
    } finally {
      setLoadingData(false);
    }
  };

  const logout = () => {
    setMembership(null);
    setMembershipId('');
  };

  if (!membership) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#030712] flex items-center justify-center p-4">
        <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-transparent"></div>
          <div className="text-center mb-8">
            <Shield className="mx-auto text-[#D4AF37] mb-4" size={48} />
            <h2 className="text-2xl font-bold text-white mb-2">Member Portal</h2>
            <p className="text-gray-400 text-sm">Enter your Membership ID to access your portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Membership ID</label>
              <input 
                type="text" 
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
                required
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none text-center font-mono tracking-wider"
                placeholder="TL-MEM-XXXXX"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#D4AF37] text-black hover:bg-[#c29e2f] font-bold py-3 flex justify-center items-center"
            >
              {loading ? <Loader className="animate-spin mr-2" size={20} /> : null}
              {loading ? 'Authenticating...' : 'Access Portal'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#030712] text-white p-4 md:p-8 font-['Work_Sans',sans-serif]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#111827] border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-yellow-700 rounded-full flex items-center justify-center text-black font-bold text-3xl">
              {membership.Fullname ? membership.Fullname.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{membership.Fullname}</h1>
              <p className="text-[#D4AF37] font-mono text-sm tracking-widest">{membership.MembershipID}</p>
              <p className="text-gray-400 text-sm mt-1">{membership.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="border-white/20 text-white hover:bg-white/5">
            Log Out
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Training Opportunities */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="text-[#D4AF37]" size={24} /> Available Trainings
              </h2>
            </div>
            
            <div className="space-y-4">
              {loadingData ? (
                <div className="flex justify-center py-8"><Loader className="animate-spin text-[#D4AF37]" size={24} /></div>
              ) : trainings.length > 0 ? (
                trainings.map((training) => (
                  <div key={training.id} className="group bg-black/20 border border-white/5 rounded-lg p-4 hover:border-[#D4AF37]/50 transition-colors flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{training.title}</h3>
                      <p className="text-sm text-gray-400">{training.duration_hours} Hours • {training.level}</p>
                    </div>
                    <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black text-sm px-4 py-1 h-auto">
                      Apply
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No upcoming trainings available.</p>
              )}
            </div>
          </div>

          {/* Webinar Opportunities */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Video className="text-[#D4AF37]" size={24} /> Upcoming Webinars
              </h2>
            </div>
            
            <div className="space-y-4">
              {loadingData ? (
                <div className="flex justify-center py-8"><Loader className="animate-spin text-[#D4AF37]" size={24} /></div>
              ) : webinars.length > 0 ? (
                webinars.map((webinar) => (
                  <div key={webinar.id} className="group bg-black/20 border border-white/5 rounded-lg p-4 hover:border-[#D4AF37]/50 transition-colors flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{webinar.title}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Calendar size={14} /> {new Date(webinar.date_time).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black text-sm px-4 py-1 h-auto">
                      Register
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No upcoming webinars available.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberPortal;
