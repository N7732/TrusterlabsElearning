import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Copy, Check, UserPlus, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/apiClient';

const AdminAddInstructor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    can_create_courses: true,
    can_update_courses: true,
    can_delete_courses: true,
  });

  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const copyToClipboard = () => {
    if (formData.password) {
      navigator.clipboard.writeText(formData.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    if (!formData.password) {
      setError("Please generate or enter a password for the instructor.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await apiClient.post('/api/auth/admin/instructors/create/', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.email, // using email as username
        email: formData.email,
        password: formData.password,
        can_create_courses: formData.can_create_courses,
        can_update_courses: formData.can_update_courses,
        can_delete_courses: formData.can_delete_courses,
      });
      setSuccess(true);
      // Reset form
      setFormData({
        firstName: '', lastName: '', email: '', password: '',
        can_create_courses: true, can_update_courses: true, can_delete_courses: true
      });
    } catch (err) {
      console.error(err);
      setError(err.email?.[0] || err.username?.[0] || err.error || "Failed to create instructor. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-2 flex items-center">
            <UserPlus className="mr-3 text-blue-600" size={32} />
            Add New Instructor
          </h1>
          <p className="text-slate-500">Create a new instructor account and assign privileges.</p>
        </div>
        <button 
          onClick={() => navigate('/admin')}
          className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center shadow-sm border border-red-100">
          <AlertCircle className="mr-2 shrink-0" size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center shadow-sm border border-green-100">
          <Check className="mr-2 shrink-0" size={20} />
          Instructor created successfully! Make sure you saved the password to send to them.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Personal Details */}
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
              <input 
                type="text" required name="firstName"
                value={formData.firstName} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
              <input 
                type="text" required name="lastName"
                value={formData.lastName} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Doe"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" required name="email"
                value={formData.email} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="instructor@example.com"
              />
            </div>
          </div>
        </div>

        {/* Security / Password */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Key className="mr-2 text-slate-500" size={20} /> Security
          </h2>
          <div className="max-w-md">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Instructor Password</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input 
                  type="text" readOnly
                  value={formData.password}
                  placeholder="Generate a password"
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-mono"
                />
              </div>
              <button 
                type="button" onClick={generatePassword}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                Generate
              </button>
              <button 
                type="button" onClick={copyToClipboard}
                className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
                title="Copy Password"
              >
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Generate a secure password and send it to the instructor so they can log in.</p>
          </div>
        </div>

        {/* Privileges */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Shield className="mr-2 text-amber-500" size={20} /> Course Privileges
          </h2>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" name="can_create_courses"
                checked={formData.can_create_courses} onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div>
                <p className="font-semibold text-slate-800">Can Create Courses</p>
                <p className="text-sm text-slate-500">Allow instructor to author new courses on the platform.</p>
              </div>
            </label>
            <label className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" name="can_update_courses"
                checked={formData.can_update_courses} onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div>
                <p className="font-semibold text-slate-800">Can Update Courses</p>
                <p className="text-sm text-slate-500">Allow instructor to edit and modify their existing courses.</p>
              </div>
            </label>
            <label className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" name="can_delete_courses"
                checked={formData.can_delete_courses} onChange={handleInputChange}
                className="w-5 h-5 text-red-500 rounded border-slate-300 focus:ring-red-500"
              />
              <div>
                <p className="font-semibold text-slate-800">Can Delete Courses</p>
                <p className="text-sm text-slate-500">Allow instructor to permanently delete their courses.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-all disabled:opacity-70 flex items-center"
          >
            {loading ? 'Creating...' : 'Create Instructor Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddInstructor;
