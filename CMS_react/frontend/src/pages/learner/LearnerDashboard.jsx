import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getImageUrl } from '../../api/apiClient';
import { Play, Building2, BookOpen, Clock, CheckCircle, Rocket, Star, Award, Compass, Shield, BarChart3, GraduationCap } from 'lucide-react';
import bgImage from '../../assets/LearnerdashboardBackground.png';
import { useMyEnrollments, useMyTrainings, useMyGrades, useMyCertificates } from '../../hooks/queries/useLearnerQueries';

const LearnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  const { data: enrollments = [], isLoading: loadingEnrollments, error: errorEnrollments } = useMyEnrollments();
  const { data: trainings = [], isLoading: loadingTrainings, error: errorTrainings } = useMyTrainings();
  const { data: grades = [], isLoading: loadingGrades, error: errorGrades } = useMyGrades();
  const { data: certificates = [], isLoading: loadingCertificates, error: errorCertificates } = useMyCertificates();

  const loading = loadingEnrollments || loadingTrainings || loadingGrades || loadingCertificates;
  
  // Create a combined error message if any exist
  const fetchError = errorEnrollments || errorTrainings || errorGrades || errorCertificates;
  const error = fetchError ? 'Failed to load some dashboard data.' : null;

  return (
    <div className="min-h-screen relative text-slate-200 font-sans bg-[#020617] pb-12" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-[#020617]/40 z-0 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pt-10">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            My <span className="text-amber-500">Learning</span>
          </h1>
          <p className="text-slate-400 mt-2">Pick up where you left off or start something new.</p>
        </div>

        <div className="flex overflow-x-auto whitespace-nowrap hide-scrollbar border-b border-slate-800 mb-8 gap-2 pb-px">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-3 font-medium text-[15px] transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'courses' 
                ? 'border-[#3b82f6] text-[#3b82f6]' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> My Courses
          </button>
          <button
            onClick={() => setActiveTab('trainings')}
            className={`px-4 py-3 font-medium text-[15px] transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'trainings' 
                ? 'border-[#3b82f6] text-[#3b82f6]' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Rocket className="w-4 h-4" /> My Trainings
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-3 font-medium text-[15px] transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'grades' 
                ? 'border-[#3b82f6] text-[#3b82f6]' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4" /> My Grades
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-3 font-medium text-[15px] transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'certificates' 
                ? 'border-[#3b82f6] text-[#3b82f6]' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" /> My Certificates
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-3 font-medium text-[15px] transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'activities' 
                ? 'border-[#3b82f6] text-[#3b82f6]' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" /> Recent Activities
          </button>
        </div>

        <div className="bg-[#0a0f1c]/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-10 min-h-[500px] flex flex-col shadow-2xl">

          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-md border border-red-500/20 mb-8 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20 flex-1">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3b82f6]"></div>
            </div>
          ) : activeTab === 'courses' ? (
            (() => {
              const activeEnrollments = enrollments.filter(e => e.status !== 'completed');
              if (activeEnrollments.length === 0) {
                return (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                    <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                      <div className="absolute inset-0 border border-slate-800 rounded-full"></div>
                      <div className="absolute inset-4 border border-slate-800/50 rounded-full"></div>
                      <BookOpen className="w-20 h-20 text-[#3b82f6] relative z-10" strokeWidth={1.5} />
                      <Rocket className="w-8 h-8 text-slate-400 absolute top-4 right-4 rotate-45" strokeWidth={1} />
                      <Star className="w-3 h-3 text-slate-500 absolute top-10 left-10" />
                      <Star className="w-4 h-4 text-slate-500 absolute bottom-12 right-12" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-3">You haven't enrolled in any active courses yet</h2>
                    <p className="text-slate-400 max-w-lg mx-auto mb-8">
                      Browse our catalog to find a course that interests you<br/>and start your learning journey today.
                    </p>
                    <Link to="/courses" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg shadow-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors">
                      <Compass className="w-5 h-5" />
                      Explore Courses
                      <span className="ml-1">→</span>
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
                    <div className={`bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full hover:shadow-xl transition-all relative border-b-2 ${isPending ? 'border-b-amber-500' : 'border-b-[#3b82f6]'}`}>
                      
                      <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                        <img 
                          src={getImageUrl(course.thumbnail || course.thumbnail_url)} 
                          alt={course.title} 
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        
                        <div className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-md ${isPending ? 'bg-amber-500' : 'bg-[#3b82f6]'}`}>
                          {isPending ? 'PENDING APPROVAL' : 'ENROLLED'}
                        </div>
    
                      </div>
                      
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{course.instructor_name || 'TRUSTERLABS Ltd.'}</span>
                        </div>
    
                        <h3 className="text-[15px] font-bold text-slate-100 leading-snug mb-1 group-hover:text-[#3b82f6] transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-[13px] text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                          {course.description ? course.description.replace(/<[^>]+>/g, '') : ''}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-800 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#3b82f6]" />
                              <span>Progress</span>
                            </div>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[#3b82f6] h-1.5 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: `${enrollment.progress}%` }}></div>
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
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 border border-slate-800 rounded-full"></div>
                <div className="absolute inset-4 border border-slate-800/50 rounded-full"></div>
                <Rocket className="w-12 h-12 text-[#3b82f6] relative z-10" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">You haven't applied to any trainings yet</h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8">
                Explore our instructor-led training sessions.
              </p>
              <Link to="/training" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg shadow-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors">
                <Compass className="w-5 h-5" />
                View Trainings
                <span className="ml-1">→</span>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trainings.map(training => (
                <Link to={`/learner/trainings/${training.id}`} key={training.id} className="block group">
                  <div className={`bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full hover:shadow-xl transition-all relative border-b-2 border-b-[#3b82f6]`}>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-slate-100 leading-snug mb-2 group-hover:text-[#3b82f6] transition-colors">
                        {training.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 font-medium">
                        <Clock className="w-4 h-4 text-[#3b82f6]" />
                        <span>{training.starting_date} to {training.ending_date}</span>
                      </div>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-3">
                        {training.description}
                      </p>
                      <div className="mt-auto">
                        <span className="inline-block px-3 py-1 bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] rounded-full text-xs font-semibold">
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
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 border border-slate-800 rounded-full"></div>
                <div className="absolute inset-4 border border-slate-800/50 rounded-full"></div>
                <Star className="w-12 h-12 text-[#3b82f6] relative z-10" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">No grades available yet</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Complete a quiz, classwork, or final exam to see your marks here.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800 overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900/80">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Assessment</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-200">{grade.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          grade.type === 'Course Quiz' ? 'bg-purple-900/30 text-purple-400 border border-purple-800/50' :
                          grade.type === 'Training Classwork' ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' :
                          'bg-amber-900/30 text-amber-400 border border-amber-800/50'
                        }`}>
                          {grade.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-200">
                          {grade.score !== null ? (
                            grade.total_marks ? `${grade.score} / ${grade.total_marks}` : `${grade.score}`
                          ) : (
                            <span className="text-slate-500 italic">Not Graded</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-sm ${
                          grade.status === 'Passed' ? 'bg-green-900/40 text-green-400' :
                          grade.status === 'Failed' ? 'bg-red-900/40 text-red-400' :
                          grade.status === 'Graded' ? 'bg-[#3b82f6] text-white' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {grade.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-medium">
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
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 border border-slate-800 rounded-full"></div>
                <div className="absolute inset-4 border border-slate-800/50 rounded-full"></div>
                <Award className="w-12 h-12 text-[#3b82f6] relative z-10" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">No certificates earned yet</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Complete a course or training with a certificate offering to earn yours.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(cert => (
                <div key={cert.id} className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col hover:shadow-xl transition-shadow relative border-t-4 border-t-[#3b82f6]">
                  <div className="p-6 flex-1 text-center">
                    <div className="w-16 h-16 bg-[#3b82f6]/10 text-[#3b82f6] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3b82f6]/20">
                      <Award className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Certificate of Completion</h3>
                    <p className="text-sm text-slate-400 mb-1">For successfully completing:</p>
                    <p className="text-base font-semibold text-[#3b82f6] mb-4">
                      {cert.course_details ? cert.course_details.title : (cert.training_details ? cert.training_details.title : 'Unknown Program')}
                    </p>
                    <p className="text-xs text-slate-500">Issued to: {cert.learner_name}</p>
                    <p className="text-xs text-slate-500">Date: {new Date(cert.issued_at || cert.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-600 mt-2 font-mono">ID: {cert.certificate_code}</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 border-t border-slate-800 flex flex-col gap-3">
                    <Link 
                      to={`/verify/${cert.certificate_code}`}
                      className="w-full text-center py-2.5 px-4 bg-[#3b82f6] text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                    >
                      View Certificate
                    </Link>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/verify/${cert.certificate_code}`);
                          alert('Verification link copied to clipboard!');
                        }}
                        className="flex-1 py-2 px-3 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-1"
                      >
                        Share
                      </button>
                      <button 
                        onClick={() => {
                          const printWindow = window.open(`/verify/${cert.certificate_code}`);
                          if (printWindow) {
                            printWindow.onload = () => {
                              setTimeout(() => {
                                printWindow.print();
                              }, 1000);
                            };
                          }
                        }}
                        className="flex-1 py-2 px-3 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-1"
                      >
                        Print
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
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                  <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 border border-slate-800 rounded-full"></div>
                    <div className="absolute inset-4 border border-slate-800/50 rounded-full"></div>
                    <CheckCircle className="w-12 h-12 text-slate-400 relative z-10" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">No completed courses yet</h2>
                  <p className="text-slate-400 max-w-md mx-auto mb-6">
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
                    <div key={`activity-${enrollment.id}`} className="bg-slate-900/50 backdrop-blur p-5 rounded-xl border border-slate-800 shadow-lg flex flex-col sm:flex-row gap-4 items-center sm:items-start hover:shadow-xl transition-all hover:border-[#3b82f6]/50">
                      <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center shrink-0 border border-green-800/50">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-bold text-white mb-1">You completed the course "{course.title}"</h3>
                        <p className="text-sm text-slate-400">Instructor: {course.instructor_name || 'TRUSTERLABS Ltd.'}</p>
                      </div>
                      <div className="shrink-0">
                        <Link 
                          to={`/learner/dashboard`}
                          state={{ tab: 'certificates' }}
                          className="px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors inline-block"
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

        {/* Bottom Feature Banners */}
        <div className="mt-auto pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-[#0a0f1c]/50 rounded-2xl p-6 border border-slate-800">
            {/* 1 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-900/80 rounded-xl flex items-center justify-center border border-slate-800 shrink-0">
                <GraduationCap className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Expert Instructors</h4>
                <p className="text-xs text-slate-400">Learn from industry professionals</p>
              </div>
            </div>
            {/* 2 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-900/80 rounded-xl flex items-center justify-center border border-slate-800 shrink-0">
                <Shield className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Practical Skills</h4>
                <p className="text-xs text-slate-400">Hands-on labs and real world projects</p>
              </div>
            </div>
            {/* 3 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-900/80 rounded-xl flex items-center justify-center border border-slate-800 shrink-0">
                <Award className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Certificates</h4>
                <p className="text-xs text-slate-400">Earn recognized certificates to boost your career</p>
              </div>
            </div>
            {/* 4 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-900/80 rounded-xl flex items-center justify-center border border-slate-800 shrink-0">
                <BarChart3 className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Learn at Your Pace</h4>
                <p className="text-xs text-slate-400">Flexible learning anytime, anywhere</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LearnerDashboard;
