import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../../api/apiClient';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ArrowLeft } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

const CourseForm = ({ isEditing, courseId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/entity' : '/admin';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    currency: 'USD',
    access_type: 'paid', // 'free', 'paid', 'inquiry'
    price: '',
    difficulty: 'Beginner',
    course_status: 'draft',
    is_locked: false,
    lesson_count: 1, // Only for creation
  });
  
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    if (thumbnail) {
      const objectUrl = URL.createObjectURL(thumbnail);
      setThumbnailPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [thumbnail]);
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    if (isEditing && courseId) {
      fetchCourseData();
    } else {
      generateModules(1);
    }
  }, [isEditing, courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/api/courses/${courseId}/`);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        currency: data.currency || 'USD',
        access_type: data.is_free ? 'free' : (parseFloat(data.price) > 0 ? 'paid' : 'inquiry'),
        price: data.price || '',
        difficulty: data.difficulty || 'Beginner',
        course_status: data.course_status || 'draft',
        is_locked: data.is_locked || false,
        existingThumbnail: data.thumbnail || null
      });
      // We don't fetch or set thumbnail directly as a file object.
    } catch (err) {
      setError('Failed to load course data.');
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

    if (name === 'lesson_count' && !isEditing) {
      generateModules(parseInt(value) || 1);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleResourceChange = (e) => {
    if (e.target.files.length > 0) {
      setResources(Array.from(e.target.files));
    }
  };

  const generateModules = (count) => {
    const newModules = [];
    for (let i = 1; i <= count; i++) {
      newModules.push({ id: i, title: '', description: '' });
    }
    setModules(newModules);
  };

  const handleModuleChange = (id, field, value) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('currency', formData.currency);
      
      if (formData.access_type === 'free') {
        data.append('is_free', 'true');
        data.append('price', '0');
      } else if (formData.access_type === 'paid') {
        data.append('is_free', 'false');
        if (formData.price) data.append('price', formData.price);
      } else if (formData.access_type === 'inquiry') {
        data.append('is_free', 'false');
        data.append('price', '');
      }
      data.append('difficulty', formData.difficulty);
      data.append('course_status', formData.course_status);
      data.append('is_locked', formData.is_locked);
      if (thumbnail) {
        data.append('thumbnail', thumbnail);
      }

      let activeCourseId = isEditing ? courseId : null;

      if (isEditing) {
        await apiClient.put(`/api/courses/${courseId}/`, data);
      } else {
        // Create course
        const newCourse = await apiClient.post('/api/courses/', data);
        activeCourseId = newCourse.id || newCourse.data?.id || newCourse.result?.id;
        
        // Create generated modules (assuming modules are linked to course via course id)
        try {
          for (const mod of modules) {
            if (mod.title.trim() !== '') {
              await apiClient.post('/api/modules/', {
                title: mod.title,
                description: mod.description,
                course: activeCourseId,
                order: mod.id
              });
            }
          }
        } catch (modErr) {
          console.error("Module creation failed:", modErr);
        }
      }

      // Upload resources
      if (activeCourseId) {
        try {
          for (const file of resources) {
            const resData = new FormData();
            resData.append('course', activeCourseId);
            resData.append('title', file.name);
            resData.append('file', file);
            await apiClient.post('/api/course-resources/', resData);
          }
        } catch (resErr) {
          console.error("Resource upload failed:", resErr);
        }
      }

      navigate(`${basePath}/courses`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save course.');
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
        Back to Courses
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit Course' : 'Create New Course'}</h2>
        <p className="text-slate-500 mt-2">Design a comprehensive learning experience for your students.</p>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden rounded-xl">
        <CardContent className="p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 text-slate-800">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Course Title *</label>
                  <input 
                    type="text" name="title" required
                    value={formData.title} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] focus:border-transparent outline-none"
                    placeholder="e.g. Advanced Python Programming"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Description *</label>
                  <Editor
                    apiKey="30842fl2uv0e6tmoh0diverm0dqrmkduldtheg6trhcaf62g"
                    init={{
                      plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                      toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                    }}
                    value={formData.description}
                    onEditorChange={(content) => {
                      setFormData(prev => ({ ...prev, description: content }));
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Cover Image (Thumbnail)</label>
                    <div className="flex items-center gap-4">
                      {(thumbnailPreview || formData.existingThumbnail) && (
                        <div className="w-24 h-16 shrink-0 rounded-md overflow-hidden border border-slate-200">
                          <img 
                            src={thumbnailPreview || getImageUrl(formData.existingThumbnail)} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <input 
                          type="file" accept="image/*" onChange={handleFileChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-slate-500 mt-1">Recommended size: 1920x1080px (16:9 ratio)</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Currency</label>
                    <select 
                      name="currency" value={formData.currency} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Difficulty</label>
                    <select 
                      name="difficulty" value={formData.difficulty} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                    <select 
                      name="course_status" value={formData.course_status} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="unpublished">Unpublished</option>
                    </select>
                  </div>
                  <div className="pt-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" name="is_locked" 
                        checked={formData.is_locked} onChange={handleInputChange}
                        className="w-5 h-5 text-[#3E8E41] border-slate-300 rounded focus:ring-[#3E8E41]"
                      />
                      <span className="font-bold text-slate-700">Lock Course Content</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 text-slate-800">Pricing & Structure</h3>
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Course Access Type</label>
                <div className="flex gap-4 flex-col sm:flex-row mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer p-3 border border-slate-200 rounded-md bg-white hover:bg-slate-50 flex-1">
                    <input 
                      type="radio" name="access_type" value="free"
                      checked={formData.access_type === 'free'} onChange={handleInputChange}
                      className="w-4 h-4 text-[#3E8E41] border-slate-300 focus:ring-[#3E8E41]"
                    />
                    <span className="font-medium text-slate-700">Free Access</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer p-3 border border-slate-200 rounded-md bg-white hover:bg-slate-50 flex-1">
                    <input 
                      type="radio" name="access_type" value="paid"
                      checked={formData.access_type === 'paid'} onChange={handleInputChange}
                      className="w-4 h-4 text-[#3E8E41] border-slate-300 focus:ring-[#3E8E41]"
                    />
                    <span className="font-medium text-slate-700">Paid Access</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer p-3 border border-slate-200 rounded-md bg-white hover:bg-slate-50 flex-1">
                    <input 
                      type="radio" name="access_type" value="inquiry"
                      checked={formData.access_type === 'inquiry'} onChange={handleInputChange}
                      className="w-4 h-4 text-[#3E8E41] border-slate-300 focus:ring-[#3E8E41]"
                    />
                    <span className="font-medium text-slate-700">Requires Inquiry</span>
                  </label>
                </div>

                {formData.access_type === 'paid' && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Price</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 font-medium">$</span>
                      </div>
                      <input 
                        type="number" step="0.01" name="price" 
                        value={formData.price} onChange={handleInputChange}
                        className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none"
                        placeholder="49.99"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Initial Modules</label>
                  <input 
                    type="number" min="1" max="15" name="lesson_count" 
                    value={formData.lesson_count} onChange={handleInputChange}
                    className="w-full md:w-1/3 px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">You can add lessons to these modules later.</p>

                  <div className="mt-6 space-y-4">
                    {modules.map((mod) => (
                      <div key={mod.id} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm relative">
                        <div className="absolute -left-3 -top-3 w-8 h-8 bg-[#3E8E41] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                          {mod.id}
                        </div>
                        <div className="pl-4">
                          <input 
                            type="text" placeholder="Module Title (e.g. Introduction)" required
                            value={mod.title} onChange={(e) => handleModuleChange(mod.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none mb-3 font-medium text-slate-800"
                          />
                          <textarea 
                            placeholder="Brief description of what this module covers" rows="2"
                            value={mod.description} onChange={(e) => handleModuleChange(mod.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none text-sm text-slate-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Course Resources */}
              <div className="mt-8">
                <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 text-slate-800">Course Resources</h3>
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-6">
                  <p className="text-sm text-slate-600 mb-3">Upload PDFs, documents, or other files for students to access.</p>
                  <input 
                    type="file" multiple 
                    onChange={handleResourceChange}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#EBF7EB] file:text-[#3E8E41] hover:file:bg-[#d8f0d8]"
                  />
                  {resources.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-700 mb-2">Files to upload:</p>
                      <ul className="list-disc pl-5 text-sm text-slate-600">
                        {resources.map((res, i) => (
                          <li key={i}>{res.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 text-lg font-bold bg-[#3E8E41] hover:bg-[#317033] rounded-xl shadow-md"
            >
              {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Course')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseForm;
