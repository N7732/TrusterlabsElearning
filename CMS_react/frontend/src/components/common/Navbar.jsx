import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import { LogOut, User, ChevronDown, LayoutDashboard, ArrowLeft, Menu, X } from 'lucide-react';
import logo from '../../assets/image2.jpeg';
import TopUtilityBar from './TopUtilityBar';

const Navbar = () => {
  const { isAuthenticated, user, logout, isInstructor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileAcademicsOpen, setMobileAcademicsOpen] = useState(false);
  const [mobileResearchOpen, setMobileResearchOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiClient.get('/settings/site-settings/');
        if (data && !data.results && !Array.isArray(data)) {
          setSettings(data);
        } else if (data.results && data.results.length > 0) {
          setSettings(data.results[0]);
        } else if (Array.isArray(data) && data.length > 0) {
          setSettings(data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch site settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const isCoursePlayer = location.pathname.startsWith('/course/');
  
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  // Use either the string or the pathname object since `from` could be a string or an object depending on how it was passed
  const fromPath = typeof location.state?.from === 'string' 
    ? location.state.from 
    : location.state?.from?.pathname;

  const checkIsAcademics = (path) => {
    if (!path) return false;
    return [
      '/academics', '/courses', '/training', '/admission', 
      '/research/articles', '/research/webinars'
    ].includes(path) || path.startsWith('/course/');
  };

  const isAcademicsRoute = checkIsAcademics(location.pathname) || (isAuthRoute && checkIsAcademics(fromPath));

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
    <header className="sticky top-0 z-[100] w-full flex flex-col">
      <TopUtilityBar />
      <nav className="bg-[#0b162c] shadow-md relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 relative">
          <div className="flex items-center gap-2 sm:gap-4">
            {isCoursePlayer && (
              <button 
                onClick={() => navigate('/courses')} 
                className="text-white hover:text-[#FFD700] p-2 transition-colors flex items-center justify-center rounded-full hover:bg-white/10"
                title="Back to Courses"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <Link to="/" className="flex items-center group py-2 relative z-50">
              <div className="flex items-center justify-center">
                <img src={settings?.navbar_logo || logo} alt={settings?.company_name || "Truster Lab"} className="h-10 md:h-12 w-auto object-contain rounded" />
              </div>
            </Link>
          </div>
            
          {/* Mobile Menu Toggle */}
          <div className="flex items-center lg:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
             <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-[#FFD700] p-2 focus:outline-none transition-colors"
                aria-label="Toggle mobile menu"
             >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
             </button>
          </div>

          {/* Desktop Navigation */}
          <div className="absolute left-1/2 top-0 h-16 -translate-x-1/2 hidden lg:flex items-center space-x-4 xl:space-x-6">
            
            {isAcademicsRoute ? (
              <>
                <Link to="/academics" className="text-white hover:text-[#FFD700] px-2 py-2 text-sm font-bold transition-colors">
                  Home
                </Link>

                {/* Courses Dropdown */}
                <div className="relative group h-full flex items-center">
                  <button className="flex items-center text-white hover:text-[#FFD700] px-2 py-2 text-sm font-bold transition-colors focus:outline-none">
                    Courses <ChevronDown size={14} className="ml-1 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-0 w-48 bg-white rounded-md shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-1 border border-slate-100">
                    <Link to="/courses" className="block px-4 py-2 text-sm text-slate-700 font-bold hover:bg-slate-50 hover:text-[#FFD700] transition-colors">Courses</Link>
                    <Link to="/training" className="block px-4 py-2 text-sm text-slate-700 font-bold hover:bg-slate-50 hover:text-[#FFD700] transition-colors">Training session</Link>
                  </div>
                </div>

                <Link to="/admission" className="text-white hover:text-[#FFD700] px-2 py-2 text-sm font-bold transition-colors">
                  Admission
                </Link>

                {/* Research Dropdown */}
                <div className="relative group h-full flex items-center">
                  <button className="flex items-center text-white hover:text-[#FFD700] px-2 py-2 text-sm font-bold transition-colors focus:outline-none">
                    Research <ChevronDown size={14} className="ml-1 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-0 w-56 bg-white rounded-md shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-1 border border-slate-100">
                    <Link to="/research/articles" className="block px-4 py-2 text-sm text-slate-700 font-bold hover:bg-slate-50 hover:text-[#FFD700] transition-colors">Research Articles</Link>
                    <Link to="/research/webinars" className="block px-4 py-2 text-sm text-slate-700 font-bold hover:bg-slate-50 hover:text-[#FFD700] transition-colors">Cybersecurity Webinar</Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/" className="text-white hover:text-[#FFD700] px-2 py-2 text-sm font-bold transition-colors">
                  Home
                </Link>

                {/* About Us Dropdown */}
                <div className="relative group h-full flex items-center">
                  <button className="flex items-center text-white hover:text-[#FFD700] px-2 py-2 text-sm font-bold transition-colors focus:outline-none">
                    About Us <ChevronDown size={14} className="ml-1 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-0 w-48 bg-white rounded-md shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-1 border border-slate-100">
                    <Link to="/about#our-story" className="block px-4 py-2 text-sm text-slate-700 font-bold hover:bg-slate-50 hover:text-[#FFD700] transition-colors">Our Story</Link>
                    <Link to="/about#staff" className="block px-4 py-2 text-sm text-slate-700 font-bold hover:bg-slate-50 hover:text-[#FFD700] transition-colors">Staff</Link>
                    <Link to="/about#partners" className="block px-4 py-2 text-sm text-slate-700 font-bold hover:bg-slate-50 hover:text-[#FFD700] transition-colors">Partners</Link>
                    <Link to="/about#contact-us" className="block px-4 py-2 text-sm text-slate-700 font-bold hover:bg-slate-50 hover:text-[#FFD700] transition-colors">Contact Us</Link>
                  </div>
                </div>

                <a href="/academics" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FFD700] px-2 py-2 text-sm font-bold transition-colors">
                  Academics
                </a>

                <Link to="/membership" className="text-white hover:text-[#FFD700] px-2 py-2 text-sm font-bold transition-colors">
                  Membership
                </Link>

                <Link to="/about#contact-us" className="text-white hover:text-[#FFD700] px-2 py-2 text-sm font-bold transition-colors">
                  Request Inquiries
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <div className="flex items-center">
                <Link to="/login" state={{ from: location.pathname }}>
                  <Button className="!bg-[#FFD700] hover:!bg-[#F0C800] !text-black font-bold px-6">Sign In</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-sm font-bold text-white hover:bg-white/10 hover:text-[#FFD700] px-3 py-2 rounded-md transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:text-[#FFD700]">
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
                          to="/superadmin" 
                          className="flex items-center px-4 py-2 text-sm text-slate-700 font-bold hover:bg-slate-100 hover:text-[#FFD700]"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      
                      {isInstructor && !isAdmin && (
                        <Link 
                          to="/instructor" 
                          className="flex items-center px-4 py-2 text-sm text-slate-700 font-bold hover:bg-slate-100 hover:text-[#FFD700]"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          Instructor Portal
                        </Link>
                      )}
                      
                      {!isInstructor && !isAdmin && (
                        <Link 
                          to="/learner/dashboard" 
                          className="flex items-center px-4 py-2 text-sm text-slate-700 font-bold hover:bg-slate-100 hover:text-[#FFD700]"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          My Learning
                        </Link>
                      )}

                      <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-slate-700 font-bold hover:bg-slate-100 hover:text-[#FFD700]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        My Profile
                      </Link>
                      
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button 
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 font-bold hover:bg-red-50 hover:text-[#FFD700]"
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
      
      {/* Mobile Menu Panel */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden bg-[#0b162c] border-t border-white/10 ${isMobileMenuOpen ? 'max-h-screen opacity-100 py-4 shadow-xl' : 'max-h-0 opacity-0 py-0'}`}>
        <div className="flex flex-col px-6 space-y-4 text-white">
          {isAcademicsRoute ? (
            <>
              <Link to="/academics" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-[#FFD700] font-bold transition-colors">Home</Link>
              
              <div className="flex flex-col space-y-2">
                <button onClick={() => setMobileAcademicsOpen(!mobileAcademicsOpen)} className="flex items-center justify-between text-white hover:text-[#FFD700] font-bold w-full focus:outline-none">
                  Courses <ChevronDown size={16} className={`transition-transform duration-200 ${mobileAcademicsOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileAcademicsOpen && (
                  <div className="flex flex-col pl-4 space-y-2 mt-1 border-l-2 border-white/20">
                    <Link to="/courses" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-[#FFD700] text-sm">Courses</Link>
                    <Link to="/training" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-[#FFD700] text-sm">Training session</Link>
                  </div>
                )}
              </div>

              <Link to="/admission" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-[#FFD700] font-bold transition-colors">Admission</Link>
              
              <div className="flex flex-col space-y-2">
                <button onClick={() => setMobileResearchOpen(!mobileResearchOpen)} className="flex items-center justify-between text-white hover:text-[#FFD700] font-bold w-full focus:outline-none">
                  Research <ChevronDown size={16} className={`transition-transform duration-200 ${mobileResearchOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileResearchOpen && (
                  <div className="flex flex-col pl-4 space-y-2 mt-1 border-l-2 border-white/20">
                    <Link to="/research/articles" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-[#FFD700] text-sm">Research Articles</Link>
                    <Link to="/research/webinars" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-[#FFD700] text-sm">Cybersecurity Webinar</Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-[#FFD700] font-bold transition-colors">Home</Link>
              
              <div className="flex flex-col space-y-2">
                <button onClick={() => setMobileAboutOpen(!mobileAboutOpen)} className="flex items-center justify-between text-white hover:text-[#FFD700] font-bold w-full focus:outline-none">
                  About Us <ChevronDown size={16} className={`transition-transform duration-200 ${mobileAboutOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileAboutOpen && (
                  <div className="flex flex-col pl-4 space-y-2 mt-1 border-l-2 border-white/20">
                    <Link to="/about#our-story" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-[#FFD700] text-sm">Our Story</Link>
                    <Link to="/about#staff" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-[#FFD700] text-sm">Staff</Link>
                    <Link to="/about#partners" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-[#FFD700] text-sm">Partners</Link>
                    <Link to="/about#contact-us" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-[#FFD700] text-sm">Contact Us</Link>
                  </div>
                )}
              </div>

              <a href="/academics" onClick={() => setIsMobileMenuOpen(false)} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FFD700] font-bold transition-colors">Academics</a>
              <Link to="/membership" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-[#FFD700] font-bold transition-colors">Membership</Link>
              <Link to="/about#contact-us" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-[#FFD700] font-bold transition-colors">Request Inquiries</Link>
            </>
          )}
        </div>
      </div>
    </nav>
    </header>
  );
};

export default Navbar;
