import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Microscope, ArrowRight } from 'lucide-react';
import image3 from '../../assets/image3.png';

const Academics = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 font-['Work_Sans',sans-serif]">
      {/* Hero Section with image3 background */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img src={image3} alt="Academics Background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#030712]/70"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 justify-center mb-6">
            <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
            <h2 className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">TrusterLab</h2>
            <div className="h-[2px] w-8 bg-[#D4AF37]"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Academics Portal
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Explore our world-class cybersecurity courses, apply for admissions, and discover groundbreaking research.
          </p>
        </div>
      </section>

      {/* Main Portals Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 -mt-32 relative z-20">
          
          {/* Courses */}
          <Link to="/courses" className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group border border-slate-100 hover:border-[#273B76]/20 flex flex-col h-full">
            <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen size={32} className="text-[#273B76]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-[#273B76] transition-colors">Courses & Training</h3>
            <p className="text-slate-600 flex-grow mb-6">
              Browse our comprehensive catalog of cybersecurity courses and specialized training programs designed for all skill levels.
            </p>
            <div className="text-[#273B76] font-bold flex items-center mt-auto">
              Explore Courses <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Admission */}
          <Link to="/admission" className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group border border-slate-100 hover:border-[#FFD700]/30 flex flex-col h-full">
            <div className="w-16 h-16 bg-yellow-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <GraduationCap size={32} className="text-[#D4AF37]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-[#D4AF37] transition-colors">Admissions</h3>
            <p className="text-slate-600 flex-grow mb-6">
              Ready to take the next step? Apply for our flagship programs, review requirements, and start your cybersecurity journey.
            </p>
            <div className="text-[#D4AF37] font-bold flex items-center mt-auto">
              Apply Now <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Research */}
          <Link to="/research/articles" className="bg-[#111827] rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group border border-slate-800 hover:border-blue-500/30 flex flex-col h-full">
            <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Microscope size={32} className="text-white group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">Research & Webinars</h3>
            <p className="text-gray-400 flex-grow mb-6">
              Access cutting-edge whitepapers, threat intelligence reports, and join live technical webinars with our experts.
            </p>
            <div className="text-blue-400 font-bold flex items-center mt-auto">
              Discover Research <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

        </div>
      </section>
    </div>
  );
};

export default Academics;
