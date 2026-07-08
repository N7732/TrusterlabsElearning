import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/apiClient';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const PartnerForm = ({ isEditing, partnerId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    website_url: '',
    is_active: true
  });
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing && partnerId) {
      fetchPartnerData();
    }
  }, [isEditing, partnerId]);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/settings/partners/${partnerId}/`);
      setFormData({
        name: res.name || '',
        website_url: res.website_url || '',
        is_active: res.is_active !== undefined ? res.is_active : true
      });
      setCurrentLogo(res.logo);
    } catch (err) {
      console.error(err);
      setError('Failed to load partner data.');
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const submitData = new FormData();
    submitData.append('name', formData.name);
    if (formData.website_url) submitData.append('website_url', formData.website_url);
    submitData.append('is_active', formData.is_active);
    if (logoFile) {
      submitData.append('logo', logoFile);
    }

    try {
      if (isEditing) {
        await apiClient.put(`/settings/partners/${partnerId}/`, submitData);
      } else {
        await apiClient.post('/settings/partners/', submitData);
      }
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save partner.');
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {isEditing ? 'Edit Partner' : 'Add New Partner'}
        </h2>
        <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
      </div>

      <Card>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Partner Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Website URL</label>
                <input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Partner Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
                {currentLogo && !logoFile && (
                  <div className="mt-2 text-sm text-slate-500">
                    Current Logo: <a href={currentLogo} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-300 text-[#0A66C2] focus:ring-[#0A66C2]"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                  Is Active
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-8">
              <Button type="submit" disabled={saving} className="bg-[#0A66C2] hover:bg-blue-700 text-white min-w-[120px]">
                {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Partner')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerForm;
