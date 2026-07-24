import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient, getImageUrl, getVideoUrl } from '../../api/apiClient';
import { 
  Menu, Search, Moon, Languages, Accessibility, Maximize, 
  ChevronDown, ChevronUp, CheckCircle, ChevronLeft, ChevronRight,
  ArrowDown, Users
} from 'lucide-react';
import PaymentDrawer from '../../components/courses/PaymentDrawer';
import InquiryDrawer from '../../components/courses/InquiryDrawer';

import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [activeTab, setActiveTab] = useState('outline');
  const [modules, setModules] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCourseLocked, setIsCourseLocked] = useState(false);

  const [completedLessons, setCompletedLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [courseCompletedState, setCourseCompletedState] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const toggleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      } else {
        const textToRead = document.querySelector('.prose-container')?.innerText || activeLesson?.description || activeLesson?.title || "No content to read.";
        const utterance = new SpeechSynthesisUtterance(textToRead);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const toggleTranslator = () => {
    setIsTranslatorOpen(!isTranslatorOpen);
    if (!window.googleTranslateElementInit && !document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
      };
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  };

  useEffect(() => {
    if (activeLesson && activeLesson.content) {
      setTimeout(() => {
        const preTags = document.querySelectorAll('.prose-container pre');
        preTags.forEach(pre => {
          if (!pre.className.includes('language-')) {
            pre.classList.add('language-javascript'); // Default safe language
          }
        });
        Prism.highlightAll();
      }, 0);
    }
  }, [activeLesson]);

  useEffect(() => {
    if (courseId) {
      const init = async () => {
        setLoading(true);
        const stored = localStorage.getItem(`course_progress_${courseId}`);
        if (stored) {
          try {
            setCompletedLessons(JSON.parse(stored));
          } catch(e) {}
        }
        const data = await fetchCourseDetails();
        await checkEnrollment(data);
        if (isAuthenticated) {
          fetchProgress();
        }
        setLoading(false);
      };
      init();
    }
  }, [courseId, isAuthenticated]);

  const fetchProgress = async () => {
    try {
      const response = await apiClient.get(`/api/courses/${courseId}/progress/`);
      if (response && response.completed_lessons) {
        setCompletedLessons(response.completed_lessons);
        localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(response.completed_lessons));
      }
      if (response && response.just_completed) {
        setShowCompletionModal(true);
      }
      if (response && response.course_completed) {
        setCourseCompletedState(true);
      }
    } catch (err) {
      console.error('Failed to fetch progress from server', err);
    }
  };

  const checkEnrollment = async (fetchedCourseData) => {
    try {
      const token = localStorage.getItem('truster_lab_token');
      if (!token) {
        setIsEnrolled(false);
        setCheckingEnrollment(false);
        return;
      }
      const data = await apiClient.get('/api/enrollments/');
      const results = data.results || data;
      const enrollments = Array.isArray(results) ? results : [];
      
      // Admin/Instructor bypass logic
      if (isAdmin) {
        setIsEnrolled(true);
        setCheckingEnrollment(false);
        return;
      }
      
      const targetCourse = fetchedCourseData || courseData;
      
      if (user && user.user_type === 'instructor' && targetCourse) {
        // If the user is the instructor of this course, let them preview it
        if (targetCourse.instructor && targetCourse.instructor.user === user.id) {
           setIsEnrolled(true);
           setCheckingEnrollment(false);
           return;
        }
      }

      const enrolled = enrollments.some(e => 
        (e.course_details?.id === parseInt(courseId) || e.course === parseInt(courseId)) 
        && ['active', 'completed'].includes(e.status)
      );
      setIsEnrolled(enrolled);
    } catch(err) {
      setIsEnrolled(false);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const enrollUser = async () => {
    try {
      setIsEnrolling(true);
      const response = await apiClient.post(`/api/courses/${courseId}/enroll/`);
      // Any successful response (active, pending, or already enrolled) marks as enrolled
      if (response.enrollment_status === 'active' || response.enrollment_status === 'pending') {
        setIsEnrolled(true);
        if (response.enrollment_status === 'pending') {
          alert('Your enrollment request has been submitted and is pending approval.');
        }
      } else {
        // Fallback: treat any successful response as enrolled
        setIsEnrolled(true);
      }
    } catch(err) {
      console.error(err);
      const errMsg = err.message || '';
      // If the error says already enrolled, treat it as success - just mark enrolled
      if (
        errMsg.toLowerCase().includes('already enrolled') ||
        errMsg.toLowerCase().includes('already exist') ||
        errMsg.toLowerCase().includes('duplicate') ||
        errMsg.toLowerCase().includes('unique') ||
        errMsg.toLowerCase().includes('already registered')
      ) {
        setIsEnrolled(true);
        return;
      }
      // Show a friendly alert only for real errors
      let errorMsg = 'Failed to enroll. Please try again.';
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.error) errorMsg = parsed.error;
        else if (parsed.message) errorMsg = parsed.message;
        else if (parsed.detail) errorMsg = parsed.detail;
      } catch (e) {
        if (errMsg && !errMsg.toLowerCase().includes('fetch')) errorMsg = errMsg;
      }
      alert(errorMsg);
    } finally {
      setIsEnrolling(false);
    }
  };

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      // Fetch the specific course by ID. The serializer includes nested modules and lessons.
      const data = await apiClient.get(`/api/courses/${courseId}/`);
      
      if (data.is_locked && !isAdmin) {
        setIsCourseLocked(true);
        setLoading(false);
        return;
      }
      
      setCourseData(data);
      
      // Initialize modules state (add isOpen property)
      if (data.modules) {
        const initializedModules = data.modules.map((mod, index) => ({
          ...mod,
          isOpen: index === 0 // Open the first module by default
        }));
        setModules(initializedModules);
        
        // Set the first lesson as active by default if available
        if (initializedModules.length > 0 && initializedModules[0].lessons?.length > 0) {
          selectLesson(initializedModules[0].lessons[0]);
        }
      }
      return data;
    } catch (err) {
      console.error(err);
      setError('Failed to load course content.');
      return null;
    }
  };

  const handleQuizSubmit = async () => {
    try {
      setSubmittingQuiz(true);
      const response = await apiClient.post(`/api/quizes/${activeLesson.id}/submit_quiz/`, { answers: quizAnswers });
      setQuizResult(response);
      if (response.passed) {
        markLessonComplete(activeLesson.id);
        // Immediately refresh progress from server to get latest completion state
        await fetchProgress();
      }
      if (response.course_completed) {
        setCourseCompletedState(true);
        setShowCompletionModal(true);
      }
    } catch (err) {
      console.error('Quiz submit error:', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        alert("Cannot connect to the server. Please check your internet connection and try again.");
      } else {
        alert("Failed to submit quiz: " + msg);
      }
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const toggleModule = (moduleId) => {
    setModules(modules.map(mod => 
      mod.id === moduleId ? { ...mod, isOpen: !mod.isOpen } : mod
    ));
  };

  const selectLesson = async (lesson) => {
    setActiveLesson(lesson);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizStarted(false);
    
    if (lesson.questions && lesson.questions.length > 0) {
      try {
        const response = await apiClient.get(`/api/quizes/${lesson.id}/my_submission/`);
        setQuizResult(response);
        if (response.passed) {
          markLessonComplete(lesson.id);
        }
      } catch (e) {
        // Expected if no previous submission
      }
    }
  };

  const markLessonComplete = async (lessonId) => {
    setCompletedLessons(prev => {
      if (prev.includes(lessonId)) return prev;
      const updated = [...prev, lessonId];
      localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(updated));
      return updated;
    });

    if (isAuthenticated) {
      try {
        const response = await apiClient.post(`/api/lessons/${lessonId}/mark_complete/`);
        if (response.course_completed) {
          setShowCompletionModal(true);
          setCourseCompletedState(true);
        }
      } catch (err) {
        console.error('Failed to save progress to server', err);
      }
    }
  };

  let prevLesson = null;
  let nextLesson = null;
  
  if (activeLesson && modules.length > 0) {
    const allLessons = modules.flatMap(m => {
      const items = [...(m.lessons || [])];
      if (m.quizzes && m.quizzes.length > 0) {
        items.push(...m.quizzes);
      }
      return items;
    });
    const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
    
    if (currentIndex > 0) prevLesson = allLessons[currentIndex - 1];
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) nextLesson = allLessons[currentIndex + 1];
  }

  const handleNavigate = (lesson) => {
    if (!lesson) return;
    selectLesson(lesson);
    setModules(prev => prev.map(mod => 
      mod.lessons?.some(l => l.id === lesson.id) 
        ? { ...mod, isOpen: true } 
        : mod
    ));
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F9F9F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  if (isCourseLocked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F9F9F9]">
        <div className="bg-orange-50 text-orange-600 p-8 rounded-lg border border-orange-200 shadow-sm max-w-md text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Course Locked</h2>
          <p className="text-slate-600 mb-6">This course is currently locked by the administrator and cannot be accessed.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-6 py-2 bg-orange-500 text-white font-medium rounded hover:bg-orange-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F9F9F9]">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-100 shadow-sm max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Course not found or access denied.'}</p>
        </div>
      </div>
    );
  }

  if (!checkingEnrollment && !isEnrolled) {
    const isFree = courseData.is_free;
    const isPaid = !courseData.is_free && courseData.price > 0;
    const isInquiry = !courseData.is_free && (!courseData.price || parseFloat(courseData.price) === 0);
    const instructorName = courseData.instructor?.user?.first_name 
      ? `${courseData.instructor.user.first_name} ${courseData.instructor.user.last_name || ''}` 
      : 'Unknown Instructor';

    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-12">
        {/* Course Header Banner */}
        <div className="bg-slate-900 text-white py-12 lg:py-16 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:w-2/3 pr-4">
              {/* Breadcrumb */}
              <nav aria-label="breadcrumb" className="mb-6">
                <ol className="flex text-sm text-slate-400 space-x-2">
                  <li><button onClick={() => navigate('/courses')} className="hover:text-white transition-colors">Courses</button></li>
                  <li><span className="mx-2">/</span></li>
                  <li className="text-white font-medium truncate">{courseData.title.substring(0, 30)}{courseData.title.length > 30 ? '...' : ''}</li>
                </ol>
              </nav>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{courseData.title}</h1>
              <div 
                className="text-lg text-slate-300 mb-8 leading-relaxed max-w-3xl line-clamp-3"
                dangerouslySetInnerHTML={{ __html: courseData.description }}
              ></div>
              
              <div className="flex flex-wrap items-center gap-6 mb-4 text-sm">
                <div className="flex items-center text-yellow-400">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <span className="text-white font-medium ml-1">4.8 <span className="text-slate-400 font-normal">(120 ratings)</span></span>
                </div>
                <div className="flex items-center text-slate-200">
                  <Users className="w-4 h-4 mr-2 text-slate-400" />
                  <span>1,245 Students</span>
                </div>
                <div className="flex items-center text-slate-200">
                  <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  <span>{courseData.difficulty || 'All Levels'}</span>
                </div>
              </div>

              <div className="flex items-center mt-6 text-sm">
                <span className="text-slate-400 mr-2">Created by</span>
                <span className="text-white font-bold border-b border-blue-500 pb-0.5 cursor-pointer hover:text-blue-400 transition-colors">
                  {instructorName}
                </span>
                {courseData.created_at && (
                  <span className="ml-6 text-slate-400 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Last updated {new Date(courseData.created_at).toLocaleDateString(undefined, {month: 'numeric', year: 'numeric'})}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Main Content Column */}
            <div className="lg:w-2/3 pb-12">
              
              {/* What you'll learn */}
              <div className="bg-white rounded-2xl p-6 md:p-8 mb-10 shadow-sm border border-slate-100">
                <h4 className="text-xl font-bold mb-6 text-slate-900">What you'll learn</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                    <span>Master the core concepts of {courseData.title.split(' ').slice(0,3).join(' ')}.</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                    <span>Build real-world projects from scratch.</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                    <span>Implement best practices and modern design patterns.</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                    <span>Gain confidence to apply for related jobs.</span>
                  </div>
                </div>
              </div>

              {/* Curriculum */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold mb-6 text-slate-900">Course Content</h3>
                <div className="flex justify-between items-center mb-4 text-slate-500 text-sm">
                  <span>{courseData.modules?.length || 0} sections • Comprehensive lectures</span>
                </div>

                {courseData.modules && courseData.modules.length > 0 ? (
                  <div className="space-y-3">
                    {courseData.modules.map((module, idx) => (
                      <div key={module.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        <button 
                          onClick={() => toggleModule(module.id)}
                          className="w-full px-6 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                          <span className="font-bold text-slate-900">{module.title}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-500 font-medium bg-white px-3 py-1 rounded-full border border-slate-200">{module.lessons?.length || 0} lectures</span>
                            {module.isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                          </div>
                        </button>
                        
                        {module.isOpen && (
                          <div className="divide-y divide-slate-100">
                            {module.lessons?.map(lesson => (
                              <div key={lesson.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  <span className="text-slate-700 font-medium">{lesson.title}</span>
                                </div>
                                {lesson.duration && <span className="text-sm text-slate-400">{lesson.duration} min</span>}
                              </div>
                            ))}
                            {module.quizzes?.map(quiz => (
                              <div key={quiz.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                  <span className="text-slate-700 font-medium">{quiz.title}</span>
                                </div>
                                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full font-medium">Quiz</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-10 text-center rounded-2xl border border-slate-200">
                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                    <h5 className="font-bold text-lg text-slate-700">Content Coming Soon</h5>
                    <p className="text-slate-500">The instructor is currently preparing the curriculum.</p>
                  </div>
                )}
              </div>

              {/* Requirements */}
              <div className="mb-8">
                <h4 className="text-xl font-bold mb-4 text-slate-900">Requirements</h4>
                <ul className="list-disc pl-5 text-slate-600 space-y-2">
                  <li>Basic understanding of the subject matter.</li>
                  <li>A computer with internet connection.</li>
                  <li>Willingness to learn and complete assignments.</li>
                </ul>
              </div>
            </div>

            {/* Sidebar / Sticky Card */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden sticky top-24 z-10">
                <div className="relative h-56 bg-slate-100">
                  <img 
                    src={getImageUrl(courseData.thumbnail || courseData.thumbnail_url)} 
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }}
                    alt={courseData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group cursor-pointer transition-colors hover:bg-black/40">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <h2 className="text-3xl font-black text-slate-900 mb-6">
                    {isFree ? 'Free' : `${courseData.currency || '$'} ${courseData.price}`}
                  </h2>

                  <div className="flex flex-col gap-3 mb-6">
                    {isEnrolled ? (
                      // Already enrolled - show green Start Learning button
                      <button 
                        onClick={() => navigate('/learner/dashboard')}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Start Learning
                      </button>
                    ) : (
                      <>
                        {isFree && (
                          <button 
                            onClick={() => isAuthenticated ? enrollUser() : navigate('/login')}
                            disabled={isEnrolling}
                            className={`w-full py-4 ${isEnrolling ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all`}
                          >
                            {isEnrolling ? 'Enrolling...' : 'Enroll Now for Free'}
                          </button>
                        )}
                        {isPaid && (
                          <button 
                            onClick={() => isAuthenticated ? setIsPaymentDrawerOpen(true) : navigate('/login')}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all"
                          >
                            Enroll in Course
                          </button>
                        )}
                        {isInquiry && (
                          <button 
                            onClick={() => isAuthenticated ? setIsInquiryDrawerOpen(true) : navigate('/login')}
                            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all"
                          >
                            Request Access
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <p className="text-center text-sm text-slate-500 mb-6">30-Day Money-Back Guarantee</p>

                  <h6 className="font-bold text-slate-900 mb-4">This course includes:</h6>
                  <ul className="space-y-3 text-sm text-slate-600 mb-8">
                    <li className="flex items-center"><svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>On-demand video</li>
                    <li className="flex items-center"><svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Downloadable resources</li>
                    <li className="flex items-center"><svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>Access on mobile and TV</li>
                    <li className="flex items-center"><svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>Full lifetime access</li>
                    <li className="flex items-center"><svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>Certificate of completion</li>
                  </ul>
                  
                  <div className="pt-6 border-t border-slate-100 flex justify-between text-sm font-medium text-slate-700">
                    <button className="hover:text-blue-600 transition-colors">Share</button>
                    <button className="hover:text-blue-600 transition-colors">Gift this course</button>
                    <button className="hover:text-blue-600 transition-colors">Apply Coupon</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <PaymentDrawer isOpen={isPaymentDrawerOpen} onClose={() => setIsPaymentDrawerOpen(false)} course={courseData} />
        <InquiryDrawer isOpen={isInquiryDrawerOpen} onClose={() => setIsInquiryDrawerOpen(false)} course={courseData} />
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'}`}>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <div className={`absolute lg:relative w-[85%] max-w-[320px] lg:w-[320px] flex-shrink-0 border-r flex flex-col h-full z-40 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${!isSidebarOpen && 'lg:hidden'} ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        
        {/* Back Button / Header */}
        <div className="h-14 flex items-center px-4 border-b border-slate-800 bg-slate-900 text-white shrink-0">
          <button 
            onClick={() => navigate('/learner/dashboard')} 
            className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded hover:bg-slate-700 transition-colors mr-3"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm truncate">{courseData?.title || 'Course Player'}</span>
        </div>

        
        {/* Tabs */}
        <div className={`flex border-b h-14 shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 font-semibold text-[13px] ${activeTab === 'outline' ? 'text-[#2563eb] border-b-2 border-[#2563eb]' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setActiveTab('outline')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Course Outline
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 font-semibold text-[13px] ${activeTab === 'resources' ? 'text-[#2563eb] border-b-2 border-[#2563eb]' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setActiveTab('resources')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            Resources
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'outline' && (
            <>
              {/* Search Bar */}
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search course outline" 
                    className="w-full border border-slate-200 rounded text-sm py-2 pl-3 pr-8 focus:outline-none focus:border-[#2563eb]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
                
                {/* Overall Progress */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#3b82f6] transition-all duration-500 ease-in-out" 
                      style={{ width: `${modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) === 0 ? 0 : Math.round((completedLessons.length / modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0)) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) === 0 ? 0 : Math.round((completedLessons.length / modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0)) * 100)}%
                  </span>
                </div>
              </div>

              {/* Modules List */}
              <div className="flex flex-col pb-8">
                {modules.map(module => (
                  <div key={module.id} className="border-b border-slate-100">
                    {/* Module Header */}
                    <div 
                      className={`p-4 cursor-pointer flex flex-col gap-3 transition-colors ${module.isOpen ? 'bg-[#f0f9ff]' : 'hover:bg-slate-50'}`}
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-[13px] leading-snug text-slate-800">
                          {module.title}
                        </h3>
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${module.isOpen ? 'bg-[#3b82f6] text-white' : 'bg-[#eff6ff] text-[#2563eb]'}`}>
                          {module.isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                      
                      {/* Module Progress */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#3b82f6] transition-all duration-500 ease-in-out" 
                            style={{ width: `${(module.lessons?.length || 0) === 0 ? 0 : Math.round(((module.lessons?.filter(l => completedLessons.includes(l.id)).length || 0) / (module.lessons?.length || 0)) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 w-6 text-right">
                          {(module.lessons?.length || 0) === 0 ? 0 : Math.round(((module.lessons?.filter(l => completedLessons.includes(l.id)).length || 0) / (module.lessons?.length || 0)) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Module Lessons */}
                    {module.isOpen && module.lessons?.length > 0 && (
                      <div className="bg-white">
                        {module.lessons.map((lesson, idx) => {
                          const isActive = activeLesson?.id === lesson.id;
                          return (
                            <div 
                              key={lesson.id} 
                              onClick={() => selectLesson(lesson)}
                              className={`px-4 py-3 flex items-start gap-3 border-l-4 cursor-pointer ${isActive ? 'border-[#3b82f6] bg-[#eff6ff]' : 'border-transparent hover:bg-slate-50'}`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {completedLessons.includes(lesson.id) ? (
                                  <CheckCircle className="w-[18px] h-[18px] text-[#3b82f6]" />
                                ) : (
                                  <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300"></div>
                                )}
                              </div>
                              <div className="flex-1 flex justify-between gap-4">
                                <p className="text-[13px] font-medium text-slate-800 leading-snug">
                                  {lesson.title}
                                </p>
                                <span className="text-[11px] font-semibold text-slate-400 shrink-0 whitespace-nowrap mt-0.5">
                                  {idx + 1} / {module.lessons.length}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                        {module.quizzes?.map((quiz, idx) => {
                          const isActive = activeLesson?.id === quiz.id && activeLesson?.max_attempts !== undefined;
                          return (
                            <div 
                              key={`quiz-${quiz.id}`} 
                              onClick={() => selectLesson(quiz)}
                              className={`px-4 py-3 flex items-start gap-3 border-l-4 cursor-pointer ${isActive ? 'border-orange-500 bg-orange-50' : 'border-transparent hover:bg-slate-50'}`}
                            >
                              <div className="mt-0.5 shrink-0 text-orange-500">
                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              <div className="flex-1 flex justify-between gap-4">
                                <p className="text-[13px] font-medium text-slate-800 leading-snug">
                                  {quiz.title}
                                </p>
                                {quiz.is_locked && !isAdmin && (
                                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    
                    {module.isOpen && (!module.lessons || module.lessons.length === 0) && (
                       <div className="px-4 py-3 text-xs text-slate-400 italic">No lessons in this module.</div>
                    )}
                  </div>
                ))}
                
                {modules.length === 0 && (
                   <div className="p-4 text-sm text-slate-500">No modules available for this course yet.</div>
                )}
                
                {courseData?.exams?.length > 0 && (
                  <div className="border-t-4 border-slate-200 mt-4">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="font-bold text-[13px] text-slate-800 uppercase tracking-wider">Final Exams</h3>
                    </div>
                    <div className="bg-white">
                      {courseData.exams.map((exam, idx) => {
                        const isActive = activeLesson?.id === exam.id && activeLesson?.max_attempts !== undefined;
                        return (
                          <div 
                            key={`exam-${exam.id}`} 
                            onClick={() => selectLesson(exam)}
                            className={`px-4 py-3 flex items-start gap-3 border-l-4 cursor-pointer ${isActive ? 'border-red-500 bg-red-50' : 'border-transparent hover:bg-slate-50'}`}
                          >
                            <div className="mt-0.5 shrink-0 text-red-500">
                              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <div className="flex-1 flex justify-between gap-4">
                              <p className="text-[13px] font-medium text-slate-800 leading-snug">
                                {exam.title}
                              </p>
                              {exam.is_locked && !isAdmin && (
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'resources' && (
            <div className="flex flex-col pb-8 p-4">
              <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Course Resources</h3>
              {courseData?.resources && courseData.resources.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {courseData.resources.map(res => (
                    <a 
                      key={res.id} 
                      href={res.file ? (res.file.startsWith('http') ? res.file : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${res.file}`) : "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      download
                      className={`flex items-center gap-3 p-3 border rounded transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="bg-[#eff6ff] text-[#2563eb] p-2 rounded">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <span className={`text-sm font-medium truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{res.title}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className={`text-sm italic p-4 rounded border ${isDarkMode ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-500 bg-slate-50 border-slate-100'}`}>
                  No resource is available for this course.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={`flex-1 flex flex-col h-full relative z-10 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-[#F9F9F9]'}`}>
        
        {/* Top Header */}
        <div className={`h-14 border-b flex items-center justify-between px-4 shrink-0 shadow-sm z-20 relative ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 max-w-[70%]">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-medium text-slate-600 truncate">
              {activeLesson ? activeLesson.title : courseData.title}
            </h2>
          </div>
          <div className={`flex items-center gap-2 sm:gap-4 shrink-0 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100'}`}><Moon className="w-[18px] h-[18px] fill-current" /></button>
            <div className={`hidden sm:block w-px h-4 mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
            <button className={`hidden sm:block p-1.5 rounded-full ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100'}`}><Search className="w-[18px] h-[18px]" /></button>
            <div className="relative">
              <button onClick={toggleTranslator} className={`hidden sm:flex p-1.5 rounded items-center gap-1.5 text-xs font-bold uppercase ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100'}`}>
                <Languages className="w-[18px] h-[18px]" /> EN
              </button>
              <div id="google_translate_element" className="absolute top-10 right-0 z-50 bg-white p-2 shadow rounded min-w-[150px]" style={{ display: isTranslatorOpen ? 'block' : 'none' }}></div>
            </div>
            <button onClick={toggleSpeech} className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100'}`}><Accessibility className="w-[18px] h-[18px]" /></button>
            <button onClick={toggleFullScreen} className={`p-1.5 rounded-full ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100'}`}><Maximize className="w-[18px] h-[18px]" /></button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto relative">
          
          {activeLesson ? (
            <>
              {/* Floating Nav Arrows */}
              {prevLesson && (
                <button 
                  onClick={() => handleNavigate(prevLesson)}
                  className={`fixed ${isSidebarOpen ? 'left-[85%] sm:left-[320px] lg:left-[320px]' : 'left-0'} top-1/2 -translate-y-1/2 w-8 h-12 bg-white border border-[#3b82f6] border-l-0 rounded-r shadow-sm flex items-center justify-center text-[#3b82f6] z-30 hover:bg-[#f0f9ff] transition-all cursor-pointer`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {nextLesson && (
                <button 
                  onClick={() => handleNavigate(nextLesson)}
                  className="fixed right-0 top-1/2 -translate-y-1/2 w-8 h-12 bg-white border border-[#3b82f6] border-r-0 rounded-l shadow-sm flex items-center justify-center text-[#3b82f6] z-30 hover:bg-[#f0f9ff] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Media Section (Video or Cover) */}
              {activeLesson.max_attempts !== undefined ? (
                <div className="relative w-full bg-slate-900 flex flex-col justify-center items-center min-h-[400px]">
                  <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
                  </div>
                  <div className="relative z-10 p-8 sm:p-12 max-w-4xl w-full text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-full mb-6">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
                      {activeLesson.title}
                    </h1>
                    <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">{activeLesson.description || 'Test your knowledge with this quiz.'}</p>
                    
                    {activeLesson.is_locked && !isAdmin ? (
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-300 rounded-full font-semibold border border-red-500/30">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        This Quiz is Locked
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-white/90 text-sm font-medium animate-bounce mt-8">
                        Scroll to begin <ArrowDown className="w-4 h-4 bg-white/20 rounded-full p-0.5" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative w-full bg-black flex flex-col justify-center items-center min-h-[400px]">
                   {activeLesson.video_file ? (
                     (() => {
                       const videoInfo = getVideoUrl(activeLesson.video_file);
                       if (videoInfo?.isEmbed) {
                         return (
                           <div className="w-full h-full max-h-[70vh] aspect-video">
                             <iframe
                               src={videoInfo.url}
                               className="w-full h-full"
                               allowFullScreen
                               allow="autoplay"
                               title={activeLesson.title}
                               style={{ border: 'none' }}
                             ></iframe>
                           </div>
                         );
                       }
                       return (
                         <div className="w-full h-full max-h-[70vh] aspect-video flex items-center justify-center bg-black">
                           <video
                             src={videoInfo?.url}
                             controls
                             controlsList="nodownload"
                             className="w-full h-full max-h-[70vh]"
                           ></video>
                         </div>
                       );
                     })()
                   ) : activeLesson.video_url || activeLesson.embed_url ? (
                     <div className="w-full h-full max-h-[70vh] aspect-video">
                       <iframe 
                         src={activeLesson.embed_url || getEmbedUrl(activeLesson.video_url)} 
                         className="w-full h-full"
                         allowFullScreen
                         title={activeLesson.title}
                         style={{ border: 'none' }}
                       ></iframe>
                     </div>
                   ) : (
                    <>
                      {/* Fallback Hero Image for text lessons */}
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={getImageUrl(courseData.thumbnail || courseData.thumbnail_url)} 
                          alt={courseData.title} 
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
                      </div>
                      
                      <div className="relative z-10 p-8 sm:p-12 max-w-4xl w-full">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-8 tracking-tight">
                          {activeLesson.title}
                        </h1>
                        <div className="flex items-center gap-2 text-white/90 text-sm font-medium animate-bounce mt-16">
                          Scroll to begin <ArrowDown className="w-4 h-4 bg-white/20 rounded-full p-0.5" />
                        </div>
                      </div>
                    </>
                   )}
                </div>
              )}

              {/* Text Content */}
              {activeLesson.max_attempts !== undefined ? (
                <div className={`max-w-4xl mx-auto px-8 sm:px-12 py-16 min-h-[50vh] ${isDarkMode ? 'bg-slate-800' : 'bg-[#F9F9F9]'}`}>
                  {activeLesson.is_locked && !isAdmin ? (
                    <div className="bg-red-50 text-red-600 p-8 rounded-xl border border-red-100 text-center shadow-sm">
                      <h3 className="text-xl font-bold mb-2">Access Denied</h3>
                      <p>This quiz is currently locked by the administrator. Please complete the preceding lessons or wait for it to be unlocked.</p>
                    </div>
                  ) : (
                    <>
                      {activeLesson.question && (
                        <div className="mb-10 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                          <h3 className="text-lg font-bold text-slate-800 mb-3">Quiz Instructions</h3>
                          <p className="text-slate-600">{activeLesson.question}</p>
                        </div>
                      )}
                      
                      {activeLesson.questions && activeLesson.questions.length > 0 ? (
                        quizResult ? (
                          <div className="bg-white p-12 rounded-xl shadow-lg border border-slate-200 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                            <div className="w-24 h-24 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
                              {quizResult.passed ? (
                                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              )}
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">
                              {quizResult.passed ? "Congratulations!" : "Quiz Completed"}
                            </h2>
                            <p className="text-lg text-slate-600 mb-8">
                              You scored <span className="font-bold text-slate-900">{quizResult.score}</span> out of <span className="font-bold text-slate-900">{quizResult.total_marks}</span> marks.
                            </p>
                            
                            <div className="flex justify-center gap-4">
                              <button 
                                onClick={() => { setQuizAnswers({}); setQuizResult(null); setQuizStarted(true); }}
                                className="px-6 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                              >
                                Try Again
                              </button>
                              {nextLesson ? (
                                <button 
                                  onClick={() => handleNavigate(nextLesson)}
                                  className="px-6 py-3 bg-[#0A66C2] text-white font-bold rounded-xl hover:bg-[#004182] transition-colors shadow-md flex items-center gap-2"
                                >
                                  Next Lesson <ChevronRight className="w-5 h-5" />
                                </button>
                              ) : (
                                <div className="px-6 py-3 bg-[#A3E4A3] text-white font-bold rounded-xl flex items-center gap-2 shadow-sm">
                                  Course Completed <CheckCircle className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          !quizStarted ? (
                            <div className="bg-white p-12 rounded-xl shadow-lg border border-slate-200 text-center max-w-2xl mx-auto">
                              <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Ready to begin?</h2>
                              
                              <div className="bg-slate-50 rounded-lg p-6 mb-8 text-left border border-slate-100 flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-800">Allowed Attempts</h4>
                                    <p className="text-slate-600">{activeLesson.max_attempts} attempt(s)</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded bg-green-100 text-green-600 flex items-center justify-center font-bold">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-800">Passing Score</h4>
                                    <p className="text-slate-600">{activeLesson.pass_mark || 70}% required to pass</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md mx-auto mt-6">
                                {nextLesson && (
                                  <button 
                                    onClick={() => handleNavigate(nextLesson)}
                                    className="px-8 py-4 bg-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-300 transition-all text-lg flex items-center justify-center gap-2 flex-1"
                                  >
                                    Skip Quiz <ChevronRight className="w-5 h-5" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => setQuizStarted(true)}
                                  className="px-8 py-4 bg-[#2563eb] text-white font-bold rounded-xl shadow-md hover:bg-[#1d4ed8] transition-all text-lg flex items-center justify-center gap-2 flex-1"
                                >
                                  Start Quiz <ChevronRight className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-8">
                              {activeLesson.questions.map((q, i) => (
                                <div key={q.id} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                                  <h4 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-start">
                                    <span><span className="text-[#2563eb] mr-2">Question {i + 1}.</span> {q.question_text}</span>
                                    <span className="text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full whitespace-nowrap">{q.marks || 1} Mark(s)</span>
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {['A', 'B', 'C', 'D'].map(opt => (
                                      <label key={opt} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors group ${quizAnswers[q.id] === opt ? 'border-[#3b82f6] bg-[#f0f9ff]' : 'border-slate-200 hover:bg-slate-50'}`}>
                                        <input 
                                          type="radio" 
                                          name={`question-${q.id}`} 
                                          value={opt} 
                                          checked={quizAnswers[q.id] === opt}
                                          onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                          className="mt-1 w-4 h-4 text-[#3b82f6] border-slate-300 focus:ring-[#3b82f6]" 
                                        />
                                        <span className={`font-medium ${quizAnswers[q.id] === opt ? 'text-[#2563eb]' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                          {q[`option_${opt.toLowerCase()}`]}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              <div className="mt-8 flex justify-end">
                                <button 
                                  onClick={handleQuizSubmit}
                                  disabled={submittingQuiz || Object.keys(quizAnswers).length === 0}
                                  className="px-8 py-4 bg-[#2563eb] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow hover:bg-[#1d4ed8] transition-colors flex items-center gap-2"
                                >
                                  {submittingQuiz ? "Submitting..." : "Submit Quiz"}
                                </button>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div className="text-center text-slate-500 italic p-12 bg-white rounded-xl border border-slate-100">
                          No questions have been added to this quiz yet.
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <>
                  {activeLesson.content && (
                    <div className={`max-w-4xl mx-auto px-8 sm:px-12 py-16 min-h-[50vh] ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-[#F9F9F9] text-slate-900'}`}>
                      <h2 className={`text-3xl font-extrabold mb-8 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        {activeLesson.title}
                      </h2>
                      <div className="prose-container">
                        <style>{`
                          .prose-container iframe, .prose-container video {
                            width: 100%;
                            max-width: 100%;
                            aspect-ratio: 16 / 9;
                            border-radius: 0.5rem;
                            margin: 2rem 0;
                          }
                          /* PrismJS Overrides to match UI */
                          .prose-container pre[class*="language-"] {
                            background: #282c34 !important;
                            border-radius: 0.5rem !important;
                            padding: 1.5em !important;
                            margin: 1.5em 0 !important;
                            font-size: 0.9em;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                          }
                          .prose-container .line-numbers .line-numbers-rows {
                            border-right: 1px solid #4b5563 !important;
                            padding-right: 10px !important;
                          }
                          .prose-container code[class*="language-"], 
                          .prose-container pre[class*="language-"] {
                            text-shadow: none !important;
                            font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace !important;
                          }
                        `}</style>
                        <div 
                          className={`prose max-w-none text-[15px] leading-relaxed ${isDarkMode ? 'prose-invert text-slate-300' : 'prose-slate text-slate-800'}`}
                          dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {!activeLesson.content && !activeLesson.video_url && (
                    <div className="max-w-4xl mx-auto px-12 py-16 text-center text-slate-500">
                      No content provided for this lesson yet.
                    </div>
                  )}
                </>
              )}
              
              {/* Bottom Navigation */}
              <div className="max-w-4xl mx-auto px-8 sm:px-12 py-8 flex items-center justify-between border-t border-slate-200 mt-8 mb-16">
                {prevLesson ? (
                  <button 
                    onClick={() => handleNavigate(prevLesson)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous Lesson
                  </button>
                ) : <div></div>}

                {nextLesson && (
                  <button 
                    onClick={() => {
                      markLessonComplete(activeLesson.id);
                      handleNavigate(nextLesson);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white rounded-lg font-semibold hover:bg-[#2563eb] transition-colors shadow-sm"
                  >
                    Complete & Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                {!nextLesson && (
                  <>
                    {courseCompletedState ? (
                      <button 
                        onClick={() => navigate('/learner/dashboard', { state: { tab: 'certificates' } })}
                        className="flex items-center gap-2 px-6 py-3 bg-[#10b981] text-white rounded-lg font-semibold hover:bg-[#059669] transition-colors shadow-sm"
                      >
                        View Certificate
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => markLessonComplete(activeLesson.id)}
                        disabled={completedLessons.includes(activeLesson?.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white rounded-lg font-semibold hover:bg-[#2563eb] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {completedLessons.includes(activeLesson?.id) ? 'Course Completed' : 'Finish Course'}
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-lg p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to {courseData.title}</h2>
                <p className="text-slate-600 mb-6">{courseData.description}</p>
                <p className="text-sm text-slate-500 font-medium bg-slate-100 p-4 rounded-lg">
                  Please select a module and lesson from the outline on the left to begin learning.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Course Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center animate-bounce-in relative">
            <button 
              onClick={() => setShowCompletionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Congratulations!</h2>
            <p className="text-lg text-slate-600 mb-8">
              You have successfully completed all lessons and passed all quizzes for <strong>{courseData?.title}</strong>!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/learner/dashboard', { state: { tab: 'certificates' } })}
                className="px-6 py-3 bg-[#2563eb] text-white font-bold rounded-xl shadow-md hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2"
              >
                View Certificate in Dashboard
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePlayer;
