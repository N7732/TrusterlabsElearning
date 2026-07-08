import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Calendar, Users, BookOpen, FileText, Settings, Plus, Trash2 } from 'lucide-react';

const TrainingDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [allCourses, setAllCourses] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]);

  useEffect(() => {
    fetchTrainingData();
    fetchAllCourses();
    fetchAllQuizzes();
  }, [id]);

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/training/trainings/${id}/`);
      setTraining(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const res = await apiClient.get('/api/courses/');
      setAllCourses(Array.isArray(res) ? res : (res.results || []));
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  };

  const fetchAllQuizzes = async () => {
    try {
      const res = await apiClient.get('/api/quizes/');
      setAllQuizzes(Array.isArray(res) ? res : (res.results || []));
    } catch (err) {
      console.error('Failed to fetch quizzes', err);
    }
  };

  const handleAddCourse = async (courseId) => {
    if (!courseId) return;
    try {
      await apiClient.post(`/training/trainings/${id}/add-course/`, { course_id: courseId });
      fetchTrainingData();
    } catch (err) {
      alert(err.message || 'Failed to add course');
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!window.confirm('Remove this course from the training?')) return;
    try {
      await apiClient.post(`/training/trainings/${id}/remove-course/`, { course_id: courseId });
      fetchTrainingData();
    } catch (err) {
      alert(err.message || 'Failed to remove course');
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3E8E41]"></div>
      </div>
    );
  }

  if (!training) {
    return <div className="p-12 text-center text-slate-500">Training session not found.</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Calendar size={18} /> },
    { id: 'courses', label: 'Courses', icon: <BookOpen size={18} /> },
    { id: 'classwork', label: 'Classwork', icon: <FileText size={18} /> },
    { id: 'exams', label: 'Final Exams', icon: <FileText size={18} /> },
    { id: 'participants', label: 'Participants', icon: <Users size={18} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{training.title}</h1>
          <p className="text-slate-500 mt-1">Training Dashboard</p>
        </div>
        <Button onClick={() => navigate(`/admin/trainings/${id}`)} variant="outline" className="flex items-center">
          <Settings size={18} className="mr-2" /> Settings
        </Button>
      </div>

      <div className="flex border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id 
                ? 'border-[#0A66C2] text-[#0A66C2]' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center text-slate-500 mb-2">
                  <Calendar className="w-5 h-5 mr-2" />
                  <h3 className="font-medium">Dates</h3>
                </div>
                <p className="text-slate-800 font-semibold">{training.starting_date} to {training.ending_date}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center text-slate-500 mb-2">
                  <Users className="w-5 h-5 mr-2" />
                  <h3 className="font-medium">Enrolled Participants</h3>
                </div>
                <p className="text-2xl text-slate-800 font-bold">{training.participants?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center text-slate-500 mb-2">
                  <BookOpen className="w-5 h-5 mr-2" />
                  <h3 className="font-medium">Total Courses</h3>
                </div>
                <p className="text-2xl text-slate-800 font-bold">{training.courses?.length || 0}</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Description</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{training.description}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'courses' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Included Courses</h3>
                <div className="flex space-x-2">
                  <select 
                    id="courseSelect" 
                    className="p-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">Select a Course...</option>
                    {allCourses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <Button 
                    onClick={() => handleAddCourse(document.getElementById('courseSelect').value)}
                    className="bg-[#3E8E41] hover:bg-[#317033]"
                  >
                    <Plus size={16} className="mr-1" /> Add
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase">
                      <th className="p-4">Course Title</th>
                      <th className="p-4">Difficulty</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!training.courses || training.courses.length === 0) ? (
                      <tr><td colSpan="3" className="p-4 text-center text-slate-500">No courses added yet.</td></tr>
                    ) : (
                      training.courses.map(tc => (
                        <tr key={tc.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-800">{tc.course_detail?.title || `Course ID: ${tc.course}`}</td>
                          <td className="p-4 text-slate-600">{tc.course_detail?.difficulty}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleRemoveCourse(tc.course)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'classwork' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Classwork Assignments</h3>
                <Button onClick={() => navigate(`/admin/classwork/new?training=${id}`)} className="bg-[#0A66C2] hover:bg-blue-700">
                  <Plus size={16} className="mr-2" /> Create Classwork
                </Button>
              </div>
              <div className="space-y-4">
                {(!training.classworks || training.classworks.length === 0) ? (
                  <p className="text-slate-500 text-center py-4">No classwork added yet.</p>
                ) : (
                  training.classworks.map(cw => (
                    <div key={cw.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:border-[#0A66C2] transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800">{cw.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">Due: {cw.due_date}</p>
                        {cw.classwork_file && (
                          <a href={cw.classwork_file} target="_blank" rel="noreferrer" className="text-sm text-[#3E8E41] hover:underline mt-1 inline-block">View PDF File</a>
                        )}
                        {cw.linked_quiz && (
                          <span className="text-sm text-[#0A66C2] ml-3 mt-1 inline-block">Linked Quiz ID: {cw.linked_quiz}</span>
                        )}
                      </div>
                      <Button variant="outline" onClick={() => navigate(`/admin/classwork/${cw.id}`)}>Edit</Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'exams' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Final Exams</h3>
                <Button onClick={() => navigate(`/admin/exams/new?training=${id}`)} className="bg-[#0A66C2] hover:bg-blue-700">
                  <Plus size={16} className="mr-2" /> Create Exam
                </Button>
              </div>
              <div className="space-y-4">
                {(!training.final_exams || training.final_exams.length === 0) ? (
                  <p className="text-slate-500 text-center py-4">No exams added yet.</p>
                ) : (
                  training.final_exams.map(exam => (
                    <div key={exam.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:border-[#0A66C2] transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800">{exam.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">Date: {exam.exam_date}</p>
                        {exam.linked_exam && (
                          <span className="text-sm text-[#0A66C2] mt-1 inline-block">Linked Exam ID: {exam.linked_exam}</span>
                        )}
                      </div>
                      <Button variant="outline" onClick={() => navigate(`/admin/exams/${exam.id}`)}>Edit</Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'participants' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Enrolled Participants</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase">
                      <th className="p-4">Name</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!training.participants || training.participants.length === 0) ? (
                      <tr><td colSpan="3" className="p-4 text-center text-slate-500">No participants yet.</td></tr>
                    ) : (
                      training.participants.map(p => (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-800">{p.participant_detail?.first_name} {p.participant_detail?.last_name} ({p.participant_detail?.email})</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              p.admission_status === 'ADMITTED' ? 'bg-green-100 text-green-800' :
                              p.admission_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {p.admission_status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {/* Actions like Admit/Reject can go here */}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrainingDashboard;
