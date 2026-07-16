import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { adminConfig } from '../../config/adminConfig';
import { apiClient } from '../../api/apiClient';
import Button from '../../components/common/Button';
import Card, { CardContent } from '../../components/common/Card';
import { Plus, Edit, Trash2, Upload, Loader2, Users, Copy, Filter, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ReuseRequestModal from '../../components/common/ReuseRequestModal';

const SuperAdminEntityList = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [viewMode, setViewMode] = useState('my'); // 'my' or 'global'
  
  // Reuse Request specific state
  const [reuseModalOpen, setReuseModalOpen] = useState(false);
  const [reuseEntity, setReuseEntity] = useState({ id: null, title: '' });
  
  // Bulk Enrollment specific state
  const [showBulkEnroll, setShowBulkEnroll] = useState(false);
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkCourseId, setBulkCourseId] = useState('');

  // Filtering state
  const [filterData, setFilterData] = useState({ courses: [], modules: [], quizzes: [] });
  const [selectedCourse, setSelectedCourse] = useState(localStorage.getItem('truster_filter_course') || '');
  const [selectedModule, setSelectedModule] = useState(localStorage.getItem('truster_filter_module') || '');
  const [selectedQuiz, setSelectedQuiz] = useState(localStorage.getItem('truster_filter_quiz') || '');

  // Reset filters when changing routes if desired, but user wants persistence across sessions
  useEffect(() => {
    setSelectedCourse(localStorage.getItem('truster_filter_course') || '');
    setSelectedModule(localStorage.getItem('truster_filter_module') || '');
    setSelectedQuiz(localStorage.getItem('truster_filter_quiz') || '');
  }, [entityId]);

  const handleCourseChange = (e) => {
    const val = e.target.value;
    setSelectedCourse(val);
    if (val) localStorage.setItem('truster_filter_course', val);
    else localStorage.removeItem('truster_filter_course');
    
    // Auto-clear module and quiz if course changes
    setSelectedModule('');
    localStorage.removeItem('truster_filter_module');
    setSelectedQuiz('');
    localStorage.removeItem('truster_filter_quiz');
  };

  const handleModuleChange = (e) => {
    const val = e.target.value;
    setSelectedModule(val);
    if (val) localStorage.setItem('truster_filter_module', val);
    else localStorage.removeItem('truster_filter_module');

    // Auto-clear quiz if module changes
    setSelectedQuiz('');
    localStorage.removeItem('truster_filter_quiz');
  };

  const handleQuizChange = (e) => {
    const val = e.target.value;
    setSelectedQuiz(val);
    if (val) localStorage.setItem('truster_filter_quiz', val);
    else localStorage.removeItem('truster_filter_quiz');
  };

  const baseConfig = adminConfig[entityId];
  const isInstructor = location.pathname.startsWith('/instructor');
  const basePath = isInstructor ? '/instructor/entity' : '/superadmin/entity';

  const getConfig = () => {
    if (!baseConfig) return null;
    const config = { ...baseConfig };
    
    if (user?.instructor_profile && !isAdmin) {
      const profile = user.instructor_profile;
      if (entityId === 'courses') {
        config.canCreate = profile.can_create_courses ?? config.canCreate;
        config.canUpdate = profile.can_update_courses ?? config.canUpdate;
        config.canDelete = profile.can_delete_courses ?? config.canDelete;
      } else if (['modules', 'lessons', 'quizzes', 'quiz_questions'].includes(entityId)) {
        config.canCreate = profile.can_update_courses ?? config.canCreate;
        config.canUpdate = profile.can_update_courses ?? config.canUpdate;
        config.canDelete = profile.can_delete_courses ?? config.canDelete;
      } else if (['trainings', 'classwork', 'exams'].includes(entityId)) {
        config.canCreate = profile.can_create_trainings ?? config.canCreate;
        config.canUpdate = profile.can_update_trainings ?? config.canUpdate;
        config.canDelete = profile.can_delete_trainings ?? config.canDelete;
      } else if (entityId === 'certificates') {
        config.canCreate = profile.can_create_certificates ?? config.canCreate;
        config.canUpdate = profile.can_update_certificates ?? config.canUpdate;
        config.canDelete = profile.can_delete_certificates ?? config.canDelete;
      }
    }
    return config;
  };

  const config = getConfig();

  useEffect(() => {
    if (config) {
      fetchData();
    }
  }, [entityId, isInstructor, viewMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParam = isInstructor && viewMode === 'my' ? `my_${entityId}=true` : '';
      const separator = config.endpoint.includes('?') ? '&' : (queryParam ? '?' : '');
      const paramString = isInstructor && viewMode === 'my' ? `my_${entityId}=true` : '';
      const fullEndpoint = paramString ? `${config.endpoint}${separator}${paramString}` : config.endpoint;
      
      const res = await apiClient.get(fullEndpoint);
      let dataToSet = [];
      if (Array.isArray(res)) {
        dataToSet = res;
      } else if (res && Array.isArray(res.results)) {
        dataToSet = res.results;
      } else if (res && typeof res === 'object') {
        dataToSet = [res];
      }
      setData(dataToSet);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for filters
  useEffect(() => {
    const fetchFilters = async () => {
      const needsFilters = ['modules', 'lessons', 'quizzes', 'quiz_questions'].includes(entityId);
      if (!needsFilters) return;
      try {
        const qp = isInstructor ? '?my_courses=true' : '';
        const qm = isInstructor ? '?my_modules=true' : '';
        // Quizzes endpoint doesn't strictly need my_quizzes if backend doesn't support it, but passing it is safe
        const qq = isInstructor ? '?my_quizzes=true' : ''; 
        const [cRes, mRes, qRes] = await Promise.all([
           apiClient.get(`/api/courses/${qp}`).catch(() => []),
           apiClient.get(`/api/modules/${qm}`).catch(() => []),
           apiClient.get(`/api/quizes/${qq}`).catch(() => [])
        ]);
        setFilterData({
           courses: Array.isArray(cRes) ? cRes : cRes?.results || [],
           modules: Array.isArray(mRes) ? mRes : mRes?.results || [],
           quizzes: Array.isArray(qRes) ? qRes : qRes?.results || [],
        });
      } catch (err) {
        console.error("Failed to load filter data", err);
      }
    };
    fetchFilters();
  }, [entityId, isInstructor]);

  const filteredData = React.useMemo(() => {
    let filtered = data;
    const needsFilters = ['modules', 'lessons', 'quizzes', 'quiz_questions'].includes(entityId);
    if (!needsFilters) return filtered;

    // Build helper maps to easily trace up to course
    const courseOfModule = {};
    filterData.modules.forEach(m => {
        if (m.course) courseOfModule[m.id] = String(typeof m.course === 'object' ? m.course.id : m.course);
    });
    
    const courseOfQuiz = {};
    const moduleOfQuiz = {};
    filterData.quizzes.forEach(q => {
        let cId = String(q.course || '');
        let mId = String(q.module || '');
        if (!cId && mId && courseOfModule[mId]) {
            cId = courseOfModule[mId];
        }
        courseOfQuiz[q.id] = cId;
        moduleOfQuiz[q.id] = mId;
    });

    if (selectedCourse) {
        filtered = filtered.filter(item => {
           if (entityId === 'modules') return String(typeof item.course === 'object' ? item.course.id : item.course) === String(selectedCourse);
           if (entityId === 'lessons') return courseOfModule[item.module] === String(selectedCourse);
           if (entityId === 'quizzes') {
               let cId = String(item.course || '');
               let mId = String(item.module || '');
               if (!cId && mId) cId = courseOfModule[mId];
               return cId === String(selectedCourse);
           }
           if (entityId === 'quiz_questions') {
               return courseOfQuiz[item.quiz] === String(selectedCourse);
           }
           return true;
        });
    }

    if (selectedModule) {
        filtered = filtered.filter(item => {
           if (entityId === 'modules') return String(item.id) === String(selectedModule);
           if (entityId === 'lessons') return String(item.module) === String(selectedModule);
           if (entityId === 'quizzes') return String(item.module) === String(selectedModule);
           if (entityId === 'quiz_questions') return moduleOfQuiz[item.quiz] === String(selectedModule);
           return true;
        });
    }

    if (selectedQuiz) {
        filtered = filtered.filter(item => {
           if (entityId === 'quiz_questions') return String(item.quiz) === String(selectedQuiz);
           return true;
        });
    }

    return filtered;
  }, [data, selectedCourse, selectedModule, selectedQuiz, filterData, entityId]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await apiClient.delete(`${config.endpoint}${id}/`);
        fetchData();
      } catch (err) {
        console.error('Failed to delete', err);
        alert('Failed to delete item.');
      }
    }
  };

  const handleToggleBoolean = async (id, field, currentVal) => {
    try {
      await apiClient.patch(`${config.endpoint}${id}/`, { [field]: !currentVal });
      fetchData(); // Refresh list
    } catch (err) {
      console.error(`Failed to toggle ${field}`, err);
      alert('Failed to update status.');
    }
  };

    const handleCustomAction = async (item, actionConfig) => {
    if (actionConfig.actionType === 'link') {
      window.open(actionConfig.getLink(item), '_blank');
      return;
    }
    if (actionConfig.actionType === 'api') {
      try {
        const endpoint = actionConfig.apiEndpoint(item.id);
        if (actionConfig.method === 'POST') {
          await apiClient.post(endpoint);
        } else {
          await apiClient.get(endpoint);
        }
        fetchData(); // refresh list
      } catch (err) {
        console.error('Custom action failed', err);
        alert('Action failed.');
      }
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await apiClient.post(`${config.endpoint}bulk_upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(res.detail || 'Bulk upload successful!');
      fetchData(); // Refresh list after upload
    } catch (err) {
      console.error('Bulk upload failed', err);
      alert(err.detail || 'Bulk upload failed. Please check the file format.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!config) {
    return <div>Entity not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(isInstructor ? '/instructor' : '/superadmin')}
              className="p-1.5 text-slate-400 hover:text-[#3182ce] hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight tracking-tight">
              Manage {config.plural}
            </h1>
          </div>
          {isInstructor && (
            <div className="flex bg-white rounded-lg border border-slate-200 p-1 w-fit shadow-sm">
              <button
                onClick={() => setViewMode('my')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'my' ? 'bg-[#3182ce] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My {config.plural}
              </button>
              <button
                onClick={() => setViewMode('global')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'global' ? 'bg-[#3182ce] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Global Catalog
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {(config.canCreate && (viewMode === 'my' || !isInstructor)) && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleBulkUpload} 
                accept=".csv" 
                className="hidden" 
              />
              {config.canBulkUpload && (
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white"
                >
                  {uploading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Upload size={18} className="mr-2" />}
                  Bulk Upload
                </Button>
              )}
              <Button onClick={() => navigate(`${basePath}/${entityId}/new`)}>
                <Plus size={16} className="mr-2" />
                Add New
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filtering Row */}
      {['modules', 'lessons', 'quizzes', 'quiz_questions'].includes(entityId) && (
        <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center text-slate-500 mr-2">
            <Filter size={18} className="mr-2" />
            <span className="font-semibold text-sm">Filters:</span>
          </div>
          <div className="flex-1 max-w-xs">
            <select 
              value={selectedCourse}
              onChange={handleCourseChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:bg-white transition-colors"
            >
              <option value="">All Courses</option>
              {filterData.courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          {['lessons', 'quizzes', 'quiz_questions'].includes(entityId) && (
            <div className="flex-1 max-w-xs">
              <select 
                value={selectedModule}
                onChange={handleModuleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:bg-white transition-colors"
              >
                <option value="">All Modules</option>
                {filterData.modules
                   .filter(m => !selectedCourse || String(typeof m.course === 'object' ? m.course.id : m.course) === String(selectedCourse))
                   .map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          )}
          {['quiz_questions'].includes(entityId) && (
            <div className="flex-1 max-w-xs">
              <select 
                value={selectedQuiz}
                onChange={handleQuizChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:bg-white transition-colors"
              >
                <option value="">All Quizzes</option>
                {filterData.quizzes
                   .filter(q => {
                       let cId = String(q.course || '');
                       let mId = String(q.module || '');
                       if (!cId && mId) {
                           const parentMod = filterData.modules.find(m => String(m.id) === mId);
                           if (parentMod) cId = String(typeof parentMod.course === 'object' ? parentMod.course.id : parentMod.course);
                       }
                       if (selectedCourse && cId !== String(selectedCourse)) return false;
                       if (selectedModule && mId !== String(selectedModule)) return false;
                       return true;
                   })
                   .map(q => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {config.columns.map((col) => (
                    <th key={col.field} className="py-4 px-6 font-bold text-slate-700 text-sm uppercase tracking-wider">
                      {col.label}
                    </th>
                  ))}
                  <th className="py-4 px-6 font-bold text-slate-700 text-sm uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="py-8 text-center text-slate-500">
                      No {config.label.toLowerCase()} found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {config.columns.map((col) => {
                        const val = item[col.field];
                        if (col.field.startsWith('is_')) {
                          const isTrue = !!val;
                          const bgActive = col.field === 'is_locked' ? 'bg-red-500' : 'bg-green-500';
                          const bgInactive = col.field === 'is_locked' ? 'bg-green-500' : 'bg-slate-300';
                          let textTrue = 'Yes';
                          let textFalse = 'No';
                          
                          if (col.field === 'is_locked') { textTrue = 'Locked'; textFalse = 'Unlocked'; }
                          if (col.field === 'is_published') { textTrue = 'Published'; textFalse = 'Draft'; }
                          if (col.field === 'is_free') { textTrue = 'Free'; textFalse = 'Paid'; }
                          
                          return (
                            <td key={col.field} className="py-4 px-6 text-sm">
                              <button
                                onClick={() => handleToggleBoolean(item.id, col.field, isTrue)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isTrue ? bgActive : bgInactive}`}
                                title={isTrue ? "Disable" : "Enable"}
                              >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isTrue ? 'translate-x-4' : 'translate-x-1'}`} />
                              </button>
                              <span className="ml-2 text-xs font-medium text-slate-500">{isTrue ? textTrue : textFalse}</span>
                            </td>
                          );
                        }

                        let displayVal = val;
                        if (typeof val === 'boolean') {
                          displayVal = val ? 'Yes' : 'No';
                        } else if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
                          displayVal = new Date(val).toLocaleString();
                        } else if (val && typeof val === 'object') {
                          displayVal = JSON.stringify(val);
                        } else {
                          displayVal = String(val || '-').substring(0, 150);
                        }
                        return (
                          <td key={col.field} className="py-4 px-6 text-sm text-slate-700">
                            {displayVal}
                          </td>
                        );
                      })}
                      <td className="py-4 px-6 text-right space-x-3">
                        {config.customActions && config.customActions.map((actionCfg, idx) => {
                          if (actionCfg.showIf && !actionCfg.showIf(item)) return null;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleCustomAction(item, actionCfg)}
                              className="text-sm font-medium text-[#3E8E41] hover:text-green-800 transition-colors"
                            >
                              {actionCfg.label}
                            </button>
                          );
                        })}
                        <div className="flex gap-2 justify-end">
                          {entityId === 'courses' && (
                            <button
                              onClick={() => {
                                setBulkCourseId(item.id);
                                setShowBulkEnroll(true);
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded transition-colors"
                              title="Bulk Enroll Learners"
                            >
                              <Users size={16} />
                            </button>
                          )}
                          {entityId === 'trainings' && (
                            <button
                              onClick={() => {
                                setBulkCourseId(item.id);
                                setShowBulkEnroll(true);
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded transition-colors"
                              title="Bulk Enroll Participants"
                            >
                              <Users size={16} />
                            </button>
                          )}
                          {(config.canUpdate && (viewMode === 'my' || !isInstructor)) && (
                            <button
                              onClick={() => navigate(`${basePath}/${entityId}/${item.id}`)}
                              className="p-1.5 text-slate-400 hover:text-[#3182ce] hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {(config.canDelete && (viewMode === 'my' || !isInstructor)) && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {(isInstructor && viewMode === 'global' && item.instructor !== user?.instructor_profile?.id) && (
                            <button
                              onClick={() => {
                                setReuseEntity({ id: item.id, title: item.title || item.name || `Item ${item.id}` });
                                setReuseModalOpen(true);
                              }}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded transition-colors"
                              title="Request Reuse"
                            >
                              <Copy size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Enrollment Modal */}
      {showBulkEnroll && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Bulk Enroll Students</h3>
            <p className="text-sm text-slate-500 mb-4">Enter a comma-separated list of student email addresses to enroll them in a course.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Course ID</label>
              <input 
                type="text" 
                value={bulkCourseId} 
                onChange={(e) => setBulkCourseId(e.target.value)} 
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter course ID"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Emails (comma separated)</label>
              <textarea 
                value={bulkEmails} 
                onChange={(e) => setBulkEmails(e.target.value)} 
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                placeholder="student1@example.com, student2@example.com"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowBulkEnroll(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!bulkCourseId || !bulkEmails) return alert('Fill in all fields');
                try {
                  const emailsList = bulkEmails.split(',').map(e => e.trim()).filter(e => e);
                  const res = await apiClient.post('/api/enrollments/bulk_enroll/', {
                    course_id: bulkCourseId,
                    emails: emailsList
                  });
                  alert(`Success! ${res.detail}`);
                  setShowBulkEnroll(false);
                  if(entityId === 'enrollments') fetchData();
                } catch(err) {
                  alert(err.response?.data?.detail || 'Bulk enrollment failed');
                }
              }}>Enroll</Button>
            </div>
          </div>
        </div>
      )}

      {/* Reuse Request Modal */}
      <ReuseRequestModal
        isOpen={reuseModalOpen}
        onClose={() => setReuseModalOpen(false)}
        entityType={entityId.slice(0, -1)} // e.g. "courses" -> "course", "modules" -> "module"
        entityId={reuseEntity.id}
        entityTitle={reuseEntity.title}
      />
    </div>
  );
};

export default SuperAdminEntityList;
