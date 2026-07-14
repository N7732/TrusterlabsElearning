import React, { useState, useEffect } from 'react';
import { Award, Search, Filter, AlertCircle, CheckCircle, Send, Plus } from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import { apiClient } from '../../api/apiClient';

const OfferCertificates = () => {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [programType, setProgramType] = useState('all');
  const [marksFilter, setMarksFilter] = useState(0); // 0 means no filter, otherwise minimum score (e.g. 70)
  
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEligibleLearners();
  }, []);

  const fetchEligibleLearners = async () => {
    setLoading(true);
    try {
      // Create a unified API endpoint to fetch completed enrollments/trainings
      const res = await apiClient.get('/certification/certificates/eligible_learners/');
      setLearners(res.data || res);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch eligible learners", err);
      setError("Failed to load eligible learners. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (learner) => {
    if (processing) return;
    setProcessing(true);
    setMessage('');
    
    try {
      const payload = {
        learner: learner.learner_id,
        is_issued: true
      };
      
      if (learner.program_type === 'course') {
        payload.course = learner.program_id;
      } else {
        payload.training = learner.program_id;
      }
      
      await apiClient.post('/certification/certificates/', payload);
      setMessage(`Certificate successfully issued to ${learner.learner_name}!`);
      
      // Optionally refresh list or remove them from this list if you only want unissued ones
    } catch (err) {
      console.error(err);
      setMessage(`Failed to issue certificate: ${err.response?.data?.detail || err.message}`);
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleSendReminder = async (learner) => {
    if (processing) return;
    setProcessing(true);
    setMessage('');
    
    try {
      await apiClient.post('/certification/certificates/notify_learner/', {
        learner_name: learner.learner_name,
        message: `Hello ${learner.learner_name}, you have completed ${learner.program_title} but did not meet the required marks for certification. Please review your performance.`
      });
      setMessage(`Reminder notification sent to ${learner.learner_name}.`);
    } catch (err) {
      console.error(err);
      setMessage(`Failed to send reminder: ${err.response?.data?.detail || err.message}`);
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Filter Logic
  const filteredLearners = learners.filter(l => {
    const matchesSearch = l.learner_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.program_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = programType === 'all' || l.program_type === programType;
    const matchesMarks = l.score >= marksFilter;
    
    return matchesSearch && matchesType && matchesMarks;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Offer Certificates</h1>
          <p className="text-slate-500 text-sm mt-1">Manage completed learners and issue certificates based on marks</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${message.includes('Failed') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {message.includes('Failed') ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      <Card className="border border-slate-100 shadow-sm rounded-xl">
        <CardContent className="p-0">
          
          {/* Filters Bar */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search learners or programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#153474] focus:border-transparent"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={programType}
                  onChange={(e) => setProgramType(e.target.value)}
                  className="border border-slate-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#153474]"
                >
                  <option value="all">All Programs</option>
                  <option value="course">Courses</option>
                  <option value="training">Trainings</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Award size={14} className="text-slate-400" />
                <select
                  value={marksFilter}
                  onChange={(e) => setMarksFilter(Number(e.target.value))}
                  className="border border-slate-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#153474]"
                >
                  <option value={0}>All Marks</option>
                  <option value={50}>&ge; 50%</option>
                  <option value={60}>&ge; 60%</option>
                  <option value={70}>&ge; 70%</option>
                  <option value={80}>&ge; 80%</option>
                  <option value={90}>&ge; 90%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Learner</th>
                  <th className="px-6 py-4 font-semibold">Program</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Score/Marks</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading eligible learners...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-red-500">{error}</td>
                  </tr>
                ) : filteredLearners.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      No learners match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredLearners.map((learner) => (
                    <tr key={learner.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#153474] text-white flex items-center justify-center font-bold text-xs">
                            {learner.learner_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{learner.learner_name}</p>
                            <p className="text-xs text-slate-500">ID: {learner.learner_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-800 font-medium line-clamp-1">{learner.program_title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-md ${
                          learner.program_type === 'course' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {learner.program_type === 'course' ? 'Course' : 'Training'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${learner.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {learner.score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {learner.score >= marksFilter ? (
                          <button 
                            onClick={() => handleIssueCertificate(learner)}
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#153474] text-white text-xs font-medium rounded-lg hover:bg-[#0b1b3d] transition-colors disabled:opacity-50"
                          >
                            <Plus size={14} /> Issue Cert
                          </button>
                        ) : null}
                        
                        {learner.score < 70 && (
                          <button 
                            onClick={() => handleSendReminder(learner)}
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                          >
                            <Send size={14} /> Reminder
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
};

export default OfferCertificates;
