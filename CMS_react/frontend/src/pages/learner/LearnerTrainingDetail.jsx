import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Calendar, Clock, FileText, Upload, CheckCircle, Lock } from 'lucide-react';
import { useTrainingDetails, useSubmitClasswork } from '../../hooks/queries/useLearnerQueries';

const LearnerTrainingDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: training, isLoading: loading, error } = useTrainingDetails(id);
  const { mutateAsync: submitClasswork } = useSubmitClasswork();
  
  // File upload state per classwork ID
  const [uploadingMap, setUploadingMap] = useState({});
  const [fileMap, setFileMap] = useState({});

  const handleFileChange = (classworkId, e) => {
    const file = e.target.files[0];
    if (file) {
      setFileMap(prev => ({ ...prev, [classworkId]: file }));
    }
  };

  const handleSubmitClasswork = async (classworkId) => {
    const file = fileMap[classworkId];
    if (!file) return;

    try {
      setUploadingMap(prev => ({ ...prev, [classworkId]: true }));
      const formData = new FormData();
      formData.append('submission_file', file);

      await submitClasswork({ classworkId, formData });
      
      alert('Classwork submitted successfully!');
      // Clear file after submission
      setFileMap(prev => {
        const newMap = { ...prev };
        delete newMap[classworkId];
        return newMap;
      });
    } catch (err) {
      alert(err.message || 'Failed to submit classwork');
    } finally {
      setUploadingMap(prev => ({ ...prev, [classworkId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#77C159]"></div>
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-500">{error?.message || (typeof error === 'string' ? error : 'Training not found')}</p>
          <button onClick={() => navigate('/learner/dashboard')} className="mt-4 text-[#0A66C2] hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentParticipant = training.participants?.find(p => p.participant === user?.id);
  const isAdmitted = currentParticipant?.admission_status === 'ADMITTED';

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <button onClick={() => navigate('/learner/dashboard')} className="text-sm font-medium text-[#77C159] hover:underline mb-2 inline-block">
            &larr; Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-slate-900">{training.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {training.starting_date} to {training.ending_date}</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${isAdmitted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              Status: {currentParticipant?.admission_status || 'UNKNOWN'}
            </span>
          </div>
        </div>

        {!isAdmitted ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Under Review</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Your application for this training is currently pending confirmation from the administrators. You will gain access to modules, classwork, and exams once admitted.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Description</h2>
              <p className="text-slate-600 whitespace-pre-wrap">{training.description}</p>
            </div>

            {/* Courses / Modules Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-[#0A66C2]" /> 
                Training Modules (Courses)
              </h2>
              {(!training.courses || training.courses.length === 0) ? (
                <p className="text-slate-500 italic text-center py-8">No modules assigned yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {training.courses.map(tc => (
                    <div key={tc.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-32 bg-slate-100 relative">
                        {tc.course_detail?.thumbnail && (
                          <img src={getImageUrl(tc.course_detail.thumbnail)} alt={tc.course_detail.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-800 mb-1">{tc.course_detail?.title}</h3>
                        <button 
                          onClick={() => navigate(`/course/${tc.course_detail?.id}`)}
                          className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded transition-colors text-sm"
                        >
                          Access Module
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#77C159]" /> 
            Classwork Assignments
          </h2>
          
          {(!training.classworks || training.classworks.length === 0) ? (
            <p className="text-slate-500 italic text-center py-8">No classwork assigned yet.</p>
          ) : (
            <div className="space-y-6">
              {training.classworks.map(cw => (
                <div key={cw.id} className="border border-slate-200 rounded-lg p-5 hover:border-[#77C159] transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{cw.title}</h3>
                      <p className="text-sm text-slate-500 flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-1" /> Due: {cw.due_date}
                      </p>
                    </div>
                    {cw.classwork_file && (
                      <a href={cw.classwork_file} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#0A66C2] hover:underline bg-blue-50 px-3 py-1 rounded-full">
                        View Assignment Document
                      </a>
                    )}
                  </div>

                  <div 
                    className="prose prose-sm prose-slate max-w-none text-slate-600 mb-6" 
                    dangerouslySetInnerHTML={{ __html: cw.description }}
                  ></div>

                  <div className="bg-[#F8F9FA] rounded-lg p-4 border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-3">Your Submission</h4>
                    
                    {cw.my_submission ? (
                      <div className="flex items-center justify-between bg-white p-4 border border-slate-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {cw.my_submission.is_quiz ? 'Quiz Completed' : 'Document Submitted'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Submitted on {new Date(cw.my_submission.submission_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {cw.my_submission.score !== null ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-bold text-sm rounded-full">
                              Score: {cw.my_submission.score} {cw.my_submission.total_marks ? `/ ${cw.my_submission.total_marks}` : ''}
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 font-bold text-sm rounded-full">
                              Not yet Graded!
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {cw.linked_quiz ? (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-600">This classwork requires completing a quiz.</p>
                            <button 
                              onClick={() => navigate(`/quiz/${cw.linked_quiz}?training_classwork=${cw.id}`)}
                              disabled={cw.due_date && new Date(cw.due_date) < new Date()}
                              className={`text-sm font-bold py-2 px-4 rounded transition-colors ${cw.due_date && new Date(cw.due_date) < new Date() ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#77C159] hover:bg-[#68AA4E] text-white'}`}
                            >
                              Take Quiz
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-3 items-center">
                            <input 
                              type="file" 
                              onChange={(e) => handleFileChange(cw.id, e)}
                              disabled={cw.due_date && new Date(cw.due_date) < new Date()}
                              className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-emerald-50 file:text-emerald-700
                                hover:file:bg-emerald-100 cursor-pointer disabled:opacity-50"
                            />
                            <span className="text-xs text-slate-400 whitespace-nowrap">(Max size: 50MB)</span>
                            <button
                              onClick={() => handleSubmitClasswork(cw.id)}
                              disabled={!fileMap[cw.id] || uploadingMap[cw.id] || (cw.due_date && new Date(cw.due_date) < new Date())}
                              className="w-full sm:w-auto shrink-0 bg-[#0A66C2] hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white text-sm font-bold py-2 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
                            >
                              {uploadingMap[cw.id] ? 'Uploading...' : <><Upload className="w-4 h-4" /> Submit File</>}
                            </button>
                          </div>
                        )}
                        
                        {cw.due_date && new Date(cw.due_date) < new Date() && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium">
                            The due date for this assignment has passed. Submissions are no longer accepted.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LearnerTrainingDetail;
