import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Shield, BookOpen, LogOut, ChevronLeft,
  ChevronDown, Layers, List, HelpCircle, MessageSquare, Calendar, FileText
} from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';
import logoImg from '../assets/image2.jpeg';
import { useAuth } from '../context/AuthContext';

const InstructorLayout = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({
    courseManagement: true,
    accessInquiries: false,
    trainingAcademy: false,
  });

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const courseManagementItems = [
    { path: '/instructor/entity/courses', label: 'My Courses', icon: <BookOpen size={18} /> },
    { path: '/instructor/entity/modules', label: 'Modules', icon: <Layers size={18} /> },
    { path: '/instructor/entity/lessons', label: 'Lessons', icon: <List size={18} /> },
    { path: '/instructor/entity/quizzes', label: 'Quizzes', icon: <HelpCircle size={18} /> },
    { path: '/instructor/entity/quiz_questions', label: 'Quiz Questions', icon: <HelpCircle size={18} /> },
  ];

  const accessInquiriesItems = [
    { path: '/instructor/entity/enrollments', label: 'Enrollments', icon: <Users size={18} /> },
    { path: '/instructor/entity/enquiries', label: 'Course Enquiries', icon: <MessageSquare size={18} /> },
  ];

  const trainingItems = [
    { path: '/instructor/entity/trainings', label: 'My Trainings', icon: <Calendar size={18} /> },
    { path: '/instructor/entity/classwork', label: 'Classwork', icon: <FileText size={18} /> },
    { path: '/instructor/entity/exams', label: 'Exams', icon: <HelpCircle size={18} /> },
  ];

  const getPageInfo = () => {
    if (location.pathname === '/instructor') return { title: 'Dashboard', subtitle: "Welcome back! Here's an overview of your teaching activity." };
    const allItems = [...courseManagementItems, ...accessInquiriesItems, ...trainingItems];
    const item = allItems.find(i => location.pathname.startsWith(i.path) && i.path !== '/instructor');
    if (item) return { title: item.label, subtitle: `Manage your ${item.label.toLowerCase()}` };
    return { title: 'Instructor Portal', subtitle: 'Manage your teaching resources' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-[260px] bg-[#1a202c] text-white flex flex-col shrink-0 fixed md:static inset-y-0 left-0 z-30 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 shrink-0 pt-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Trusters Labs Logo" className="h-12 w-auto object-contain rounded bg-white p-1" />
          </div>
          <button className="hidden md:flex w-6 h-6 rounded bg-[#2d3748] items-center justify-center text-slate-400 hover:text-white">
            <ChevronLeft size={14} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 hide-scrollbar">
          
          {/* Standalone Dashboard Link */}
          <div className="px-4 mb-6">
            <Link
              to="/instructor"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === '/instructor' 
                  ? 'bg-[#3182ce] text-white font-medium shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <span className={`mr-4 ${location.pathname === '/instructor' ? 'text-white' : ''}`}><LayoutDashboard size={18} /></span>
              <span className="text-[14px]">Dashboard</span>
            </Link>
          </div>

          {/* Section 1 */}
          <div className="mb-4">
            <button 
              onClick={() => toggleDropdown('courseManagement')}
              className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-slate-400 tracking-wider hover:text-white transition-colors"
            >
              <span>COURSE MANAGEMENT</span>
              <ChevronDown size={14} className={`transform transition-transform ${openDropdowns.courseManagement ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdowns.courseManagement ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <nav className="space-y-1 px-4">
                {courseManagementItems.map((item) => {
                  const isActive = location.pathname === item.path || 
                                  (item.path !== '/instructor' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-[#2d3748] text-white font-medium border-l-4 border-[#3182ce]' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium border-l-4 border-transparent'
                      }`}
                    >
                      <span className={`mr-4 ${isActive ? 'text-[#3182ce]' : ''}`}>{item.icon}</span>
                      <span className="text-[14px]">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-4">
            <button 
              onClick={() => toggleDropdown('accessInquiries')}
              className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-slate-400 tracking-wider hover:text-white transition-colors"
            >
              <span>STUDENTS & ENQUIRIES</span>
              <ChevronDown size={14} className={`transform transition-transform ${openDropdowns.accessInquiries ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdowns.accessInquiries ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <nav className="space-y-1 px-4">
                {accessInquiriesItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-[#2d3748] text-white font-medium border-l-4 border-[#3182ce]' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium border-l-4 border-transparent'
                      }`}
                    >
                      <span className={`mr-4 ${isActive ? 'text-[#3182ce]' : ''}`}>{item.icon}</span>
                      <span className="text-[14px]">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Section 3 */}
          <div className="mb-4">
            <button 
              onClick={() => toggleDropdown('trainingAcademy')}
              className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-slate-400 tracking-wider hover:text-white transition-colors"
            >
              <span>TRAINING ACADEMY</span>
              <ChevronDown size={14} className={`transform transition-transform ${openDropdowns.trainingAcademy ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdowns.trainingAcademy ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <nav className="space-y-1 px-4">
                {trainingItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-[#2d3748] text-white font-medium border-l-4 border-[#3182ce]' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium border-l-4 border-transparent'
                      }`}
                    >
                      <span className={`mr-4 ${isActive ? 'text-[#3182ce]' : ''}`}>{item.icon}</span>
                      <span className="text-[14px]">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="p-4 shrink-0 mb-4 border-t border-white/10 pt-6 mt-auto">
          <button 
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
          >
            <LogOut size={18} className="mr-4" />
            <span className="text-[14px]">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        
        {/* Header */}
        <header className="h-[90px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 md:hidden">
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600">
               <LayoutDashboard size={24} />
             </button>
             <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          </div>
          
          <div className="hidden md:block pt-2">
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight tracking-tight">{title}</h1>
            <p className="text-[14px] text-slate-500 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-6">
            <NotificationDropdown isSuperAdmin={true} />
            <div className="hidden md:flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer hover:opacity-80">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center font-bold text-slate-600 bg-slate-100">
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'I'}
              </div>
              <div className="text-sm flex flex-col justify-center">
                <p className="font-bold text-slate-900 text-[14px] leading-none mb-1">
                  {user?.first_name || user?.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : user?.username || 'Instructor'}
                </p>
                {user?.email && <p className="text-slate-500 text-[11px] leading-none mb-1">{user.email}</p>}
                <p className="text-[#0A66C2] text-[11px] font-medium leading-none">Course Instructor</p>
              </div>
              <ChevronDown size={16} className="text-slate-500 ml-1" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#F4F6F8]">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </main>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default InstructorLayout;
