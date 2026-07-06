import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card, { CardContent, CardTitle, CardFooter } from '../../components/common/Card';
import { PlayCircle, Code, ShieldCheck, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 animate-fade-in-up">
            Master Skills with <span className="text-primary block mt-2">Project-Based Learning</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto mb-10">
            Learn. Build. Innovate. Join Truster Lab to elevate your career through hands-on, real-world projects crafted by industry experts.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-primary/20">
                Start Learning for Free
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white">
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Project-Based Learning */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why Choose Truster Lab?</h2>
            <p className="mt-4 text-lg text-slate-500">We focus on what matters: building real things.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code className="text-primary w-8 h-8" />}
              title="Hands-on Projects"
              description="Build a portfolio of real-world applications as you learn, not just theory."
            />
            <FeatureCard 
              icon={<Zap className="text-secondary w-8 h-8" />}
              title="Fast-Track Career"
              description="Learn exactly what employers are looking for with up-to-date curricula."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-success w-8 h-8" />}
              title="Expert Instructors"
              description="Learn from senior developers and industry veterans who've been there."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <Card hoverable className="border-none shadow-md">
    <CardContent className="flex flex-col items-center text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
        {icon}
      </div>
      <CardTitle className="mb-4">{title}</CardTitle>
      <p className="text-slate-500">{description}</p>
    </CardContent>
  </Card>
);

export default Home;
