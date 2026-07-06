import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../../api/apiClient';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ArrowLeft } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

const LessonForm = ({ isEditing, lessonId }) => {
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
    module: '', // ID of the module
    lesson_type: 'text', // 'text', 'video', 'code'
    content: '',
    video_url: '',
    video_file: null,
    code_template: '',
    order: 1,
    is_published: false,
  });

  useEffect(() => {
    fetchModules();
    fetchCourses();
    if (isEditing && lessonId) {
      fetchLessonData();
    }
  }, [isEditing, lessonId]);

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

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/api/lessons/${lessonId}/`);
      setFormData({
        title: data.title || '',
        module: data.module || '',
        lesson_type: data.lesson_type || 'text',
        content: data.content || '',
        video_url: data.video_url || '',
        video_file: null,
        code_template: data.code_template || '',
        order: data.order || 1,
        is_published: data.is_published || false,
      });
    } catch (err) {
      setError('Failed to load lesson data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      if (isEditing) {
        await apiClient.put(`/api/lessons/${lessonId}/`, submitData);
      } else {
        await apiClient.post('/api/lessons/', submitData);
      }
      navigate(`${basePath}/lessons`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save lesson.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-500 hover:text-[#0A66C2] mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Lessons
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit Lesson' : 'Add New Lesson'}</h2>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden rounded-xl">
        <CardContent className="p-8 bg-white border-t-4 border-[#0A66C2]">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Lesson Title *</label>
                <input 
                  type="text" name="title" required
                  value={formData.title} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0A66C2] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Course</label>
                <select 
                  value={selectedCourse} 
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setFormData(prev => ({ ...prev, module: '' }));
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0A66C2] outline-none"
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0A66C2] outline-none"
                >
                  <option value="" disabled>Select a module...</option>
                  {modules
                    .filter(mod => !selectedCourse || String(mod.course) === String(selectedCourse))
                    .map(mod => (
                    <option key={mod.id} value={mod.id}>{mod.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Lesson Type *</label>
              <select 
                name="lesson_type" required
                value={formData.lesson_type} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0A66C2] outline-none"
              >
                <option value="text">Text / Article</option>
                <option value="video">Video</option>
                <option value="code">Coding Exercise</option>
              </select>
            </div>

            {/* Dynamic Fields based on Type */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-6">
              
              {/* Always show content, maybe used as description for video/code */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-1">Content (Text) *</label>
                <Editor
                  apiKey="30842fl2uv0e6tmoh0diverm0dqrmkduldtheg6trhcaf62g"
                  init={{
                    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount paste',
                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                    media_live_embeds: true,
                    smart_paste: true,
                  }}
                  value={formData.content}
                  onEditorChange={(content) => {
                    setFormData(prev => ({ ...prev, content: content }));
                  }}
                />
              </div>

              {formData.lesson_type === 'video' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Upload Video File</label>
                    <input 
                      type="file" name="video_file" accept="video/*"
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0A66C2] outline-none bg-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">Directly upload a video file (.mp4, .webm) from your computer</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-px bg-slate-300 flex-1"></div>
                    <span className="px-3 text-xs text-slate-500 font-bold uppercase">OR</span>
                    <div className="h-px bg-slate-300 flex-1"></div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Video URL</label>
                    <input 
                      type="url" name="video_url" 
                      value={formData.video_url} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0A66C2] outline-none"
                      placeholder="https://youtube.com/..."
                    />
                    <p className="text-xs text-slate-500 mt-1">YouTube, Vimeo, Google Drive, or MP4 URL</p>
                  </div>
                </div>
              )}

              {formData.lesson_type === 'code' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Code Template</label>
                  <textarea 
                    name="code_template" rows="6"
                    value={formData.code_template} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-800 bg-slate-900 text-green-400 rounded-md focus:ring-2 focus:ring-[#0A66C2] outline-none font-mono text-sm"
                    placeholder="def main():\n    pass"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Display Order</label>
                <input 
                  type="number" name="order" required min="1"
                  value={formData.order} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0A66C2] outline-none"
                />
              </div>

              <div className="pt-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" name="is_published" 
                    checked={formData.is_published} onChange={handleInputChange}
                    className="w-5 h-5 text-[#0A66C2] border-slate-300 rounded focus:ring-[#0A66C2]"
                  />
                  <span className="font-bold text-slate-700">Publish immediately</span>
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 text-base font-bold bg-[#0A66C2] hover:bg-blue-700 shadow-md"
            >
              {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Lesson')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonForm;
