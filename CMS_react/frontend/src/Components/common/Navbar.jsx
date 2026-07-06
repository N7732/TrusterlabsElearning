import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import { LogOut, User, ChevronDown, LayoutDashboard, ArrowLeft } from 'lucide-react';
import logo from '../../assets/TrusterlabLogo.png';

const Navbar = () => {
  const { isAuthenticated, user, logout, isInstructor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isCoursePlayer = location.pathname.startsWith('/course/');

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-[#273B76] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 relative">
          <div className="flex items-center gap-2 sm:gap-4">
            {isCoursePlayer && (
              <button 
                onClick={() => navigate('/courses')} 
                className="text-white hover:text-slate-300 p-2 transition-colors flex items-center justify-center rounded-full hover:bg-white/10"
                title="Back to Courses"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <a href="https://www.trusterlabs.com/" target="_self" className="flex items-center group py-2">
              <div className="bg-white rounded-full px-5 py-1.5 flex items-center justify-center">
                <img src={logo} alt="Truster Lab" className="h-8 md:h-10 w-auto object-contain" />
              </div>
            </a>
          </div>
            
          {/* Desktop Navigation */}
          <div className="absolute left-1/2 top-0 h-16 -translate-x-1/2 hidden lg:flex items-center space-x-4 xl:space-x-6">
            <a href="https://www.trusterlabs.com/" target="_self" className="text-white hover:text-slate-200 px-2 py-2 text-sm font-bold transition-colors">
              Home
            </a>
            <a href="https://www.trusterlabs.com/careers/index.html" target="_self" className="text-white hover:text-slate-200 px-2 py-2 text-sm font-bold transition-colors">
              Internship
            </a>
            <a href="https://www.trusterlabs.com/#about" target="_self" className="text-white hover:text-slate-200 px-2 py-2 text-sm font-bold transition-colors">
              About
            </a>
            <a href="https://www.trusterlabs.com/#services" target="_self" className="text-white hover:text-slate-200 px-2 py-2 text-sm font-bold transition-colors">
              Services
            </a>
            <a href="https://www.trusterlabs.com/#training" target="_self" className="text-white hover:text-slate-200 px-2 py-2 text-sm font-bold transition-colors">
              Training
            </a>
            <Link to="/courses" className="text-white hover:text-slate-200 px-2 py-2 text-sm font-bold transition-colors">
              Courses
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="!font-bold text-white hover:bg-white/10 hover:text-white">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button className="!bg-[#FFD700] hover:!bg-[#F0C800] !text-black font-bold">Sign up</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-white hover:bg-white/10 px-3 py-2 rounded-md transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                      <User size={16} />
                    </div>
                    <span className="hidden sm:block">{user?.first_name || 'User'}</span>
                    <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-slate-100 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      
                      {isAdmin && (
                        <Link 
                          to="/admin/dashboard" 
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-[#0A66C2]"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      
                      {isInstructor && !isAdmin && (
                        <Link 
                          to="/instructor/dashboard" 
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          Instructor Portal
                        </Link>
                      )}
                      
                      {!isInstructor && !isAdmin && (
                        <Link 
                          to="/learner/dashboard" 
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          My Learning
                        </Link>
                      )}

                      <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        My Profile
                      </Link>
                      
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button 
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
