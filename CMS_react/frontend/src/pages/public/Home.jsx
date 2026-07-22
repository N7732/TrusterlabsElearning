import React, { useState, useEffect } from 'react';
import { apiClient, getImageUrl } from '../../api/apiClient';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card, { CardContent, CardTitle, CardFooter } from '../../components/common/Card';
import { PlayCircle, Code, ShieldCheck, Zap, Globe, Cpu, Database, Cloud, Lock, Shield } from 'lucide-react';
import homeBg from '../../assets/image1.jpg';

const Home = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section 
        className="relative pt-8 pb-20"
        style={{
          backgroundImage: `url(${homeBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark blue overlay to improve text readability */}
        <div className="absolute inset-0 bg-[#0b162c]/70"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-4 animate-fade-in-up leading-tight">
            Cybersecurity <br className="hidden sm:block" />
            Excellence | <br />
            <span className="text-[#D4AF37]">Built for Africa</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl text-white mb-10 leading-relaxed">
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
      </section>

      {/* Why Project-Based Learning */}
      <section className="pt-5 pb-20 bg-[#0b162c] border-t border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white">Why Choose Truster Lab?</h2>
            <div className="h-[2px] w-24 bg-[#D4AF37] mx-auto mt-4 mb-4"></div>
            <p className="text-lg text-[#D4AF37] font-medium tracking-wide uppercase text-sm">We focus on what matters: building real things.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code className="text-[#D4AF37] w-8 h-8" />}
              title="Hands-on Projects"
              description="Build a portfolio of real-world applications as you learn, not just theory."
            />
            <FeatureCard 
              icon={<Zap className="text-[#D4AF37] w-8 h-8" />}
              title="Fast-Track Career"
              description="Learn exactly what employers are looking for with up-to-date curricula."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-[#D4AF37] w-8 h-8" />}
              title="Expert Instructors"
              description="Learn from senior developers and industry veterans who've been there."
            />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <StatsSection />

      {/* Featured Courses Section */}
      <FeaturedCourses />

      {/* Partners Slider Section */}
      <PartnersSection />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <Card hoverable className="bg-[#D4AF37] border-none shadow-lg group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
    <CardContent className="flex flex-col items-center text-center p-8">
      <div className="w-20 h-20 rounded-2xl bg-[#0b162c] shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <CardTitle className="mb-4 text-black font-extrabold text-xl">{title}</CardTitle>
      <p className="text-black font-medium leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

const PartnersSection = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/settings/partners/');
      // Extract array based on DRF pagination
      let data = res.results ? res.results : (Array.isArray(res) ? res : []);
      setPartners(data.filter(p => p.is_active));
    } catch (err) {
      console.error("Failed to load partners:", err);
    } finally {
      setLoading(false);
    }
  };

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
        {loading ? (
          <div className="w-full text-center text-slate-400">Loading partners...</div>
        ) : (
          <div className={`flex ${isAnimating ? 'animate-ticker whitespace-nowrap w-max' : 'flex-wrap justify-center gap-x-12 gap-y-8'}`}>
            {displayPartners.map((partner, index) => (
              <div key={`${partner.id}-${index}`} className="flex flex-col items-center gap-3 mx-8 opacity-80 hover:opacity-100 transition-opacity duration-300">
                {partner.logo ? (
                  <>
                    <img src={partner.logo} alt={partner.name} className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300" />
                    <span className="text-sm font-medium text-slate-300 tracking-wide">{partner.name}</span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-white tracking-wider">{partner.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const StatsSection = () => (
  <section className="py-16 bg-[#030712] border-t border-[#D4AF37]/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6 bg-[#111827] rounded-xl border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
          <h2 className="text-5xl font-extrabold text-[#D4AF37] mb-2">5000+</h2>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">Students Enrolled</p>
        </div>
        <div className="p-6 bg-[#111827] rounded-xl border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
          <h2 className="text-5xl font-extrabold text-[#D4AF37] mb-2">100+</h2>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">Premium Courses</p>
        </div>
        <div className="p-6 bg-[#111827] rounded-xl border border-white/10 hover:border-[#D4AF37]/30 transition-colors">
          <h2 className="text-5xl font-extrabold text-[#D4AF37] mb-2">50+</h2>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">Expert Instructors</p>
        </div>
      </div>
    </div>
  </section>
);

const FeaturedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiClient.get('/api/courses/');
        const results = data.results || data || [];
        setCourses(results.slice(0, 3));
      } catch (err) {
        console.error("Failed to load courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading || courses.length === 0) return null;

  return (
    <section className="py-20 bg-[#0b162c] border-t border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Featured Courses</h2>
            <p className="text-gray-400 text-lg">Discover our most popular programs hand-picked for you.</p>
          </div>
          <Link to="/courses" className="hidden md:inline-flex items-center text-[#D4AF37] hover:text-white font-bold transition-colors">
            View All Courses <span className="ml-2">→</span>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <Link to={`/course/${course.id}`} key={course.id} className="block group">
              <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden flex flex-col h-full hover:border-[#D4AF37]/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-all duration-300">
                <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                  <img 
                    src={getImageUrl(course.thumbnail || course.thumbnail_url)} 
                    alt={course.title} 
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" }}
                    className="w-full h-full object-cover group-hover:scale-105 opacity-80 group-hover:opacity-100 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80"></div>
                  <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-full shadow-lg">
                    {course.difficulty || 'BEGINNER'}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-white leading-snug mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed flex-grow">
                    {course.description ? course.description.replace(/<[^>]+>/g, '') : ''}
                  </p>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                    <span className="text-sm text-gray-300 font-medium">
                      {course.instructor_name || 'TRUSTERLABS Ltd.'}
                    </span>
                    <span className="text-[#D4AF37] font-bold">
                      {course.is_free ? 'Free' : (course.price ? `$${course.price}` : 'Premium')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center md:hidden">
          <Link to="/courses" className="inline-flex items-center text-[#D4AF37] hover:text-white font-bold transition-colors">
            View All Courses <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Home;
