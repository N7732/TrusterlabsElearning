import React, { useState, useEffect } from 'react';
import { Calendar, Clock, PlayCircle, X, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import image2 from '../../assets/image2.jpeg';

const ResearchWebinars = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Registration Modal State
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [regForm, setRegForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    membership_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/research/webinars/');
      if (res && res.results) {
        setWebinars(res.results.filter(w => w.status === 'UPCOMING'));
      } else if (Array.isArray(res)) {
        setWebinars(res.filter(w => w.status === 'UPCOMING'));
      }
    } catch (error) {
      console.error("Failed to fetch webinars:", error);
    } finally {
      setLoading(false);
    }
  };

  const openRegistration = (webinar) => {
    setSelectedWebinar(webinar);
    setRegSuccess(false);
    setRegError('');
    setRegForm({
      full_name: '',
      email: '',
      phone_number: '',
      membership_id: ''
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegError('');
    
    try {
      await apiClient.post('/api/research/webinar_registrations/', {
        webinar: selectedWebinar.id,
        ...regForm
      });
      setRegSuccess(true);
    } catch (err) {
      setRegError(err.detail || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#030712] min-h-[calc(100vh-64px)] font-['Work_Sans',sans-serif] pb-20">
      
      {/* Header */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10 relative text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-cyber opacity-30 pointer-events-none z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 justify-center mb-6">
            <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
            <h2 className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">Live & On-Demand</h2>
            <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Cybersecurity Webinars
          </h1>
          <p className="text-lg text-gray-400">
            Join TrusterLabs experts for live technical sessions, panel discussions, and deep-dives into the latest threats and defensive strategies.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h3 className="text-2xl font-bold text-white mb-8 border-l-4 border-[#D4AF37] pl-4">Webinar Library</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center text-gray-400 py-12">Loading webinars...</div>
          ) : webinars.length > 0 ? (
            webinars.map((webinar) => (
              <div key={webinar.id} className="bg-[#111827] rounded-xl border border-white/10 overflow-hidden group hover:border-[#D4AF37]/30 transition-colors flex flex-col h-full">
                <div className="h-48 relative overflow-hidden bg-slate-800">
                  <img 
                    src={webinar.thumbnail ? webinar.thumbnail : (webinar.thumbnail_url ? webinar.thumbnail_url : image2)} 
                    alt={webinar.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-500" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle size={48} className="text-white/70 group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {webinar.status}
                    </span>
                    {webinar.requires_membership_id && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                        Members Only
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h4 className="text-xl font-bold text-white mb-4 group-hover:text-[#D4AF37] transition-colors line-clamp-2">{webinar.title}</h4>
                  
                  <div className="space-y-2 text-sm text-gray-400 mb-6 flex-grow">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#D4AF37]" />
                      <span>{new Date(webinar.date_time).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#D4AF37]" />
                      <span>{new Date(webinar.date_time).toLocaleTimeString()}</span>
                    </div>
                    {webinar.description && (
                      <p className="mt-4 text-xs text-gray-500 line-clamp-3">{webinar.description}</p>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => openRegistration(webinar)}
                    className="block text-center w-full py-2.5 rounded-lg font-bold transition-colors bg-[#D4AF37] hover:bg-[#c29e2f] text-black"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">No upcoming webinars available right now.</div>
          )}
        </div>
      </section>

      {/* Registration Modal */}
      {selectedWebinar && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => setSelectedWebinar(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className="p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Register for Webinar</h3>
              <p className="text-sm text-gray-400 mt-1 line-clamp-1">{selectedWebinar.title}</p>
            </div>
            
            <div className="p-6">
              {regSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Registration Successful!</h4>
                  <p className="text-gray-400 text-sm">We've saved your spot. The meeting link will be emailed to you.</p>
                  <button 
                    onClick={() => setSelectedWebinar(null)}
                    className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  {regError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                      {regError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={regForm.full_name}
                      onChange={e => setRegForm({...regForm, full_name: e.target.value})}
                      className="w-full bg-[#030712] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={regForm.email}
                      onChange={e => setRegForm({...regForm, email: e.target.value})}
                      className="w-full bg-[#030712] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number (Optional)</label>
                    <input 
                      type="text" 
                      value={regForm.phone_number}
                      onChange={e => setRegForm({...regForm, phone_number: e.target.value})}
                      className="w-full bg-[#030712] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  {selectedWebinar.requires_membership_id && (
                    <div>
                      <label className="block text-sm font-medium text-[#D4AF37] mb-1">Membership ID (Required)</label>
                      <input 
                        type="text" 
                        required
                        value={regForm.membership_id}
                        onChange={e => setRegForm({...regForm, membership_id: e.target.value})}
                        placeholder="e.g. TL-MEM-123456"
                        className="w-full bg-[#030712] border border-[#D4AF37]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                      <p className="text-xs text-gray-500 mt-1">This is an exclusive webinar for TrusterLabs members.</p>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3 mt-4 rounded-lg font-bold transition-colors bg-[#D4AF37] hover:bg-[#c29e2f] text-black flex items-center justify-center disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Registration'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResearchWebinars;
