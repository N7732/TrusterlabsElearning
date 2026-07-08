import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../../components/common/Card';
import { 
  GraduationCap, Users, BookOpen, Activity, 
  AlertCircle, Book, Calendar
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    modules: 0,
    trainings: 0,
    enquiries: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [cRes, mRes, tRes, eRes] = await Promise.all([
          apiClient.get('/api/courses/?my_courses=true').catch(() => null),
          apiClient.get('/api/modules/?my_modules=true').catch(() => null),
          apiClient.get('/api/training/trainings/?my_trainings=true').catch(() => null),
          apiClient.get('/api/enquiry/requirement/?my_enquiries=true').catch(() => null),
        ]);

        setStats({
          courses: cRes?.results?.length || cRes?.length || 0,
          modules: mRes?.results?.length || mRes?.length || 0,
          trainings: tRes?.results?.length || tRes?.length || 0,
          enquiries: eRes?.results?.length || eRes?.length || 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'My Courses', value: stats.courses, icon: <BookOpen size={24} className="text-blue-500" />, trend: '+2 this month', link: '/instructor/entity/courses' },
    { title: 'My Modules', value: stats.modules, icon: <Book size={24} className="text-green-500" />, trend: 'Active curriculum', link: '/instructor/entity/modules' },
    { title: 'My Trainings', value: stats.trainings, icon: <Calendar size={24} className="text-purple-500" />, trend: 'Scheduled sessions', link: '/instructor/entity/trainings' },
    { title: 'Course Enquiries', value: stats.enquiries, icon: <Users size={24} className="text-orange-500" />, trend: 'Needs review', link: '/instructor/entity/enquiries' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, {user?.first_name || 'Instructor'}! 👋</h2>
          <p className="text-slate-500">Here's what's happening with your courses today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(stat.link)}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-xl">{stat.icon}</div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Activity size={20} className="mr-2 text-blue-500" /> Quick Actions
            </h3>
            <div className="space-y-3">
              <button onClick={() => navigate('/instructor/entity/courses/new')} className="w-full text-left p-3 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-3">
                  <BookOpen size={16} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Create New Course</p>
                  <p className="text-xs text-slate-500">Start building a new course curriculum</p>
                </div>
              </button>
              <button onClick={() => navigate('/instructor/entity/trainings/new')} className="w-full text-left p-3 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-3">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Schedule Training</p>
                  <p className="text-xs text-slate-500">Set up a new live training session</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <AlertCircle size={20} className="mr-2 text-orange-500" /> Notifications
            </h3>
            <div className="text-center py-8 text-slate-500">
              <p>You have {stats.enquiries} pending enquiries to review.</p>
              {stats.enquiries > 0 && (
                <button 
                  onClick={() => navigate('/instructor/entity/enquiries')}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Review Enquiries &rarr;
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorDashboard;
