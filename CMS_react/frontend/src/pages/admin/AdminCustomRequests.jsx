import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import { Calendar, User, Search, Loader2, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';

const AdminCustomRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/training/custom-requests/');
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiClient.patch(`/training/custom-requests/${id}/`, { status: newStatus });
      setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.full_name.toLowerCase().includes(search.toLowerCase()) ||
    req.email.toLowerCase().includes(search.toLowerCase()) ||
    req.training_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#030712] min-h-screen text-gray-300 font-['Work_Sans',sans-serif] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Custom Training & Internship Requests</h1>
            <p className="text-gray-400 mt-1">Manage inbound requests from organizations and students.</p>
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#0a1930]/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#030712] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                No requests found.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0a1930] text-gray-400 font-medium uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Type & Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                            <User size={18} className="text-indigo-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{req.full_name}</div>
                            <div className="text-xs text-gray-500">{new Date(req.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{req.email}</div>
                        <div className="text-gray-400 text-xs">{req.phone_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 mb-2">
                          {req.training_type}
                        </span>
                        {req.training_type === 'Academic Internship' && (
                          <div className="text-xs text-gray-400 mt-1">
                            <span className="text-white font-medium">College:</span> {req.college} <br />
                            <span className="text-white font-medium">Field:</span> {req.learning_fields}
                          </div>
                        )}
                        {req.additional_info && (
                          <div className="mt-2 text-xs text-gray-500 flex gap-1 items-start max-w-xs">
                            <FileText size={14} className="shrink-0 mt-0.5 text-gray-400" />
                            <p className="line-clamp-2" title={req.additional_info}>{req.additional_info}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {req.status === 'PENDING' && <span className="inline-flex items-center gap-1.5 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20"><Clock size={12} /> Pending</span>}
                        {req.status === 'REVIEWED' && <span className="inline-flex items-center gap-1.5 text-purple-400 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20"><FileText size={12} /> Reviewed</span>}
                        {req.status === 'APPROVED' && <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"><CheckCircle size={12} /> Approved</span>}
                        {req.status === 'REJECTED' && <span className="inline-flex items-center gap-1.5 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20"><XCircle size={12} /> Rejected</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <select
                          className="bg-[#030712] border border-white/10 rounded px-2 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37]"
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="REVIEWED">Reviewed</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomRequests;
