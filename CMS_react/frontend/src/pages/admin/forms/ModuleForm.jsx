import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../../api/apiClient';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ArrowLeft } from 'lucide-react';

const ModuleForm = ({ isEditing, moduleId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/entity' : '/admin';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [courses, setCourses] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '', // ID of the course
    order: 1,
  });

  useEffect(() => {
    fetchCourses();
    if (isEditing && moduleId) {
      fetchModuleData();
    }
  }, [isEditing, moduleId]);

  const fetchCourses = async () => {
    try {
      const data = await apiClient.get('/api/courses/');
      setCourses(data.results || data || []);
    } catch (err) {
      console.error('Failed to fetch courses for dropdown', err);
    }
  };

  const fetchModuleData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/api/modules/${moduleId}/`);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        course: data.course || '',
        order: data.order || 1,
      });
    } catch (err) {
      setError('Failed to load module data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await apiClient.put(`/api/modules/${moduleId}/`, formData);
      } else {
        await apiClient.post('/api/modules/', formData);
      }
      navigate(`${basePath}/modules`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save module.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-500 hover:text-[#0A66C2] mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Modules
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit Module' : 'Add New Module'}</h2>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden rounded-xl">
        <CardContent className="p-8 border-t-4 border-[#3E8E41]">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Select Course *</label>
              <select 
                name="course" required
                value={formData.course} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none"
              >
                <option value="" disabled>Select a course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Module Title *</label>
              <input 
                type="text" name="title" required
                value={formData.title} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none"
                placeholder="e.g. Introduction to Programming"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
              <textarea 
                name="description" rows="3"
                value={formData.description} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none"
                placeholder="What will this module cover?"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Order</label>
              <input 
                type="number" name="order" min="1" required
                value={formData.order} onChange={handleInputChange}
                className="w-full md:w-1/3 px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 text-base font-bold bg-[#3E8E41] hover:bg-[#317033] shadow-md"
            >
              {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Module')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleForm;
