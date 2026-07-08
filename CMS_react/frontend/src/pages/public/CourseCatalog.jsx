import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../api/apiClient';
import { Search, Filter, Play, Building2, BookOpen, Clock, MoreVertical } from 'lucide-react';
import image3 from '../../assets/image3.png';

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
    <div className="min-h-[calc(100vh-64px)] bg-[#030712] font-['Work_Sans',sans-serif] relative pb-20">
      
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ backgroundImage: `url(${image3})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}
      ></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
              <h2 className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">Academy</h2>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Course Catalog</h1>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                className="block w-full pl-10 pr-4 py-3 bg-[#111827] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="hidden sm:flex items-center bg-[#111827] border border-white/10 px-6 py-3 rounded-lg hover:bg-white/5 transition-colors text-sm font-bold text-white shrink-0">
              <Filter className="h-4 w-4 mr-2 text-[#D4AF37]" /> Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/20 mb-8 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : displayCourses.length === 0 ? (
          <div className="text-center py-20 bg-[#111827] rounded-xl border border-white/10">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No courses available yet</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Please wait while our instructors are preparing amazing courses for you. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayCourses.map(course => (
              <Link to={`/course/${course.id}`} key={course.id} className="block group">
                <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden flex flex-col h-full hover:border-[#D4AF37]/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-all duration-300">
                  
                  {/* Image Header */}
                  <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                    <img 
                      src={getImageUrl(course.thumbnail)} 
                      alt={course.title} 
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" }}
                      className="w-full h-full object-cover group-hover:scale-105 opacity-80 group-hover:opacity-100 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-full shadow-lg">
                      {course.level || 'BEGINNER'}
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 rounded-full border-2 border-[#D4AF37] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <Play className="w-6 h-6 text-[#D4AF37] ml-1 fill-[#D4AF37]" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Organization / Instructor */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 font-medium uppercase tracking-wider">
                      <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{course.instructor_name || 'TRUSTERLABS Ltd.'}</span>
                    </div>
                    
                    {/* Titles */}
                    <h3 className="text-lg font-bold text-white leading-snug mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-[#D4AF37] mb-4">
                      {course.subtitle || course.title}
                    </p>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed flex-grow">
                      {course.description ? course.description.replace(/<[^>]+>/g, '') : ''}
                    </p>
                    
                    {/* Footer Stats */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500 font-medium mt-auto">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                        <span>Instructor-led</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#D4AF37]" />
                        <span>{course.dateRange || 'Self-paced'}</span>
                      </div>
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
