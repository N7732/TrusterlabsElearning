import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/apiClient';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const SiteSettingForm = ({ isEditing, settingId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: '',
    contact_phone: '',
    location_address: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: ''
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing && settingId) {
      fetchSettingData();
    }
  }, [isEditing, settingId]);

  const fetchSettingData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/settings/site-settings/${settingId}/`);
      setFormData({
        company_name: res.company_name || '',
        contact_email: res.contact_email || '',
        contact_phone: res.contact_phone || '',
        location_address: res.location_address || '',
        facebook_url: res.facebook_url || '',
        twitter_url: res.twitter_url || '',
        linkedin_url: res.linkedin_url || ''
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load site settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEditing) {
        await apiClient.put(`/settings/site-settings/${settingId}/`, formData);
      } else {
        await apiClient.post('/settings/site-settings/', formData);
      }
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save settings.');
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
          {isEditing ? 'Edit Site Settings' : 'Site Settings'}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contact Phone</label>
                <input
                  type="text"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location Address</label>
                <textarea
                  name="location_address"
                  value={formData.location_address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Facebook URL</label>
                <input
                  type="url"
                  name="facebook_url"
                  value={formData.facebook_url}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Twitter URL</label>
                <input
                  type="url"
                  name="twitter_url"
                  value={formData.twitter_url}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-8">
              <Button type="submit" disabled={saving} className="bg-[#0A66C2] hover:bg-blue-700 text-white min-w-[120px]">
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettingForm;
