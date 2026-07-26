import React, { useState } from 'react';

const CourseForm = ({ token }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    course_status: 'draft',
    is_free: true,
    price: '',
    thumbnail_url: '',
  });
  
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'link'
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Use FormData to allow file uploads
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // If user chose to upload a file, attach it
      if (uploadMethod === 'file' && thumbnailFile) {
        data.append('thumbnail', thumbnailFile);
      } 
      // If user chose link, we already appended `thumbnail_url` from formData

      const response = await fetch('https://api.yourdomain.com/courses/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Do NOT set Content-Type here; browser will automatically set multipart/form-data with boundary
        },
        body: data
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(JSON.stringify(errData));
      }

      setMessage('Course created successfully! The thumbnail is now live.');
      
      // Optionally reset form
      setThumbnailFile(null);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-10 p-8 bg-white shadow-xl rounded-2xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Course</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Course Title</label>
          <input 
            type="text" name="title" required
            value={formData.title} onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
            placeholder="e.g. Master React in 30 Days"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea 
            name="description" required rows="4"
            value={formData.description} onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
            placeholder="Course details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty</label>
            <select 
              name="difficulty" 
              value={formData.difficulty} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
            <select 
              name="course_status" 
              value={formData.course_status} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* THUMBNAIL SECTION */}
        <div className="bg-gray-50 p-6 rounded-xl border">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Course Thumbnail</h3>
          
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="uploadMethod" 
                value="file" 
                checked={uploadMethod === 'file'} 
                onChange={() => setUploadMethod('file')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Upload File (Auto-syncs to Cloudinary)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="uploadMethod" 
                value="link" 
                checked={uploadMethod === 'link'} 
                onChange={() => setUploadMethod('link')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Paste Cloudinary Link</span>
            </label>
          </div>

          {uploadMethod === 'file' ? (
            <div className="mt-2">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">Select an image from your computer. Our backend will automatically host it on your Cloudinary account.</p>
            </div>
          ) : (
            <div className="mt-2">
              <input 
                type="url" 
                name="thumbnail_url"
                value={formData.thumbnail_url} 
                onChange={handleChange}
                placeholder="https://res.cloudinary.com/..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-xs text-gray-500 mt-2">Already uploaded? Paste your direct Cloudinary link here.</p>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? 'Creating Course...' : 'Create Course'}
        </button>

      </form>
    </div>
  );
};

export default CourseForm;
