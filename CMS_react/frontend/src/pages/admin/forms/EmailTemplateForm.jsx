import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/apiClient';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ArrowLeft } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

const EmailTemplateForm = ({ isEditing, templateId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    template_name: '',
    subject: '',
    html_content: '',
    text_content: '',
    is_active: true
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing && templateId) {
      fetchTemplateData();
    }
  }, [isEditing, templateId]);

  const fetchTemplateData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/superadmin/api/email-templates/${templateId}/`);
      setFormData({
        template_name: res.template_name || '',
        subject: res.subject || '',
        html_content: res.html_content || '',
        text_content: res.text_content || '',
        is_active: res.is_active !== undefined ? res.is_active : true
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load email template.');
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
    setSaving(true);
    setError(null);
    try {
      if (isEditing) {
        await apiClient.put(`/superadmin/api/email-templates/${templateId}/`, formData);
      } else {
        await apiClient.post(`/superadmin/api/email-templates/`, formData);
      }
      navigate('/superadmin/entity/email_templates');
    } catch (err) {
      console.error(err);
      setError('Failed to save email template. Check required fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3182ce]"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <button 
        onClick={() => navigate('/superadmin/entity/email_templates')} 
        className="flex items-center text-slate-500 hover:text-[#0A66C2] mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Email Templates
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit Email Template' : 'Create Email Template'}</h2>
        <p className="text-slate-500 mt-2">Manage the HTML structure and content for automated emails.</p>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden rounded-xl">
        <CardContent className="p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Template Name *</label>
              <input 
                type="text" 
                name="template_name" 
                required
                disabled={isEditing}
                value={formData.template_name} 
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none disabled:bg-slate-100 disabled:text-slate-500"
                placeholder="e.g. welcome_email"
              />
              {isEditing && <p className="text-xs text-slate-500 mt-1">Template name cannot be changed once created since the backend relies on this identifier.</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Subject *</label>
              <input 
                type="text" 
                name="subject" 
                required
                value={formData.subject} 
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none"
                placeholder="e.g. Welcome to TrusterLab!"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">HTML Content *</label>
              <Editor
                apiKey="30842fl2uv0e6tmoh0diverm0dqrmkduldtheg6trhcaf62g"
                init={{
                  plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount code',
                  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | code | removeformat',
                  height: 600,
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
                value={formData.html_content}
                onEditorChange={(content) => {
                  setFormData(prev => ({ ...prev, html_content: content }));
                }}
              />
              <p className="text-xs text-slate-500 mt-2">Use the "Code" (&lt;&gt;) button in the toolbar to directly edit the raw HTML of the email. You can use Django template variables like {'{{ user.email }}'}.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Text Fallback (Optional)</label>
              <textarea 
                name="text_content" 
                rows={4}
                value={formData.text_content} 
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#3E8E41] outline-none resize-y"
                placeholder="Plain text version of the email for email clients that do not support HTML..."
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="is_active"
                name="is_active" 
                checked={formData.is_active} 
                onChange={handleInputChange}
                className="w-4 h-4 text-[#3182ce] rounded focus:ring-[#3182ce]"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">
                Template Active (emails will not be sent if unchecked)
              </label>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <Button type="button" variant="secondary" className="mr-3" onClick={() => navigate('/superadmin/entity/email_templates')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplateForm;
