import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient, getImageUrl } from '../../api/apiClient';
import { 
  Menu, Search, Moon, Languages, Accessibility, Maximize, 
  ChevronDown, ChevronUp, CheckCircle, ChevronLeft, ChevronRight,
  ArrowDown
} from 'lucide-react';
import PaymentDrawer from '../../components/courses/PaymentDrawer';
import InquiryDrawer from '../../components/courses/InquiryDrawer';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [activeTab, setActiveTab] = useState('outline');
  const [modules, setModules] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [completedLessons, setCompletedLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);

  useEffect(() => {
    if (courseId) {
      const stored = localStorage.getItem(`course_progress_${courseId}`);
      if (stored) {
        try {
          setCompletedLessons(JSON.parse(stored));
        } catch(e) {}
      }
      fetchCourseDetails();
      checkEnrollment();
    }
  }, [courseId]);

  const checkEnrollment = async () => {
    try {
      const token = localStorage.getItem('truster_lab_token');
      if (!token) {
        setIsEnrolled(false);
        setCheckingEnrollment(false);
        return;
      }
      const data = await apiClient.get('/api/enrollments/');
      const enrollments = data.results || data || [];
      const enrolled = enrollments.some(e => 
        (e.course_details?.id === parseInt(courseId) || e.course === parseInt(courseId)) 
        && e.status === 'active'
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
      setLoading(true);
      const response = await apiClient.post(`/api/courses/${courseId}/enroll/`);
      if (response.enrollment_status === 'active') {
        setIsEnrolled(true);
      } else {
        alert('Your request is pending approval.');
      }
    } catch(err) {
      console.error(err);
      let errorMsg = 'Failed to enroll or prerequisite not met.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) errorMsg = parsed.error;
        if (parsed.message) errorMsg = parsed.message;
      } catch (e) {
        if (err.message) errorMsg = err.message;
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      // Fetch the specific course by ID. The serializer includes nested modules and lessons.
      const data = await apiClient.get(`/api/courses/${courseId}/`);
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
          setActiveLesson(initializedModules[0].lessons[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load course content.');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setModules(modules.map(mod => 
      mod.id === moduleId ? { ...mod, isOpen: !mod.isOpen } : mod
    ));
  };

  const selectLesson = (lesson) => {
    setActiveLesson(lesson);
  };

  const markLessonComplete = (lessonId) => {
    setCompletedLessons(prev => {
      if (prev.includes(lessonId)) return prev;
      const updated = [...prev, lessonId];
      localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(updated));
      return updated;
    });
  };

  let prevLesson = null;
  let nextLesson = null;
  
  if (activeLesson && modules.length > 0) {
    const allLessons = modules.flatMap(m => m.lessons || []);
    const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
    
    if (currentIndex > 0) prevLesson = allLessons[currentIndex - 1];
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) nextLesson = allLessons[currentIndex + 1];
  }

  const handleNavigate = (lesson) => {
    if (!lesson) return;
    setActiveLesson(lesson);
    setModules(prev => prev.map(mod => 
      mod.lessons?.some(l => l.id === lesson.id) 
        ? { ...mod, isOpen: true } 
        : mod
    ));
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F9F9F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5CC85C]"></div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F9F9F9]">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-100 shadow-sm max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Course not found'}</p>
        </div>
      </div>
    );
  }

  if (!checkingEnrollment && !isEnrolled) {
    const isFree = courseData.is_free;
    const isPaid = !courseData.is_free && courseData.price > 0;
    const isInquiry = !courseData.is_free && (!courseData.price || parseFloat(courseData.price) === 0);

    return (
      <div className="min-h-screen bg-[#F4F5F7] py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
        <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 relative bg-slate-100">
            <img 
              src={getImageUrl(courseData.thumbnail)} 
              onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" }}
              alt={courseData.title}
              className="w-full h-full object-cover min-h-[300px]"
            />
          </div>
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl font-black text-slate-900 mb-4 leading-tight">{courseData.title}</h1>
            <div 
              className="text-slate-600 mb-8 leading-relaxed line-clamp-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: courseData.description }}
            ></div>
            
            <div className="mt-auto pt-4">
              {isFree && (
                <button 
                  onClick={() => isAuthenticated ? enrollUser() : navigate('/login')}
                  className="w-full py-4 bg-[#3E8E41] hover:bg-[#317033] text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all"
                >
                  Enroll Now for Free
                </button>
              )}
              {isPaid && (
                <button 
                  onClick={() => isAuthenticated ? setIsPaymentDrawerOpen(true) : navigate('/login')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all"
                >
                  Purchase Course - ${courseData.price}
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
            </div>
          </div>
        </div>
        
        <PaymentDrawer isOpen={isPaymentDrawerOpen} onClose={() => setIsPaymentDrawerOpen(false)} course={courseData} />
        <InquiryDrawer isOpen={isInquiryDrawerOpen} onClose={() => setIsInquiryDrawerOpen(false)} course={courseData} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white font-sans overflow-hidden text-slate-800">
      
      {/* LEFT SIDEBAR */}
      <div className="w-[320px] flex-shrink-0 border-r border-slate-200 flex flex-col h-full bg-white relative z-20">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 h-14 shrink-0">
          <button 
            className={`flex-1 flex items-center justify-center gap-2 font-semibold text-[13px] ${activeTab === 'outline' ? 'text-[#3E8E41] border-b-2 border-[#3E8E41]' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setActiveTab('outline')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Course Outline
          </button>
          <button 
            className={`flex-1 flex items-center justify-center gap-2 font-semibold text-[13px] ${activeTab === 'resources' ? 'text-[#3E8E41] border-b-2 border-[#3E8E41]' : 'text-slate-600 hover:text-slate-900'}`}
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
                    className="w-full border border-slate-200 rounded text-sm py-2 pl-3 pr-8 focus:outline-none focus:border-[#3E8E41]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
                
                {/* Overall Progress */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#5CC85C] transition-all duration-500 ease-in-out" 
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
                      className={`p-4 cursor-pointer flex flex-col gap-3 transition-colors ${module.isOpen ? 'bg-[#F2FAF2]' : 'hover:bg-slate-50'}`}
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-[13px] leading-snug text-slate-800">
                          {module.title}
                        </h3>
                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${module.isOpen ? 'bg-[#5CC85C] text-white' : 'bg-[#EBF7EB] text-[#3E8E41]'}`}>
                          {module.isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                      
                      {/* Module Progress */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#5CC85C] transition-all duration-500 ease-in-out" 
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
                              className={`px-4 py-3 flex items-start gap-3 border-l-4 cursor-pointer ${isActive ? 'border-[#5CC85C] bg-[#EBF7EB]' : 'border-transparent hover:bg-slate-50'}`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {completedLessons.includes(lesson.id) ? (
                                  <CheckCircle className="w-[18px] h-[18px] text-[#5CC85C]" />
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
              </div>
            </>
          )}

          {activeTab === 'resources' && (
            <div className="flex flex-col pb-8 p-4">
              <h3 className="font-bold text-slate-800 mb-4">Course Resources</h3>
              {courseData?.resources && courseData.resources.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {courseData.resources.map(res => (
                    <a 
                      key={res.id} 
                      href={res.file ? (res.file.startsWith('http') ? res.file : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${res.file}`) : "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                    >
                      <div className="bg-[#EBF7EB] text-[#3E8E41] p-2 rounded">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <span className="text-sm font-medium text-slate-700 truncate">{res.title}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded border border-slate-100">No resources have been uploaded for this course yet.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full bg-[#F9F9F9] relative z-10 overflow-hidden">
        
        {/* Top Header */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3 max-w-[70%]">
            <button className="p-1 hover:bg-slate-100 rounded text-slate-600 shrink-0">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-medium text-slate-600 truncate">
              {activeLesson ? activeLesson.title : courseData.title}
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-slate-600 shrink-0">
            <button className="p-1.5 hover:bg-slate-100 rounded-full"><Moon className="w-[18px] h-[18px] fill-current" /></button>
            <div className="hidden sm:block w-px h-4 bg-slate-300 mx-1"></div>
            <button className="hidden sm:block p-1.5 hover:bg-slate-100 rounded-full"><Search className="w-[18px] h-[18px]" /></button>
            <button className="hidden sm:flex p-1.5 hover:bg-slate-100 rounded items-center gap-1.5 text-xs font-bold uppercase">
              <Languages className="w-[18px] h-[18px]" /> EN
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded-full"><Accessibility className="w-[18px] h-[18px]" /></button>
            <button className="p-1.5 hover:bg-slate-100 rounded-full"><Maximize className="w-[18px] h-[18px]" /></button>
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
                  className="fixed left-[320px] top-1/2 -translate-y-1/2 w-8 h-12 bg-white border border-[#5CC85C] border-l-0 rounded-r shadow-sm flex items-center justify-center text-[#5CC85C] z-30 hover:bg-[#F2FAF2] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {nextLesson && (
                <button 
                  onClick={() => handleNavigate(nextLesson)}
                  className="fixed right-0 top-1/2 -translate-y-1/2 w-8 h-12 bg-white border border-[#5CC85C] border-r-0 rounded-l shadow-sm flex items-center justify-center text-[#5CC85C] z-30 hover:bg-[#F2FAF2] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Media Section (Video or Cover) */}
              <div className="relative w-full bg-black flex flex-col justify-center items-center min-h-[400px]">
                 {activeLesson.video_file ? (
                   <div className="w-full h-full max-h-[70vh] aspect-video flex items-center justify-center bg-black">
                     <video 
                       src={getImageUrl(activeLesson.video_file)} 
                       controls
                       controlsList="nodownload"
                       className="w-full h-full max-h-[70vh]"
                     ></video>
                   </div>
                 ) : activeLesson.video_url || activeLesson.embed_url ? (
                   <div className="w-full h-full max-h-[70vh] aspect-video">
                     <iframe 
                       src={activeLesson.embed_url || activeLesson.video_url} 
                       className="w-full h-full"
                       allowFullScreen
                       title={activeLesson.title}
                     ></iframe>
                   </div>
                 ) : (
                  <>
                    {/* Fallback Hero Image for text lessons */}
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={getImageUrl(courseData.thumbnail)} 
                        alt="Lesson Cover" 
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

              {/* Text Content */}
              {activeLesson.content && (
                <div className="max-w-4xl mx-auto px-8 sm:px-12 py-16 bg-[#F9F9F9] min-h-[50vh]">
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-8">
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
                    `}</style>
                    <div 
                      className="prose prose-slate max-w-none text-slate-800 text-[15px] leading-relaxed"
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
                    className="flex items-center gap-2 px-6 py-3 bg-[#5CC85C] text-white rounded-lg font-semibold hover:bg-[#4BB64B] transition-colors shadow-sm"
                  >
                    Complete & Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                {!nextLesson && (
                  <button 
                    onClick={() => markLessonComplete(activeLesson.id)}
                    disabled={completedLessons.includes(activeLesson?.id)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#5CC85C] text-white rounded-lg font-semibold hover:bg-[#4BB64B] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {completedLessons.includes(activeLesson?.id) ? 'Course Completed' : 'Finish Course'}
                    <CheckCircle className="w-5 h-5" />
                  </button>
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
    </div>
  );
};

export default CoursePlayer;
