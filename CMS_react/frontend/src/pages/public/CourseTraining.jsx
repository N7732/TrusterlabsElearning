import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

const CourseTraining = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await apiClient.get('/training/trainings/');
      setSessions(data);
    } catch (error) {
      console.error('Error fetching training sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (id) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setEnrollLoading(id);
    setMessage({ text: '', type: '' });
    try {
      await apiClient.post(`/training/trainings/${id}/apply/`, {});
      setMessage({ text: 'Application submitted successfully! Your admission status is now pending.', type: 'success' });
    } catch (error) {
      setMessage({ text: error.message || 'Failed to apply for training.', type: 'error' });
    } finally {
      setEnrollLoading(null);
    }
  };

  return (
    <div className="bg-[#030712] text-gray-300 font-['Work_Sans',sans-serif] min-h-screen pb-20">
      
      {/* Header Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-cyber opacity-30 pointer-events-none z-0"></div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="flex items-center gap-4 justify-center mb-6">
            <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
            <h2 className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">TrusterLabs Academy</h2>
            <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Upcoming Training Sessions
          </h1>
          <p className="text-lg text-gray-400">
            Secure your spot in our highly sought-after instructor-led training sessions. Learn directly from industry experts in immersive, hands-on environments designed to build real-world resilience.
          </p>
        </div>
      </section>

      {/* Available Sessions Section */}
      <section className="pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Available Sessions</h3>
            <p className="text-gray-400 text-sm">Enrollment is currently open for the following cohorts.</p>
          </div>
          <div className="hidden sm:block">
            <span className="text-[#D4AF37] text-sm font-semibold flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              View All Courses <ArrowRight size={16} />
            </span>
          </div>
        </div>

        {message.text && (
          <div className={`mb-8 p-4 rounded-lg border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No training sessions are currently available. Check back soon!
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.map(session => (
              <div key={session.id} className="bg-[#111827] border border-white/10 rounded-xl p-6 md:p-8 hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      Open for Enrollment
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-[#D4AF37] transition-colors">{session.title}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#D4AF37]" />
                      <span>{session.starting_date} to {session.ending_date}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-400 line-clamp-2">
                    {session.description}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:min-w-[200px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
                  <div className="flex-1 lg:flex-none">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Availability</p>
                    <p className="text-white font-bold text-lg">{session.max_participants} <span className="text-sm font-normal text-gray-400">max seats</span></p>
                  </div>
                  <button 
                    onClick={() => handleEnroll(session.id)}
                    disabled={enrollLoading === session.id}
                    className="bg-[#D4AF37] hover:bg-[#c29e2f] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-lg transition-colors w-full text-sm flex items-center justify-center gap-2"
                  >
                    {enrollLoading === session.id ? <Loader2 className="animate-spin" size={16} /> : null}
                    {enrollLoading === session.id ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
        
        {/* Contact CTA */}
        <div className="mt-16 bg-[#0a1930] border border-[#D4AF37]/20 rounded-xl p-8 text-center max-w-3xl mx-auto">
          <h4 className="text-xl font-bold text-white mb-3">Looking for Corporate Training?</h4>
          <p className="text-gray-400 mb-6 text-sm">We provide customized training sessions tailored to your organization's specific tech stack and compliance requirements.</p>
          <button className="border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 font-bold py-2.5 px-6 rounded-lg transition-colors">
            Request Custom Training
          </button>
        </div>

      </section>

    </div>
  );
};

export default CourseTraining;
