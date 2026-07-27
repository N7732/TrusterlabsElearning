import React, { useState, useEffect } from 'react';
import { apiClient, getImageUrl } from '../../api/apiClient';
import { usePublicCourses, useStudentStats, usePartners } from '../../hooks/queries/usePublicQueries';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card, { CardContent, CardTitle, CardFooter } from '../../components/common/Card';
import { PlayCircle, Code, ShieldCheck, Zap, Globe, Cpu, Database, Cloud, Lock, Shield, Users, Briefcase, BookOpen } from 'lucide-react';
import homeBg from '../../assets/image1.jpg';
import whyBg from '../../assets/image6.jpg';

const Home = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section 
        className="relative pt-4 pb-8"
        style={{
          backgroundImage: `url(${homeBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark blue overlay to improve text readability */}
        <div className="absolute inset-0 bg-[#0b162c]/70"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-end justify-between gap-8 pb-4 pt-4">
          <div className="w-full lg:w-2/3 text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-3 animate-fade-in-up leading-tight">
              Cybersecurity <br className="hidden sm:block" />
              Excellence | <br />
              <span className="text-[#D4AF37]">Built for Africa</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base md:text-lg text-white mb-8 leading-relaxed">
              Empowering governments, enterprises and communities with research, innovation, world-class training, cyber defense and strategic consultancy.
            </p>
            <div className="flex flex-col sm:flex-row justify-start gap-4">
              <Link to="/about#our-story">
                <Button size="lg" className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#c29e2f] text-black border-none font-semibold flex items-center gap-2">
                  Our Story <span>→</span>
                </Button>
              </Link>
              <Link to="/academics">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent text-white hover:bg-white/5 border-[#D4AF37] font-semibold flex items-center gap-2">
                  Explore Academics <span className="text-[#D4AF37]">→</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-auto flex justify-end">
            <HeroStats />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section 
        className="relative pt-10 pb-20 border-t border-[#D4AF37]/20"
        style={{
          backgroundImage: `url(${whyBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-[#0b162c]/85"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white">Why Choose Truster Lab?</h2>
            <div className="h-[2px] w-24 bg-[#D4AF37] mx-auto mt-4 mb-4"></div>
            <p className="text-lg text-[#D4AF37] font-medium tracking-wide uppercase text-sm">We focus on what matters: building real things.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              delay={100}
              icon={<Code className="text-[#D4AF37] w-8 h-8" />}
              title="Hands-on Projects"
              subtitle="Learn by Building Real Solutions"
              description="Gain practical experience by building real-world projects. Develop market-ready applications and skills that employers actively seek."
            />
            <FeatureCard 
              delay={250}
              icon={<Users className="text-[#D4AF37] w-8 h-8" />}
              title="Expert Instructors & Professional Training"
              subtitle="Learn from Industry Professionals"
              description="Learn from industry experts using up-to-date curricula. Gain practical, competitive skills aligned with today's technology demands."
            />
            <FeatureCard 
              delay={400}
              icon={<Briefcase className="text-[#D4AF37] w-8 h-8" />}
              title="Internship & Career Development"
              subtitle="Bridge the Gap Between Learning and Employment"
              description="Access internship opportunities and professional mentorship. We help you build confidence, strengthen your portfolio, and launch your career."
            />
            <FeatureCard 
              delay={550}
              icon={<BookOpen className="text-[#D4AF37] w-8 h-8" />}
              title="Market-Driven Curriculum"
              subtitle="Skills That Match Industry Needs"
              description="Study the most in-demand tools and frameworks. Our continuously updated curriculum ensures your skills remain relevant and highly competitive."
            />
          </div>
        </div>
      </section>

      {/* Partners Slider Section */}
      <PartnersSection />
    </div>
  );
};

const FeatureCard = ({ icon, title, subtitle, description, delay = 0 }) => (
  <div 
    className="h-full animate-fade-in-up"
    style={{ opacity: 0, animationDelay: `${delay}ms` }}
  >
    <Card hoverable className="!bg-[#0c2045]/85 backdrop-blur-md border border-blue-400/20 shadow-lg group hover:border-[#D4AF37]/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
      <CardContent className="flex flex-col items-center text-center p-8 flex-grow">
        <div className="w-16 h-16 rounded-full bg-[#0b162c] border border-blue-400/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#D4AF37]/10 transition-all duration-300">
          {icon}
        </div>
        <CardTitle className="mb-2 !text-[#D4AF37] font-bold text-lg leading-snug">{title}</CardTitle>
        {subtitle && <p className="text-white/80 text-xs font-bold mb-4 uppercase tracking-wider">{subtitle}</p>}
        <p className="text-gray-400 font-medium text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  </div>
);

const AnimatedCounter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = count;
    const endValue = target;
    
    if (startValue === endValue) return;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quartic
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(startValue + (endValue - startValue) * easeProgress));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };
    
    window.requestAnimationFrame(step);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return <>{count}</>;
};

