import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { apiClient } from '../../../api/apiClient';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { FileText, Link as LinkIcon, Edit3 } from 'lucide-react';

const ExamForm = ({ isEditing, examId }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTraining = searchParams.get('training') || '';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    exam_date: '',
    training: initialTraining,
    linked_exam: ''
  });
  
  const [examFile, setExamFile] = useState(null);
  const [currentFileUrl, setCurrentFileUrl] = useState(null);
  
  const [trainings, setTrainings] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Content Mode: 'editor', 'pdf', 'quiz'
  const [contentMode, setContentMode] = useState('editor');

  useEffect(() => {
    fetchTrainings();
    fetchQuizzes();
    if (isEditing && examId) {
      fetchExamData();
    }
  }, [isEditing, examId]);

  const fetchTrainings = async () => {
    try {
      const res = await apiClient.get('/training/trainings/');
      setTrainings(Array.isArray(res) ? res : (res.results || []));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await apiClient.get('/api/quizes/');
      setQuizzes(Array.isArray(res) ? res : (res.results || []));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/training/exams/${examId}/`);
      
      setFormData({
        title: res.title || '',
        description: res.description || '',
        exam_date: res.exam_date || '',
        training: res.training ? (typeof res.training === 'object' ? res.training.id : res.training) : '',
        linked_exam: res.linked_exam || ''
      });
      
      if (res.exam_file) {
        setCurrentFileUrl(res.exam_file);
        setContentMode('pdf');
      } else if (res.linked_exam) {
        setContentMode('quiz');
      } else {
        setContentMode('editor');
      }
      
    } catch (err) {
      console.error(err);
      setError('Failed to load exam data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setExamFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('training', formData.training);
    submitData.append('exam_date', formData.exam_date);

    // Only submit relevant fields based on contentMode
    if (contentMode === 'editor' && formData.description) {
      submitData.append('description', formData.description);
    }
    
    if (contentMode === 'quiz' && formData.linked_exam) {
      submitData.append('linked_exam', formData.linked_exam);
    }

    if (contentMode === 'pdf' && examFile) {
      submitData.append('exam_file', examFile);
    }

    try {
      if (isEditing) {
        await apiClient.put(`/training/exams/${examId}/`, submitData);
      } else {
        await apiClient.post('/training/exams/', submitData);
      }
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save exam.');
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
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">
          {isEditing ? 'Edit Final Exam' : 'Create Final Exam'}
        </h2>
        <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Exam Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  placeholder="e.g. Final Certification Exam"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Training Session *</label>
                <select
                  name="training"
                  value={formData.training}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2] bg-white"
                >
                  <option value="">Select Training...</option>
                  {trainings.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Exam Date *</label>
                <input
                  type="date"
                  name="exam_date"
                  value={formData.exam_date}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                />
              </div>

              <div className="md:col-span-2 border-t border-slate-200 pt-6 mt-2">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Content Type</h3>
                
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setContentMode('editor')}
                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-colors ${contentMode === 'editor' ? 'border-[#0A66C2] bg-blue-50 text-[#0A66C2]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    <Edit3 size={24} className="mb-2" />
                    <span className="font-semibold">Write Question</span>
                    <span className="text-xs mt-1 text-center">Use text editor</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setContentMode('pdf')}
                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-colors ${contentMode === 'pdf' ? 'border-[#3E8E41] bg-green-50 text-[#3E8E41]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    <FileText size={24} className="mb-2" />
                    <span className="font-semibold">Upload PDF</span>
                    <span className="text-xs mt-1 text-center">Attach a document</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContentMode('quiz')}
                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-colors ${contentMode === 'quiz' ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    <LinkIcon size={24} className="mb-2" />
                    <span className="font-semibold">Select Multiple Choice Exam</span>
                    <span className="text-xs mt-1 text-center">Use existing course exam</span>
                  </button>
                </div>

                {contentMode === 'editor' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Write Exam Content</label>
                    <Editor
                      apiKey="30842fl2uv0e6tmoh0diverm0dqrmkduldtheg6trhcaf62g"
                      value={formData.description}
                      init={{
                        height: 300,
                        menubar: false,
                        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                      }}
                      onEditorChange={handleEditorChange}
                    />
                  </div>
                )}

                {contentMode === 'pdf' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Upload Exam PDF</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                    />
                    {currentFileUrl && !examFile && (
                      <p className="text-sm mt-3 text-slate-600">
                        Current File: <a href={currentFileUrl} target="_blank" rel="noreferrer" className="text-[#3E8E41] font-semibold underline">View Document</a>
                      </p>
                    )}
                  </div>
                )}

                {contentMode === 'quiz' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Existing Multiple Choice Exam</label>
                    <select
                      name="linked_exam"
                      value={formData.linked_exam}
                      onChange={handleChange}
                      className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="">-- Choose an Exam --</option>
                      {quizzes.map(q => (
                        <option key={q.id} value={q.id}>{q.title} (Max Attempts: {q.max_attempts})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200">
              <Button type="submit" disabled={saving} className="bg-[#0A66C2] hover:bg-blue-700 text-white min-w-[120px]">
                {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Exam')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamForm;
