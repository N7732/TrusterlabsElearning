import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, CheckCircle, Clock, AlertCircle, FileText, Download } from 'lucide-react';
import Button from '../../components/common/Button';

const Admission = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Dummy application data (for authenticated users)
  const applicationStatus = 'Pending'; // Could be 'Admitted', 'Pending', or 'None'
  
  if (!isAuthenticated) {
    return (
      <div className="bg-[#030712] min-h-[calc(100vh-64px)] flex items-center justify-center py-20 px-4 font-['Work_Sans',sans-serif]">
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-10 max-w-lg w-full text-center shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="text-[#D4AF37]" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            To view your admission status or start a new application for our cybersecurity training sessions, you need to log in to your account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" state={{ from: location }} className="w-full sm:w-auto">
              <button className="w-full bg-[#D4AF37] hover:bg-[#c29e2f] text-black font-bold py-3 px-8 rounded-lg transition-colors">
                Log In
              </button>
            </Link>
            <Link to="/register" state={{ from: location }} className="w-full sm:w-auto">
              <button className="w-full bg-transparent border border-[#D4AF37] text-white hover:bg-white/5 font-bold py-3 px-8 rounded-lg transition-colors">
                Register
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#030712] min-h-[calc(100vh-64px)] py-16 px-4 sm:px-6 lg:px-8 font-['Work_Sans',sans-serif]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Admission Portal</h1>
        
        {/* Profile Block */}
        <div className="bg-[#111827] border border-white/10 rounded-xl p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-lg">
          <div className="w-24 h-24 bg-gradient-to-br from-[#0A66C2] to-[#273B76] rounded-full flex items-center justify-center shrink-0 border-2 border-[#D4AF37]">
            <span className="text-3xl font-bold text-white uppercase">
              {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{user?.first_name} {user?.last_name}</h2>
            <p className="text-gray-400 mb-4">{user?.email}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
              <CheckCircle size={14} /> Account Verified
            </div>
          </div>
        </div>

        {/* Admission Result Block */}
        <div className="bg-[#111827] border border-[#D4AF37]/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.05)]">
          <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-b border-[#D4AF37]/20 px-8 py-5 flex items-center gap-3">
            <FileText className="text-[#D4AF37]" size={24} />
            <h3 className="text-xl font-bold text-white">Application Status</h3>
          </div>
          
          <div className="p-8">
            {applicationStatus === 'None' && (
              <div className="text-center py-8">
                <AlertCircle className="text-gray-500 mx-auto mb-4" size={48} />
                <h4 className="text-xl font-bold text-white mb-2">No Application Found</h4>
                <p className="text-gray-400 mb-6">You have not submitted an application for any training session yet.</p>
                <Link to="/training">
                  <Button className="bg-[#D4AF37] hover:bg-[#c29e2f] text-black border-none font-bold">Browse Training Sessions</Button>
                </Link>
              </div>
            )}

            {applicationStatus === 'Pending' && (
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Clock className="text-blue-400" size={36} />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h4 className="text-2xl font-bold text-white mb-2">Under Review</h4>
                  <p className="text-gray-400 mb-6">
                    Your application for the <strong>Advanced Penetration Testing Bootcamp</strong> is currently being reviewed by our admissions team. You will be notified via email once a decision has been made.
                  </p>
                  <div className="bg-[#030712] rounded-lg p-4 border border-white/5">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 block mb-1">Application ID</span>
                        <span className="text-white font-mono">TR-2026-8891</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-1">Submitted On</span>
                        <span className="text-white">July 02, 2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {applicationStatus === 'Admitted' && (
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle className="text-emerald-400" size={36} />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h4 className="text-2xl font-bold text-white mb-2">Congratulations! You're Admitted.</h4>
                  <p className="text-gray-400 mb-6">
                    Your application for the <strong>Enterprise Incident Response Strategy</strong> course has been accepted. We are thrilled to welcome you to TrusterLabs Academy.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Button className="bg-[#D4AF37] hover:bg-[#c29e2f] text-black border-none font-bold flex items-center gap-2">
                      <Download size={18} /> Download Admission Letter
                    </Button>
                    <Link to="/learner/dashboard">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admission;
