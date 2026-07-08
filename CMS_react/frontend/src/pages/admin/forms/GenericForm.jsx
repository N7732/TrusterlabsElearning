import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminConfig } from '../../../config/adminConfig';
import { apiClient } from '../../../api/apiClient';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const GenericForm = ({ entityId, itemId, isEditing }) => {
  const navigate = useNavigate();
  const config = adminConfig[entityId];
  
  const [formData, setFormData] = useState({});
  const [fileData, setFileData] = useState({});
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing && itemId) {
      fetchItemData();
    }
  }, [isEditing, itemId, entityId]);

  const fetchItemData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`${config.endpoint}${itemId}/`);
      setFormData(res);
    } catch (err) {
      console.error(err);
      setError(`Failed to load ${config.label} data.`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFileData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const hasFiles = Object.keys(fileData).length > 0;
      let submitData = formData;

      if (hasFiles) {
        submitData = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            submitData.append(key, formData[key]);
          }
        });
        Object.keys(fileData).forEach(key => {
          if (fileData[key]) {
            submitData.append(key, fileData[key]);
          }
        });
      }

      if (isEditing) {
        await apiClient.put(`${config.endpoint}${itemId}/`, submitData);
      } else {
        await apiClient.post(config.endpoint, submitData);
      }
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save data. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <div>Entity not found.</div>;

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E8E41]"></div>
      </div>
    );
  }

  const formFields = config.formFields || config.columns.filter(c => c.field !== 'id' && c.field !== 'created_at').map(c => ({
    field: c.field,
    label: c.label
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {isEditing ? `Edit ${config.label}` : `Add New ${config.label}`}
        </h2>
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="text-slate-600 border-slate-300 hover:bg-slate-100"
        >
          Cancel
        </Button>
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
              {formFields.map((field) => {
                const val = formData[field.field];
                const isBoolean = field.type === 'boolean' || typeof val === 'boolean' || field.field.startsWith('is_') || field.field.startsWith('has_');
                const isDate = field.type === 'date' || field.field.includes('date');
                const isImage = field.type === 'image';
                const isTextarea = field.type === 'textarea';
                
                if (isBoolean) {
                  return (
                    <div key={field.field} className="flex items-center space-x-3 pt-6">
                      <input
                        type="checkbox"
                        id={field.field}
                        name={field.field}
                        checked={formData[field.field] || false}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-slate-300 text-[#0A66C2] focus:ring-[#0A66C2]"
                      />
                      <label htmlFor={field.field} className="text-sm font-medium text-slate-700">
                        {field.label}
                      </label>
                    </div>
                  );
                }

                if (isImage) {
                  return (
                    <div key={field.field}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type="file"
                        name={field.field}
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      />
                      {isEditing && formData[field.field] && typeof formData[field.field] === 'string' && (
                        <div className="mt-2 text-sm text-slate-500">
                          Current: <a href={formData[field.field]} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] underline">View Image</a>
                        </div>
                      )}
                    </div>
                  );
                }

                if (isTextarea) {
                  return (
                    <div key={field.field} className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {field.label}
                      </label>
                      <textarea
                        name={field.field}
                        value={formData[field.field] || ''}
                        onChange={handleChange}
                        rows={4}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2] transition-all"
                      ></textarea>
                    </div>
                  );
                }

                if (field.type === 'select' && field.options) {
                  return (
                    <div key={field.field}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {field.label}
                      </label>
                      <select
                        name={field.field}
                        value={formData[field.field] || ''}
                        onChange={handleChange}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2] bg-white transition-all"
                      >
                        <option value="">Select an option</option>
                        {field.options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                }

                let inputType = 'text';
                if (isDate) inputType = 'date';
                if (field.type) inputType = field.type;

                return (
                  <div key={field.field}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      type={inputType}
                      name={field.field}
                      value={typeof formData[field.field] === 'object' && formData[field.field] !== null ? formData[field.field].id || '' : formData[field.field] || ''}
                      onChange={handleChange}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent transition-all"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-8">
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-[#0A66C2] hover:bg-blue-700 text-white min-w-[120px]"
              >
                {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenericForm;
