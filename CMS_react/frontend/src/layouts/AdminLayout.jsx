import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, BookOpen, Layers, List, HelpCircle,
  Users, MessageSquare, Shield, Gift, LogOut, ChevronLeft,
  Bell, ChevronDown, Package, GraduationCap, UserCheck, BookMarked, AlignLeft
} from 'lucide-react';

const AdminLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const courseManagementItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/courses', label: 'Courses', icon: <BookOpen size={18} /> },
    { path: '/admin/modules', label: 'Modules', icon: <Layers size={18} /> },
    { path: '/admin/lessons', label: 'Lessons', icon: <List size={18} /> },
    { path: '/admin/quizzes', label: 'Quizzes', icon: <HelpCircle size={18} /> },
    { path: '/admin/quiz_questions', label: 'Quiz Questions', icon: <HelpCircle size={18} /> },
  ];

  const accessInquiriesItems = [
    { path: '/admin/enrollments', label: 'All Enrollments', icon: <Users size={18} />, exact: true },
    { path: '/admin/enrollments?tab=inquiries', label: 'Inquiry Requests', icon: <MessageSquare size={18} /> },
    { path: '/admin/enrollments?tab=paid', label: 'Paid Access', icon: <Shield size={18} /> },
    { path: '/admin/enrollments?tab=free', label: 'Free Access', icon: <Gift size={18} /> },
  ];

  const getPageInfo = () => {
    if (location.pathname === '/admin/dashboard') return { title: 'Dashboard', subtitle: "Welcome back! Here's what's happening with your platform." };
    const currentUrl = location.pathname + location.search;
    const allItems = [...courseManagementItems, ...accessInquiriesItems];
    const item = allItems.find(i => currentUrl === i.path || (i.path !== '/admin/dashboard' && !i.path.includes('?') && location.pathname.startsWith(i.path)));
    if (item) return { title: item.label, subtitle: `Manage your ${item.label.toLowerCase()}` };
    return { title: 'Platform', subtitle: 'Manage your platform settings' };
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
      <aside className={`w-[260px] bg-[#0b162c] text-white flex flex-col shrink-0 fixed md:static inset-y-0 left-0 z-30 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 shrink-0 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded flex items-center justify-center text-[#0b162c]">
              <Package size={20} className="fill-current" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white tracking-widest leading-tight">TRUSTERS LABS</h1>
              <p className="text-[8px] text-slate-400 tracking-widest mt-0.5">LEARN • GROW • SUCCEED</p>
            </div>
          </div>
          <button className="hidden md:flex w-6 h-6 rounded bg-[#152341] items-center justify-center text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={14} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 hide-scrollbar">
          
          {/* Section 1 */}
          <div className="mb-8">
            <p className="px-6 text-xs font-semibold text-slate-500 tracking-wider mb-3">COURSE MANAGEMENT</p>
            <nav className="space-y-1 px-4">
              {courseManagementItems.map((item) => {
                const isActive = location.pathname === item.path || 
                                (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#153474] text-white font-medium shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
                    }`}
                  >
                    <span className={`mr-4 ${isActive ? 'text-[#3b82f6]' : ''}`}>{item.icon}</span>
                    <span className="text-[14px]">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Section 2 */}
          <div>
            <p className="px-6 text-xs font-semibold text-slate-500 tracking-wider mb-3">ACCESS & INQUIRIES</p>
            <nav className="space-y-1 px-4">
              {accessInquiriesItems.map((item) => {
                const isActive = item.path.includes('?') 
                    ? location.pathname + location.search === item.path
                    : location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#153474] text-white font-medium shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
                    }`}
                  >
                    <span className={`mr-4 ${isActive ? 'text-[#3b82f6]' : ''}`}>{item.icon}</span>
                    <span className="text-[14px]">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
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
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
               <LayoutDashboard size={24} />
             </button>
             <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          </div>
          
          <div className="hidden md:block pt-2">
            <h1 className="text-[26px] font-bold text-slate-900 leading-tight tracking-tight">{title}</h1>
            <p className="text-[14px] text-slate-500 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={22} />
              <span className="absolute top-1 right-1.5 w-[16px] h-[16px] bg-[#0A66C2] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">3</span>
            </button>
            <div className="hidden md:flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200 flex items-center justify-center font-bold text-slate-600 bg-slate-100">
                {user?.first_name?.charAt(0) || 'A'}
              </div>
              <div className="text-sm">
                <p className="font-bold text-slate-900 text-[14px] leading-none mb-1">{user?.first_name} {user?.last_name || 'Admin'}</p>
                <p className="text-slate-500 text-[12px] leading-none">Superadmin Administrator</p>
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

export default AdminLayout;