const HeroStats = () => {
  const [courseCount, setCourseCount] = useState(5);
  const [studentCount, setStudentCount] = useState(100);

  const { data: coursesData } = usePublicCourses();
  const { data: studentsData } = useStudentStats();

  useEffect(() => {
    if (coursesData) {
      if (coursesData.count !== undefined) {
        setCourseCount(Math.max(coursesData.count, 5));
      } else if (coursesData.results) {
        setCourseCount(Math.max(coursesData.results.length, 5));
      } else if (Array.isArray(coursesData)) {
        setCourseCount(Math.max(coursesData.length, 5));
      }
    }
  }, [coursesData]);

  useEffect(() => {
    if (studentsData) {
      if (studentsData.count !== undefined) {
        setStudentCount(Math.max(studentsData.count, 100));
      } else if (studentsData.results) {
        setStudentCount(Math.max(studentsData.results.length, 100));
      } else if (Array.isArray(studentsData)) {
        setStudentCount(Math.max(studentsData.length, 100));
      }
    }
  }, [studentsData]);

  return (
    <div className="bg-[#0c2045]/90 backdrop-blur-md border-b-4 border-b-[#D4AF37] border-x border-t border-[#D4AF37]/30 rounded-xl p-5 shadow-2xl flex flex-col sm:flex-row items-center gap-6 animate-fade-in-up mt-6 lg:mt-0">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex shrink-0 items-center justify-center">
          <BookOpen className="text-[#D4AF37] w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-3xl font-extrabold text-white leading-none mb-1">
            <AnimatedCounter target={courseCount} />+
          </h3>
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest whitespace-nowrap">Total Courses</p>
        </div>
      </div>
      
      <div className="w-full h-[1px] sm:w-[1px] sm:h-12 bg-white/20"></div>
      
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex shrink-0 items-center justify-center">
          <Users className="text-[#D4AF37] w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-3xl font-extrabold text-white leading-none mb-1">
            <AnimatedCounter target={studentCount} />+
          </h3>
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest whitespace-nowrap">Active Students</p>
        </div>
      </div>
    </div>
  );
};

const PartnersSection = () => {
  const { data: rawPartners, isLoading: loading } = usePartners();
  
  const partners = React.useMemo(() => {
    if (!rawPartners) return [];
    return rawPartners.filter(p => p.is_active);
  }, [rawPartners]);

  // Use actual partners if available, otherwise use placeholders so the section is visible
  const activePartners = partners.length > 0 ? partners : [
    { id: 'mock-1', name: "CyberDefend Inc" },
    { id: 'mock-2', name: "Global NetSec" },
    { id: 'mock-3', name: "CloudArmour" },
    { id: 'mock-4', name: "DataGuard Pro" },
    { id: 'mock-5', name: "Core Security" },
    { id: 'mock-6', name: "SecureVault" }
  ];

  // Decide whether to animate based on the number of partners
  const isAnimating = activePartners.length > 4;

  // We need enough items to create a seamless scrolling loop ONLY if animating
  const displayPartners = isAnimating 
    ? [...activePartners, ...activePartners, ...activePartners, ...activePartners, ...activePartners, ...activePartners]
    : activePartners;

  return (
    <section className="py-16 bg-[#0b162c] overflow-hidden border-t border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
        <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-widest">Trusted by Industry Leaders</p>
      </div>
      
      <div className={`relative w-full flex py-4 ${isAnimating ? 'overflow-hidden mask-image-linear-right' : 'justify-center'}`}>
        <div className={`flex ${isAnimating ? 'animate-ticker whitespace-nowrap w-max' : 'flex-wrap justify-center gap-x-12 gap-y-8'}`}>
          {displayPartners.map((partner, index) => (
            <div key={`${partner.id}-${index}`} className="flex flex-col items-center gap-3 mx-8 opacity-80 hover:opacity-100 transition-opacity duration-300">
              {partner.logo_url || partner.logo ? (
                <>
                  <img src={partner.logo_url ? getImageUrl(partner.logo_url) : getImageUrl(partner.logo)} alt={partner.name} className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300" />
                  <span className="text-sm font-medium text-slate-300 tracking-wide">{partner.name}</span>
                </>
              ) : (
                <span className="text-xl font-bold text-white tracking-wider">{partner.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};





export default Home;
