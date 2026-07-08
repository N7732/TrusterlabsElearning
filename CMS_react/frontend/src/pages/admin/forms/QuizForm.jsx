import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../../api/apiClient';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ArrowLeft } from 'lucide-react';

const QuizForm = ({ isEditing, quizId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/entity' : '/admin';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    module: '', // ID of the module
    max_attempts: 1,
    time_limit: 0,
    is_published: false,
    is_locked: false,
  });

  useEffect(() => {
    fetchModules();
    fetchCourses();
    if (isEditing && quizId) {
      fetchQuizData();
    }
  }, [isEditing, quizId]);

  useEffect(() => {
    if (formData.module && modules.length > 0 && !selectedCourse) {
      const selectedMod = modules.find(m => String(m.id) === String(formData.module));
      if (selectedMod && selectedMod.course) {
        setSelectedCourse(String(selectedMod.course));
      }
    }
  }, [formData.module, modules, selectedCourse]);

  const fetchCourses = async () => {
    try {
      const data = await apiClient.get('/api/courses/');
      setCourses(data.results || data || []);
    } catch (err) {
      console.error('Failed to fetch courses for dropdown', err);
    }
  };

  const fetchModules = async () => {
    try {
      const data = await apiClient.get('/api/modules/');
      setModules(data.results || data || []);
    } catch (err) {
      console.error('Failed to fetch modules for dropdown', err);
    }
  };

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/api/quizes/${quizId}/`);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        module: data.module || '',
        max_attempts: data.max_attempts || 1,
        time_limit: data.time_limit || 0,
        is_published: !!data.is_published,
        is_locked: !!data.is_locked,
      });
    } catch (err) {
      setError('Failed to load quiz data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await apiClient.put(`/api/quizes/${quizId}/`, formData);
      } else {
        await apiClient.post('/api/quizes/', formData);
      }
      navigate(`${basePath}/quizzes`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save quiz.');
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
        Back to Quizzes
      </button>

      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit Quiz' : 'Add New Quiz'}</h2>
        {isEditing && (
          <Button 
            type="button"
            onClick={() => navigate(`${basePath}/quiz_questions`)}
            className="bg-slate-800 hover:bg-slate-900 text-white shadow-sm"
          >
            Manage Questions
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-lg overflow-hidden rounded-xl">
        <CardContent className="p-8 border-t-4 border-[#FFD700]">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Course</label>
                <select 
                  value={selectedCourse} 
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setFormData(prev => ({ ...prev, module: '' }));
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                >
                  <option value="">All Courses...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Module *</label>
                <select 
                  name="module" required
                  value={formData.module} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                >
                  <option value="" disabled>Select a module...</option>
                  {modules
                    .filter(m => !selectedCourse || String(m.course) === String(selectedCourse))
                    .map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Quiz Title *</label>
              <input 
                type="text" name="title" required
                value={formData.title} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                placeholder="e.g. React Basics Assessment"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
              <textarea 
                name="description" rows="3"
                value={formData.description} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                placeholder="Instructions for the quiz..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Max Attempts</label>
                <input 
                  type="number" name="max_attempts" min="1" required
                  value={formData.max_attempts} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Time Limit (minutes)</label>
                <input 
                  type="number" name="time_limit" min="0" required
                  value={formData.time_limit} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                  placeholder="0 for unlimited"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" name="is_published"
                  checked={formData.is_published} onChange={handleInputChange}
                  className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                />
                <div>
                  <span className="block font-bold text-slate-700">Published</span>
                  <span className="text-xs text-slate-500">Make this quiz visible to learners.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" name="is_locked"
                  checked={formData.is_locked} onChange={handleInputChange}
                  className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                />
                <div>
                  <span className="block font-bold text-slate-700">Locked</span>
                  <span className="text-xs text-slate-500">Prevent learners from taking this quiz.</span>
                </div>
              </label>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 text-base font-bold bg-[#FFD700] hover:bg-[#F0C800] text-black shadow-md"
            >
              {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Quiz')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizForm;
