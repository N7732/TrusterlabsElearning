import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { adminConfig } from '../../config/adminConfig';
import { apiClient } from '../../api/apiClient';
import Button from '../../components/common/Button';
import Card, { CardContent } from '../../components/common/Card';
import { Plus, Edit, Trash2, Upload, Loader2, Users } from 'lucide-react';

const SuperAdminEntityList = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Bulk Enrollment specific state
  const [showBulkEnroll, setShowBulkEnroll] = useState(false);
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkCourseId, setBulkCourseId] = useState('');

  const config = adminConfig[entityId];
  const isInstructor = location.pathname.startsWith('/instructor');
  const basePath = isInstructor ? '/instructor/entity' : '/superadmin/entity';

  useEffect(() => {
    if (config) {
      fetchData();
    }
  }, [entityId, isInstructor]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParam = isInstructor ? `?my_${entityId}=true` : '';
      const separator = config.endpoint.includes('?') ? '&' : (queryParam ? '?' : '');
      const paramString = isInstructor ? `my_${entityId}=true` : '';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{config.label} Management</h1>
          <p className="text-slate-500 mt-2">Manage your {config.label.toLowerCase()} across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          {config.canBulkUpload && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleBulkUpload} 
                accept=".csv" 
                className="hidden" 
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white"
              >
                {uploading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Upload size={18} className="mr-2" />}
                Bulk Upload
              </Button>
            </>
          )}
          {config.canCreate && (
            <Button onClick={() => navigate(`${basePath}/${entityId}/new`)}>
              <Plus size={16} className="mr-2" />
              Add New
            </Button>
          )}
          {(entityId === 'courses' || entityId === 'trainings') && isInstructor && (
             <Button onClick={() => setShowBulkEnroll(!showBulkEnroll)} variant="secondary">
               <Users size={16} className="mr-2" />
               Bulk Enroll
             </Button>
          )}
        </div>
      </div>

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
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="py-8 text-center text-slate-500">
                      No {config.label.toLowerCase()} found.
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
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
                      {config.canUpdate && (
                        <button
                          onClick={() => navigate(`${basePath}/${entityId}/${item.id}`)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                        {config.canDelete && (
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
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
                  const res = await apiClient.post('/api/courses/enrollments/bulk_enroll/', {
                    course_id: bulkCourseId,
                    emails: emailsList
                  });
                  alert(`Success! ${res.detail}`);
                  setShowBulkEnroll(false);
                  if(entityId === 'enrollments') fetchData();
                } catch(err) {
                  alert(err.response?.data?.detail || 'Bulk enrollment failed');
                }
              }}>Enroll Students</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminEntityList;
