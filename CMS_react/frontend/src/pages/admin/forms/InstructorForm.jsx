import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/apiClient';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { Shield, BookOpen, GraduationCap, Users, Award } from 'lucide-react';

const InstructorForm = ({ isEditing, instructorId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    specialization: '',
    bio: '',
    
    // Course Privileges
    can_create_courses: true,
    can_update_courses: true,
    can_delete_courses: true,
    
    // Training Privileges
    can_create_trainings: true,
    can_update_trainings: true,
    can_delete_trainings: true,
    
    // Certificate Privileges
    can_create_certificates: true,
    can_update_certificates: true,
    can_delete_certificates: true,
    
    can_view_students: true
  });

  useEffect(() => {
    if (isEditing && instructorId) {
      fetchInstructorData();
    }
  }, [isEditing, instructorId]);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/auth/api/instructors/${instructorId}/`);
      setFormData({
        first_name: res.first_name || '',
        last_name: res.last_name || '',
        email: res.email || '',
        specialization: res.specialization || '',
        bio: res.bio || '',
        can_create_courses: res.can_create_courses ?? true,
        can_update_courses: res.can_update_courses ?? true,
        can_delete_courses: res.can_delete_courses ?? true,
        can_create_trainings: res.can_create_trainings ?? true,
        can_update_trainings: res.can_update_trainings ?? true,
        can_delete_trainings: res.can_delete_trainings ?? true,
        can_view_students: res.can_view_students ?? true,
        can_create_certificates: res.can_create_certificates ?? true,
        can_update_certificates: res.can_update_certificates ?? true,
        can_delete_certificates: res.can_delete_certificates ?? true,
        password: '', // Don't fetch password
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load instructor data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = { ...formData };
      
      if (isEditing) {
        if (!payload.password) {
          delete payload.password; // Don't update password if empty
        }
        await apiClient.put(`/auth/api/instructors/${instructorId}/`, payload);
      } else {
        if (!payload.password) {
          throw new Error("Password is required for new instructors.");
        }
        await apiClient.post('/auth/api/instructors/', payload);
      }
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Failed to save instructor.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E8E41]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isEditing ? 'Edit Instructor' : 'Add New Instructor'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Configure instructor details and set their system privileges.</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="text-slate-600 border-slate-300 hover:bg-slate-100">
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Basic Details */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                <input
                  type="text" name="first_name" required
                  value={formData.first_name} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                <input
                  type="text" name="last_name" required
                  value={formData.last_name} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input
                  type="email" name="email" required
                  value={formData.email} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password {isEditing && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password" name="password" required={!isEditing}
                  value={formData.password} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Specialization</label>
                <input
                  type="text" name="specialization" placeholder="e.g. Data Science, Web Development"
                  value={formData.specialization} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                <textarea
                  name="bio" rows="3"
                  value={formData.bio} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                ></textarea>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privileges Configuration */}
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
            <Shield className="text-amber-500 w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-800">Privileges Configuration</h3>
          </div>
          
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              
              {/* Course Privileges */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="text-blue-500 w-5 h-5" />
                  <h4 className="text-md font-bold text-slate-800">Course Privileges</h4>
                </div>
                <div className="space-y-3 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-md transition-colors">
                    <input 
                      type="checkbox" name="can_create_courses" 
                      checked={formData.can_create_courses} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-[#0A66C2] border-slate-300 rounded focus:ring-[#0A66C2]" 
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Can Create Courses</div>
                      <div className="text-xs text-slate-500">Allow instructor to author new courses on the platform.</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-md transition-colors border-t border-slate-100 pt-3">
                    <input 
                      type="checkbox" name="can_update_courses" 
                      checked={formData.can_update_courses} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-[#0A66C2] border-slate-300 rounded focus:ring-[#0A66C2]" 
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Can Update Courses</div>
                      <div className="text-xs text-slate-500">Allow instructor to edit and modify their existing courses.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-md transition-colors border-t border-slate-100 pt-3">
                    <input 
                      type="checkbox" name="can_delete_courses" 
                      checked={formData.can_delete_courses} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-[#0A66C2] border-slate-300 rounded focus:ring-[#0A66C2]" 
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Can Delete Courses</div>
                      <div className="text-xs text-slate-500">Allow instructor to permanently delete their courses.</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Training Privileges */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="text-purple-500 w-5 h-5" />
                  <h4 className="text-md font-bold text-slate-800">Training Privileges</h4>
                </div>
                <div className="space-y-3 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-md transition-colors">
                    <input 
                      type="checkbox" name="can_create_trainings" 
                      checked={formData.can_create_trainings} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-[#0A66C2] border-slate-300 rounded focus:ring-[#0A66C2]" 
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Can Create Trainings</div>
                      <div className="text-xs text-slate-500">Allow instructor to author new live training sessions.</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-md transition-colors border-t border-slate-100 pt-3">
                    <input 
                      type="checkbox" name="can_update_trainings" 
                      checked={formData.can_update_trainings} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-[#0A66C2] border-slate-300 rounded focus:ring-[#0A66C2]" 
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Can Update Trainings</div>
                      <div className="text-xs text-slate-500">Allow instructor to edit and modify their existing training sessions.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-md transition-colors border-t border-slate-100 pt-3">
                    <input 
                      type="checkbox" name="can_delete_trainings" 
                      checked={formData.can_delete_trainings} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-[#0A66C2] border-slate-300 rounded focus:ring-[#0A66C2]" 
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Can Delete Trainings</div>
                      <div className="text-xs text-slate-500">Allow instructor to permanently delete their training sessions.</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Student View Privileges */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="text-emerald-500 w-5 h-5" />
                  <h4 className="text-md font-bold text-slate-800">Student Privileges</h4>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-md transition-colors">
                    <input 
                      type="checkbox" name="can_view_students" 
                      checked={formData.can_view_students} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-[#0A66C2] border-slate-300 rounded focus:ring-[#0A66C2]" 
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">View Student Data</div>
                      <div className="text-xs text-slate-500">Allow instructor to view profiles, progress, and performance data of enrolled learners.</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Certificate Privileges */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="text-amber-500 w-5 h-5" />
                  <h4 className="text-md font-bold text-slate-800">Certificate Privileges</h4>
                </div>
                <div className="space-y-3 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-md transition-colors">
                    <input 
                      type="checkbox" name="can_create_certificates" 
                      checked={formData.can_create_certificates} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-[#0A66C2] border-slate-300 rounded focus:ring-[#0A66C2]" 
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Can Issue Certificates</div>
                      <div className="text-xs text-slate-500">Allow instructor to manually issue and approve new certificates.</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-md transition-colors border-t border-slate-100 pt-3">
                    <input 
                      type="checkbox" name="can_update_certificates" 
                      checked={formData.can_update_certificates} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-[#0A66C2] border-slate-300 rounded focus:ring-[#0A66C2]" 
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Can Update Certificates</div>
                      <div className="text-xs text-slate-500">Allow instructor to modify data on issued certificates.</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-md transition-colors border-t border-slate-100 pt-3">
                    <input 
                      type="checkbox" name="can_delete_certificates" 
                      checked={formData.can_delete_certificates} onChange={handleChange}
                      className="mt-1 w-4 h-4 text-[#0A66C2] border-slate-300 rounded focus:ring-[#0A66C2]" 
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Can Delete Certificates</div>
                      <div className="text-xs text-slate-500">Allow instructor to revoke or permanently delete certificates.</div>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-[#0A66C2] hover:bg-blue-700 text-white min-w-[150px] py-3 font-bold shadow-md rounded-lg"
          >
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Instructor')}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default InstructorForm;
