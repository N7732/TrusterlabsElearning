import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../api/apiClient';
import { Play, Building2, BookOpen, Clock } from 'lucide-react';

const LearnerDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/api/enrollments/');
      setEnrollments(data.results || data || []);
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
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">My Learning</h1>
          <p className="text-slate-600 mt-2">Pick up where you left off or start something new.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-100 mb-8 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#77C159]"></div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-slate-200">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">You haven't enrolled in any courses yet</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Browse our catalog to find a course that interests you.
            </p>
            <Link to="/courses" className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#77C159] hover:bg-[#68AA4E]">
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrollments.map(enrollment => {
              const course = enrollment.course_details;
              if (!course) return null;
              
              const isPending = enrollment.status === 'pending';
              
              return (
                <Link to={isPending ? '#' : `/course/${course.id}`} key={enrollment.id} className="block group">
                  <div className={`bg-[#F8F9FA] border border-slate-200 rounded-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow relative border-b-2 ${isPending ? 'border-b-amber-500' : 'border-b-[#77C159]'}`}>
                    
                    <div className="relative h-44 w-full bg-slate-300 overflow-hidden">
                      <img 
                        src={getImageUrl(course.thumbnail)} 
                        alt={course.title} 
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/20"></div>
                      
                      <div className={`absolute top-3 left-3 text-slate-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm ${isPending ? 'bg-amber-500' : 'bg-[#77C159]'}`}>
                        {isPending ? 'PENDING APPROVAL' : 'ENROLLED'}
                      </div>
  
                      {!isPending && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                            <Play className="w-5 h-5 text-white ml-1 fill-white" />
                          </div>
                        </div>
                      )}
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
                          <div className="bg-[#77C159] h-1.5 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
  
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerDashboard;
