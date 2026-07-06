import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Search, CheckCircle, Clock, UserCheck, BookOpen } from 'lucide-react';

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  
  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/api/enrollments/');
      setEnrollments(data.results || data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load enrollments. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId) => {
    try {
      setProcessingId(enrollmentId);
      await apiClient.put(`/api/enrollments/${enrollmentId}/`, { is_active: true });
      
      // Update local state without full refetch
      setEnrollments(prev => prev.map(e => 
        e.id === enrollmentId ? { ...e, is_active: true, status: 'approved' } : e
      ));
    } catch (err) {
      console.error(err);
      alert('Failed to approve enrollment. The API endpoint might require specific fields.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (enrollmentId) => {
    if (!window.confirm("Are you sure you want to revoke access?")) return;
    try {
      setProcessingId(enrollmentId);
      await apiClient.put(`/api/enrollments/${enrollmentId}/`, { is_active: false });
      
      setEnrollments(prev => prev.map(e => 
        e.id === enrollmentId ? { ...e, is_active: false } : e
      ));
    } catch (err) {
      console.error(err);
      alert('Failed to revoke access.');
    } finally {
      setProcessingId(null);
    }
  };

  // Helper to determine enrollment type from data
  const getEnrollmentType = (enrollment) => {
    const course = enrollment.course_details || {};
    if (course.is_free) return 'free';
    if (!course.is_free && parseFloat(course.price || 0) > 0) return 'paid';
    return 'inquiry'; // If not free and price is 0/null, it's an inquiry course
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    // Tab filtering
    const type = getEnrollmentType(enrollment);
    if (activeTab === 'free' && type !== 'free') return false;
    if (activeTab === 'paid' && type !== 'paid') return false;
    if (activeTab === 'inquiries' && type !== 'inquiry') return false;

    // Search filtering
    if (!searchTerm) return true;
    
    // Safely extract name/email/title based on standard structures
    const searchString = `
      ${enrollment.learner_name || ''} 
      ${enrollment.learner_email || ''} 
      ${enrollment.user?.username || ''}
      ${enrollment.user?.email || ''}
      ${enrollment.course_details?.title || ''}
      ${enrollment.course_title || ''}
    `.toLowerCase();

    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Enrollments & Inquiries</h2>
          <p className="text-sm text-slate-500 mt-1">Manage course access requests and track student enrollments.</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden rounded-xl">
        <CardContent className="p-0">
          {/* Tabs and Search Bar */}
          <div className="flex flex-col md:flex-row border-b border-slate-200 bg-white">
            <div className="flex overflow-x-auto hide-scrollbar border-b md:border-b-0 border-slate-200">
              <button 
                onClick={() => handleTabChange('all')}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'all' ? 'border-[#3E8E41] text-[#3E8E41]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                All Enrollments
              </button>
              <button 
                onClick={() => handleTabChange('inquiries')}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'inquiries' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Inquiries & Approvals
              </button>
              <button 
                onClick={() => handleTabChange('paid')}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'paid' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Paid Learners
              </button>
              <button 
                onClick={() => handleTabChange('free')}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'free' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Free Access
              </button>
            </div>
            
            <div className="p-3 md:ml-auto md:border-l border-slate-200 flex-1 md:max-w-xs bg-slate-50">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search user or course..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E41] focus:border-transparent bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 text-red-600 bg-red-50 border-b border-red-100 text-sm font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3E8E41] mb-4"></div>
              <p className="text-slate-500 font-medium">Loading enrollments...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="p-4 font-bold">Learner</th>
                    <th className="p-4 font-bold">Course</th>
                    <th className="p-4 font-bold">Type</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <UserCheck className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-lg font-medium text-slate-600">No enrollments found.</p>
                          <p className="text-sm mt-1">Try adjusting your search or tab filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map(enrollment => {
                      const type = getEnrollmentType(enrollment);
                      const isActive = enrollment.is_active !== false; // Assume active unless explicitly false
                      
                      // Type Badge styling
                      let typeStyles = "bg-slate-100 text-slate-600";
                      let TypeLabel = "Unknown";
                      if (type === 'free') {
                        typeStyles = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                        TypeLabel = "Free";
                      } else if (type === 'paid') {
                        typeStyles = "bg-blue-50 text-blue-700 border border-blue-200";
                        TypeLabel = "Paid";
                      } else if (type === 'inquiry') {
                        typeStyles = "bg-amber-50 text-amber-700 border border-amber-200";
                        TypeLabel = "Inquiry";
                      }

                      // Status Badge styling
                      const statusStyles = isActive 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-amber-100 text-amber-800";

                      return (
                        <tr key={enrollment.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0 mr-3">
                                {(enrollment.learner_name || enrollment.user?.username || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">{enrollment.learner_name || enrollment.user?.first_name || enrollment.user?.username || `User ID: ${enrollment.user || 'Unknown'}`}</div>
                                <div className="text-xs text-slate-500">{enrollment.learner_email || enrollment.user?.email || 'No email provided'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-slate-700 truncate max-w-[200px]" title={enrollment.course_details?.title || enrollment.course_title || `Course ID: ${enrollment.course}`}>
                                {enrollment.course_details?.title || enrollment.course_title || `Course ID: ${enrollment.course}`}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${typeStyles}`}>
                              {TypeLabel}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              {isActive ? (
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-amber-600" />
                              )}
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${statusStyles}`}>
                                {isActive ? 'Active Access' : 'Pending Approval'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            {type === 'inquiry' && !isActive ? (
                              <Button 
                                onClick={() => handleApprove(enrollment.id)}
                                disabled={processingId === enrollment.id}
                                className="bg-[#3E8E41] hover:bg-[#317033] py-1.5 px-4 text-xs shadow-sm disabled:opacity-50"
                              >
                                {processingId === enrollment.id ? 'Approving...' : 'Approve Access'}
                              </Button>
                            ) : (
                              isActive && (
                                <button 
                                  onClick={() => handleRevoke(enrollment.id)}
                                  disabled={processingId === enrollment.id}
                                  className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  {processingId === enrollment.id ? 'Revoking...' : 'Revoke'}
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEnrollments;
