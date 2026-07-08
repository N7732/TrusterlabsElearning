import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/apiClient';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const TrainingForm = ({ isEditing, trainingId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    starting_date: '',
    ending_date: ''
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing && trainingId) {
      fetchTrainingData();
    }
  }, [isEditing, trainingId]);

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/training/trainings/${trainingId}/`);
      setFormData({
        title: res.title || '',
        description: res.description || '',
        starting_date: res.starting_date || '',
        ending_date: res.ending_date || ''
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load training data.');
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
        await apiClient.put(`/training/trainings/${trainingId}/`, formData);
      } else {
        await apiClient.post('/training/trainings/', formData);
      }
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save training.');
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
          {isEditing ? 'Edit Training Session' : 'Create Training Session'}
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Training Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Starting Date</label>
                <input
                  type="date"
                  name="starting_date"
                  value={formData.starting_date}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ending Date</label>
                <input
                  type="date"
                  name="ending_date"
                  value={formData.ending_date}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-8">
              <Button type="submit" disabled={saving} className="bg-[#0A66C2] hover:bg-blue-700 text-white min-w-[120px]">
                {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Training')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingForm;
