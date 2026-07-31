import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Microscope, ArrowRight, Play, Users, Shield, Globe } from 'lucide-react';
import image3 from '../../assets/image3.png';

const Academics = () => {
  return (
    <div className="min-h-screen bg-[#020617] font-['Work_Sans',sans-serif] selection:bg-blue-500/30 overflow-hidden text-slate-200">
      
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 relative">
          {/* Decorative lines & subtitle */}
          <div className="flex items-center gap-4 justify-center mb-6 opacity-80">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#d4af37]"></div>
            <h2 className="text-[#d4af37] font-bold tracking-[0.2em] uppercase text-xs">TrusterLab</h2>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#d4af37]"></div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Academics <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-[#d4af37]">Portal</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed font-light">
            Explore our world-class cybersecurity courses, apply for admissions, and discover groundbreaking research.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link 
              to="/courses" 
              className="px-8 py-3.5 bg-gradient-to-r from-[#ffd700] to-[#d4af37] text-[#020617] font-bold rounded-full flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              Explore Courses <ArrowRight size={18} />
            </Link>
            <Link 
              to="/about" 
              className="px-8 py-3.5 bg-transparent border border-slate-600 hover:border-slate-400 text-white font-medium rounded-full flex items-center gap-3 transition-all hover:bg-white/5"
            >
              About Trusterlab <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center"><Play size={10} className="ml-0.5" /></div>
            </Link>
          </div>
        </div>

        {/* Portals Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-24 relative">
          
          {/* Card 1: Courses */}
          <Link to="/courses" className="group relative bg-[#090d1f]/80 backdrop-blur-md rounded-3xl p-8 border border-blue-900/30 hover:border-blue-500/50 transition-all duration-500 overflow-hidden flex flex-col min-h-[380px]">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none group-hover:from-blue-500/10 transition-colors"></div>
            
            <div className="w-16 h-16 rounded-full border border-blue-500/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] bg-[#020617]/50 relative z-10">
              <BookOpen size={28} className="text-blue-400 group-hover:text-blue-300" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Courses & Training</h3>
            <p className="text-slate-400 leading-relaxed flex-grow relative z-10 text-sm md:text-base">
              Browse our comprehensive catalog of cybersecurity courses and specialized training programs designed for all skill levels.
            </p>
            
            <div className="text-blue-400 font-semibold flex items-center mt-6 relative z-10 text-sm">
              Explore Courses <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Admissions */}
          <Link to="/admission" className="group relative bg-[#120f06]/80 backdrop-blur-md rounded-3xl p-8 border border-yellow-900/30 hover:border-yellow-500/50 transition-all duration-500 overflow-hidden flex flex-col min-h-[380px] lg:-translate-y-4">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-600/5 to-transparent pointer-events-none group-hover:from-yellow-500/10 transition-colors"></div>
            
            <div className="w-16 h-16 rounded-full border border-yellow-500/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_25px_rgba(234,179,8,0.2)] bg-[#020617]/50 relative z-10">
              <GraduationCap size={28} className="text-yellow-400 group-hover:text-yellow-300" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Admissions</h3>
            <p className="text-slate-400 leading-relaxed flex-grow relative z-10 text-sm md:text-base">
              Ready to take the next step? Apply for our flagship programs, review requirements, and start your cybersecurity journey.
            </p>
            
            <div className="text-yellow-400 font-semibold flex items-center mt-6 relative z-10 text-sm">
              Apply Now <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Research */}
          <Link to="/research/articles" className="group relative bg-[#0e091c]/80 backdrop-blur-md rounded-3xl p-8 border border-purple-900/30 hover:border-purple-500/50 transition-all duration-500 overflow-hidden flex flex-col min-h-[380px]">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none group-hover:from-purple-500/10 transition-colors"></div>
            
            <div className="w-16 h-16 rounded-full border border-purple-500/30 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] bg-[#020617]/50 relative z-10">
              <Microscope size={28} className="text-purple-400 group-hover:text-purple-300" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Research & Webinars</h3>
            <p className="text-slate-400 leading-relaxed flex-grow relative z-10 text-sm md:text-base">
              Access cutting-edge whitepapers, threat intelligence reports, and join live technical webinars with our experts.
            </p>
            
            <div className="text-purple-400 font-semibold flex items-center mt-6 relative z-10 text-sm">
              Discover Research <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Stats Section */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-white/10">
            
            <div className="flex flex-col items-center justify-center p-2">
              <GraduationCap size={24} className="text-slate-400 mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-[#d4af37] mb-1">120+</div>
              <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">Courses & Programs</div>
            </div>

            <div className="flex flex-col items-center justify-center p-2">
              <Users size={24} className="text-slate-400 mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-[#d4af37] mb-1">5,000+</div>
              <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">Students Enrolled</div>
            </div>

            <div className="flex flex-col items-center justify-center p-2">
              <Shield size={24} className="text-slate-400 mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-[#d4af37] mb-1">45+</div>
              <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">Expert Instructors</div>
            </div>

            <div className="flex flex-col items-center justify-center p-2">
              <Globe size={24} className="text-slate-400 mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-[#d4af37] mb-1">30+</div>
              <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">Research Publications</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Academics;
