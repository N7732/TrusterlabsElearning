import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../api/apiClient';
import { Play, Building2, BookOpen, Clock } from 'lucide-react';

const LearnerDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [grades, setGrades] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const timestamp = new Date().getTime();
      const [enrollData, trainingData, gradesData, certData] = await Promise.all([
        apiClient.get(`/api/enrollments/?t=${timestamp}`).catch(err => {
          console.error("Error fetching enrollments:", err);
          return { results: [] };
        }),
        apiClient.get(`/training/trainings/my-trainings/?t=${timestamp}`).catch(err => {
          console.error("Error fetching trainings:", err);
          return { results: [] };
        }),
        apiClient.get(`/auth/api/my-grades/?t=${timestamp}`).catch(err => {
          console.error("Error fetching grades:", err);
          return { results: [] };
        }),
        apiClient.get(`/certification/api/certificates/my_certificates/?t=${timestamp}`).catch(err => {
          console.error("Error fetching certificates:", err);
          return [];
        })
      ]);
      
      setEnrollments(enrollData.results || enrollData || []);
      setTrainings(trainingData.results || trainingData || []);
      setGrades(gradesData.results || gradesData || []);
      setCertificates(certData.results || certData || []);
    } catch (err) {
      setError('Failed to load your learning dashboard.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900">My Learning</h1>
          <p className="text-slate-600 mt-2">Pick up where you left off or start something new.</p>
        </div>

        <div className="flex border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'courses' 
                ? 'border-[#0A66C2] text-[#0A66C2]' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab('trainings')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'trainings' 
                ? 'border-[#0A66C2] text-[#0A66C2]' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            My Trainings
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'grades' 
                ? 'border-[#0A66C2] text-[#0A66C2]' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            My Grades
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'certificates' 
                ? 'border-[#0A66C2] text-[#0A66C2]' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            My Certificates
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'activities' 
                ? 'border-[#0A66C2] text-[#0A66C2]' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Recent Activities
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-100 mb-8 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A66C2]"></div>
          </div>
        ) : activeTab === 'courses' ? (
          (() => {
            const activeEnrollments = enrollments.filter(e => e.status !== 'completed');
            if (activeEnrollments.length === 0) {
              return (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-slate-200">
                  <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-700 mb-2">You haven't enrolled in any active courses yet</h2>
                  <p className="text-slate-500 max-w-md mx-auto mb-6">
                    Browse our catalog to find a course that interests you.
                  </p>
                  <Link to="/courses" className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#0A66C2] hover:bg-[#004182]">
                    Explore Courses
                  </Link>
                </div>
              );
            }
            return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeEnrollments.map(enrollment => {
                const course = enrollment.course_details;
                if (!course) return null;
                
                const isPending = enrollment.status === 'pending';
                
                return (
                  <Link to={isPending ? '#' : `/course/${course.id}`} key={enrollment.id} className="block group">
                    <div className={`bg-[#F8F9FA] border border-slate-200 rounded-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow relative border-b-2 ${isPending ? 'border-b-amber-500' : 'border-b-[#0A66C2]'}`}>
                      
                      <div className="relative h-44 w-full bg-slate-300 overflow-hidden">
                        <img 
                          src={getImageUrl(course.thumbnail)} 
                          alt={course.title} 
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20"></div>
                        
                        <div className={`absolute top-3 left-3 text-slate-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm ${isPending ? 'bg-amber-500' : 'bg-[#0A66C2]'}`}>
                          {isPending ? 'PENDING APPROVAL' : 'ENROLLED'}
                        </div>
    

                      </div>
                      
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{course.instructor_name || 'TRUSTERLABS Ltd.'}</span>
                        </div>
    
                        <h3 className="text-[15px] font-bold text-slate-900 leading-snug mb-1">
                          {course.title}
                        </h3>
                        <p className="text-[13px] text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                          {course.description ? course.description.replace(/<[^>]+>/g, '') : ''}
                        </p>
                        
                        <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>Progress: {enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-[#0A66C2] h-1.5 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                          </div>
                        </div>
                      </div>
    
                    </div>
                  </Link>
                );
              })}
            </div>
            );
          })()
        ) : activeTab === 'trainings' ? (
          trainings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-slate-200">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-700 mb-2">You haven't applied to any trainings yet</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                Explore our instructor-led training sessions.
              </p>
              <Link to="/training" className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#0A66C2] hover:bg-[#004182]">
                View Trainings
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trainings.map(training => (
                <Link to={`/learner/trainings/${training.id}`} key={training.id} className="block group">
                  <div className={`bg-[#F8F9FA] border border-slate-200 rounded-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow relative border-b-2 border-b-[#0A66C2]`}>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2 group-hover:text-[#0A66C2] transition-colors">
                        {training.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium">
                        <Clock className="w-4 h-4" />
                        <span>{training.starting_date} to {training.ending_date}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                        {training.description}
                      </p>
                      <div className="mt-auto">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                          View Details
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : activeTab === 'grades' ? (
          grades.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-slate-200">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-700 mb-2">No grades available yet</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                Complete a quiz, classwork, or final exam to see your marks here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assessment</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">{grade.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          grade.type === 'Course Quiz' ? 'bg-purple-100 text-purple-800' :
                          grade.type === 'Training Classwork' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {grade.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">
                          {grade.score !== null ? (
                            grade.total_marks ? `${grade.score} / ${grade.total_marks}` : `${grade.score}`
                          ) : (
                            <span className="text-slate-400 italic">Not Graded</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-sm ${
                          grade.status === 'Passed' ? 'bg-green-100 text-green-800' :
                          grade.status === 'Failed' ? 'bg-red-100 text-red-800' :
                          grade.status === 'Graded' ? 'bg-[#0A66C2] text-white' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {grade.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                        {new Date(grade.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'certificates' ? (
          certificates.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-slate-200">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-700 mb-2">No certificates earned yet</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                Complete a course or training with a certificate offering to earn yours.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(cert => (
                <div key={cert.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
                  <div className="p-6 flex-1 text-center">
                    <div className="w-16 h-16 bg-blue-50 text-[#0A66C2] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12"></path><path d="M2 15V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12"></path><path d="M2 15h20"></path><path d="m7 19 5-4 5 4"></path><path d="m12 22-5-3-5 3v-7h20v7z"></path></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Certificate of Completion</h3>
                    <p className="text-sm text-slate-600 mb-1">For successfully completing:</p>
                    <p className="text-base font-semibold text-[#0A66C2] mb-4">
                      {cert.course_details ? cert.course_details.title : (cert.training_details ? cert.training_details.title : 'Unknown Program')}
                    </p>
                    <p className="text-xs text-slate-500">Issued to: {cert.learner_name}</p>
                    <p className="text-xs text-slate-500">Date: {new Date(cert.issued_at || cert.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-400 mt-2 font-mono">ID: {cert.certificate_code}</p>
                  </div>
                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col gap-2">
                    <Link 
                      to={`/verify/${cert.certificate_code}`}
                      className="w-full text-center py-2 px-4 bg-[#0A66C2] text-white text-sm font-semibold rounded-md hover:bg-[#004182] transition-colors"
                    >
                      View Certificate
                    </Link>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/verify/${cert.certificate_code}`);
                          alert('Verification link copied to clipboard!');
                        }}
                        className="flex-1 py-1.5 px-3 border border-slate-300 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-100 transition-colors flex justify-center items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        Share
                      </button>
                      <button 
                        onClick={() => {
                          // Using a pop-up window to trigger print
                          const printWindow = window.open(`/verify/${cert.certificate_code}`);
                          if (printWindow) {
                            printWindow.onload = () => {
                              setTimeout(() => {
                                printWindow.print();
                              }, 1000); // Give it time to load fonts/images
                            };
                          }
                        }}
                        className="flex-1 py-1.5 px-3 bg-slate-800 text-white text-xs font-semibold rounded-md hover:bg-black transition-colors flex justify-center items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'activities' ? (
          (() => {
            const completedEnrollments = enrollments.filter(e => e.status === 'completed');
            if (completedEnrollments.length === 0) {
              return (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-slate-200">
                  <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-700 mb-2">No completed courses yet</h2>
                  <p className="text-slate-500 max-w-md mx-auto mb-6">
                    Complete your active courses to see your recent activities here.
                  </p>
                </div>
              );
            }
            return (
              <div className="space-y-4">
                {completedEnrollments.map(enrollment => {
                  const course = enrollment.course_details;
                  if (!course) return null;
                  
                  return (
                    <div key={`activity-${enrollment.id}`} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center sm:items-start hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">You completed the course "{course.title}"</h3>
                        <p className="text-sm text-slate-500">Instructor: {course.instructor_name || 'TRUSTERLABS Ltd.'}</p>
                      </div>
                      <div className="shrink-0">
                        <Link 
                          to={`/learner/dashboard`}
                          state={{ tab: 'certificates' }}
                          className="px-4 py-2 border border-slate-200 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors inline-block"
                        >
                          View Certificate
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()
        ) : null}
      </div>
    </div>
  );
};

export default LearnerDashboard;
