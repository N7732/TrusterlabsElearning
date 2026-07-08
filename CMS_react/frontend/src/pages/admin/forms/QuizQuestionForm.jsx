import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../../api/apiClient';
import Card, { CardContent } from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ArrowLeft } from 'lucide-react';

const QuizQuestionForm = ({ isEditing, questionId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/entity' : '/admin';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [quizzes, setQuizzes] = useState([]);
  
  const [formData, setFormData] = useState({
    quiz: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    order: 0,
    marks: 1,
  });

  useEffect(() => {
    fetchQuizzes();
    if (isEditing && questionId) {
      fetchQuestionData();
    }
  }, [isEditing, questionId]);

  const fetchQuizzes = async () => {
    try {
      const data = await apiClient.get('/api/quizes/');
      setQuizzes(data.results || data || []);
    } catch (err) {
      console.error('Failed to fetch quizzes for dropdown', err);
    }
  };

  const fetchQuestionData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/api/quiz_questions/${questionId}/`);
      setFormData({
        quiz: data.quiz || '',
        question_text: data.question_text || '',
        option_a: data.option_a || '',
        option_b: data.option_b || '',
        option_c: data.option_c || '',
        option_d: data.option_d || '',
        correct_option: data.correct_option || 'A',
        order: data.order || 0,
        marks: data.marks || 1,
      });
    } catch (err) {
      setError('Failed to load question data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await apiClient.put(`/api/quiz_questions/${questionId}/`, formData);
      } else {
        await apiClient.post('/api/quiz_questions/', formData);
      }
      navigate(`${basePath}/quiz_questions`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-500 hover:text-[#0A66C2] mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Quiz Questions
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">{isEditing ? 'Edit Question' : 'Add New Question'}</h2>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden rounded-xl">
        <CardContent className="p-8 border-t-4 border-[#FFD700]">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Select Quiz *</label>
              <select 
                name="quiz" required
                value={formData.quiz} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
              >
                <option value="" disabled>Select a quiz...</option>
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Question Text *</label>
              <textarea 
                name="question_text" rows="3" required
                value={formData.question_text} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                placeholder="What is the main purpose of React?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Option A *</label>
                <input 
                  type="text" name="option_a" required
                  value={formData.option_a} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Option B *</label>
                <input 
                  type="text" name="option_b" required
                  value={formData.option_b} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Option C *</label>
                <input 
                  type="text" name="option_c" required
                  value={formData.option_c} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Option D *</label>
                <input 
                  type="text" name="option_d" required
                  value={formData.option_d} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Correct Option *</label>
                <select 
                  name="correct_option" required
                  value={formData.correct_option} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Display Order</label>
                <input 
                  type="number" name="order" min="0" required
                  value={formData.order} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Marks (Points)</label>
                <input 
                  type="number" name="marks" min="1" required
                  value={formData.marks} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#F0C800] outline-none"
                  help="Points awarded for getting this correct."
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 text-base font-bold bg-[#FFD700] hover:bg-[#F0C800] text-black shadow-md"
            >
              {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Question')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizQuestionForm;
