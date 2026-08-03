import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Calendar, Clock, FileText, Upload, CheckCircle, Lock, MessageSquare } from 'lucide-react';
import { useTrainingDetails, useSubmitClasswork, useSubmitExam } from '../../hooks/queries/useLearnerQueries';
import { apiClient } from '../../api/apiClient';

const LearnerTrainingDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: training, isLoading: loading, error } = useTrainingDetails(id);
  const { mutateAsync: submitClasswork } = useSubmitClasswork();
  const { mutateAsync: submitExam } = useSubmitExam();
  
  // File upload state per classwork ID
  const [uploadingMap, setUploadingMap] = useState({});
  const [fileMap, setFileMap] = useState({});
  const [messages, setMessages] = useState([]);

  React.useEffect(() => {
    if (training && training.id) {
      const currentParticipant = training.participants?.find(p => p.participant === user?.id);
      if (currentParticipant?.admission_status === 'ADMITTED' || currentParticipant?.admission_status === 'COMPLETED') {
        apiClient.get(`/training/trainings/${training.id}/messages/`)
          .then(res => setMessages(Array.isArray(res) ? res : (res.data || [])))
          .catch(err => console.error('Failed to fetch messages', err));
      }
    }
  }, [training, user]);

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

  const handleSubmitExam = async (examId) => {
    const file = fileMap[examId];
    if (!file) return;

    try {
      setUploadingMap(prev => ({ ...prev, [examId]: true }));
      const formData = new FormData();
      formData.append('submission_file', file);

      await submitExam({ examId, formData });
      
      alert('Exam submitted successfully!');
      // Clear file after submission
      setFileMap(prev => {
        const newMap = { ...prev };
        delete newMap[examId];
        return newMap;
      });
    } catch (err) {
      alert(err.message || 'Failed to submit exam');
    } finally {
      setUploadingMap(prev => ({ ...prev, [examId]: false }));
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
  const isCompleted = currentParticipant?.admission_status === 'COMPLETED';

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

        {isCompleted ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-4">Congratulations! 🎉</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                You have successfully completed <strong>{training.title}</strong>! Thank you for participating in this training. Your hard work has paid off. Your official certificate is currently being processed and will be available in your Certificates tab shortly.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto bg-slate-50 rounded-xl p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Your Training Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">{training.courses?.length || 0}</h4>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Courses Finished</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">{training.classworks?.length || 0}</h4>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Classworks Submitted</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">{training.final_exams?.length || 0}</h4>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Final Exams Passed</p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button onClick={() => navigate('/learner/dashboard', { state: { tab: 'certificates' } })} className="bg-[#0A66C2] hover:bg-[#004182] text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-sm">
                  View My Certificates
                </button>
              </div>
            </div>
          </div>
        ) : !isAdmitted ? (
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
            
            {/* Messages Section */}
            {messages.length > 0 && (
              <div className="bg-[#f0f7ff] rounded-xl shadow-sm border border-blue-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-[#0A66C2] mb-6 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" /> 
                  Announcements & Messages
                </h2>
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className="bg-white rounded-lg shadow-sm border border-blue-100 p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-slate-800">{msg.sender_name}</span>
                          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
                            {msg.sender_type}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(msg.date_sent).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed mt-2">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-800 flex-1 pr-2">{tc.course_detail?.title}</h3>
                          {tc.is_completed && (
                            <span className="flex items-center text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap">
                              <CheckCircle className="w-3 h-3 mr-1" /> Completed
                            </span>
                          )}
                        </div>
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
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-800">{cw.title}</h3>
                        {cw.my_submission && (
                          <span className="flex items-center text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap">
                            <CheckCircle className="w-3 h-3 mr-1" /> Completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center">
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

        {/* Final Exams Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-500" /> 
            Final Exams
          </h2>
          
          {(!training.final_exams || training.final_exams.length === 0) ? (
            <p className="text-slate-500 italic text-center py-8">No final exams assigned yet.</p>
          ) : (
            <div className="space-y-6">
              {training.final_exams.map(ex => (
                <div key={ex.id} className="border border-slate-200 rounded-lg p-5 hover:border-purple-500 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-800">{ex.title}</h3>
                        {ex.my_submission && (
                          <span className="flex items-center text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap">
                            <CheckCircle className="w-3 h-3 mr-1" /> Completed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" /> 
                        {ex.exam_time ? `Available From: ${ex.exam_date} at ${ex.exam_time.substring(0,5)}` : `Available From: ${ex.exam_date}`}
                      </p>
                    </div>
                    {ex.exam_file && (
                      <a href={ex.exam_file} target="_blank" rel="noreferrer" className="text-sm font-medium text-purple-600 hover:underline bg-purple-50 px-3 py-1 rounded-full">
                        View Exam Document
                      </a>
                    )}
                  </div>

                  <div 
                    className="prose prose-sm prose-slate max-w-none text-slate-600 mb-6" 
                    dangerouslySetInnerHTML={{ __html: ex.description }}
                  ></div>

                  <div className="bg-[#F8F9FA] rounded-lg p-4 border border-slate-100 relative">
                    <h4 className="text-sm font-bold text-slate-800 mb-3">Your Submission</h4>
                    
                    {ex.my_submission ? (
                      <div className="flex items-center justify-between bg-white p-4 border border-slate-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {ex.my_submission.is_quiz ? 'Exam Quiz Completed' : 'Exam Document Submitted'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Submitted on {new Date(ex.my_submission.submission_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {ex.my_submission.score !== null ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-bold text-sm rounded-full">
                              Score: {ex.my_submission.score} {ex.my_submission.total_marks ? `/ ${ex.my_submission.total_marks}` : ''}
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
                        {ex.linked_exam ? (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-600">This final exam requires completing a quiz.</p>
                            <button 
                              onClick={() => navigate(`/quiz/${ex.linked_exam}?training_exam=${ex.id}`)}
                              disabled={ex.due_date && new Date(ex.due_date) < new Date()}
                              className={`text-sm font-bold py-2 px-4 rounded transition-colors ${ex.due_date && new Date(ex.due_date) < new Date() ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                            >
                              Take Exam Quiz
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-3 items-center">
                            <input 
                              type="file" 
                              onChange={(e) => handleFileChange(ex.id, e)}
                              disabled={ex.due_date && new Date(ex.due_date) < new Date()}
                              className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-purple-50 file:text-purple-700
                                hover:file:bg-purple-100 cursor-pointer disabled:opacity-50"
                            />
                            <span className="text-xs text-slate-400 whitespace-nowrap">(Max size: 50MB)</span>
                            <button
                              onClick={() => handleSubmitExam(ex.id)}
                              disabled={!fileMap[ex.id] || uploadingMap[ex.id] || (ex.due_date && new Date(ex.due_date) < new Date())}
                              className="w-full sm:w-auto shrink-0 bg-[#0A66C2] hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white text-sm font-bold py-2 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
                            >
                              {uploadingMap[ex.id] ? 'Uploading...' : <><Upload className="w-4 h-4" /> Submit File</>}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Access check message */}
                    {!ex.my_submission && (
                      (() => {
                        const examDateTime = ex.exam_time 
                          ? new Date(`${ex.exam_date}T${ex.exam_time}`)
                          : new Date(`${ex.exam_date}T00:00:00`);
                        
                        if (new Date() < examDateTime) {
                          return (
                            <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg border border-slate-200">
                               <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 border border-slate-200 shadow-sm">
                                  <Lock className="w-6 h-6 text-slate-400" />
                               </div>
                               <h4 className="text-lg font-bold text-slate-800 mb-1">Exam Locked</h4>
                               <p className="text-sm font-medium text-slate-600">
                                  Available on {examDateTime.toLocaleDateString()} at {examDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </p>
                            </div>
                          );
                        }
                        return null;
                      })()
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
