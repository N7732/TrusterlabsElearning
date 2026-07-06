import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../api/apiClient';
import { Search, Filter, Play, Building2, BookOpen, Clock, MoreVertical } from 'lucide-react';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/api/courses/');
      setCourses(data.results || data || []);
    } catch (err) {
      setError('Failed to load courses. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredCourses = courses.filter(course => {
    const titleMatch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const instructorName = course.instructor_name || course.instructor?.name || '';
    const instructorMatch = instructorName.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || instructorMatch;
  });

  const displayCourses = filteredCourses;

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Course Catalog</h1>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#77C159] sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="hidden sm:flex items-center bg-white border border-slate-200 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 shrink-0">
              <Filter className="h-4 w-4 mr-2 text-slate-500" /> Filters
            </button>
          </div>
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
        ) : displayCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-slate-200">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">No courses available yet</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Please wait while our instructors are preparing amazing courses for you. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayCourses.map(course => (
              <Link to={`/course/${course.id}`} key={course.id} className="block group">
                <div className="bg-[#F8F9FA] border border-slate-200 rounded-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow relative border-b-2 border-b-[#77C159]">
                  
                  {/* Image Header */}
                  <div className="relative h-44 w-full bg-slate-300 overflow-hidden">
                    <img 
                      src={getImageUrl(course.thumbnail)} 
                      alt={course.title} 
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-[#77C159] text-slate-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                      {course.level || 'BEGINNER'}
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/20 backdrop-blur-sm">
                        <Play className="w-5 h-5 text-white ml-1 fill-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Body */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* Organization / Instructor */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{course.instructor_name || 'TRUSTERLABS Ltd.'}</span>
                    </div>

                    {/* Format and Menu */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{course.format || 'Course | Instructor-led'}</span>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Titles */}
                    <h3 className="text-[15px] font-bold text-slate-900 leading-snug mb-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      {course.subtitle || course.title}
                    </p>
                    
                    {/* Description */}
                    <p className="text-[13px] text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {course.description ? course.description.replace(/<[^>]+>/g, '') : ''}
                    </p>
                    
                    {/* Footer Date */}
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{course.dateRange || 'Self-paced'}</span>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default CourseCatalog;
