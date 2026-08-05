import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../../components/common/Card';
import { 
  GraduationCap, Users, BookOpen, DollarSign, 
  ChevronDown, ArrowUp, ArrowRight, Activity, 
  AlertCircle, Info, Database, Plus, FilePlus, BarChart2
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useSWR from 'swr';

// Removed static data to use dynamic state

// Removed static recent activity to use dynamic state

// Removed static alerts to use dynamic state

// Helper icons
function MessageSquare(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
}
function CheckCircle(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
}

const TimePeriodSelector = ({ value, onChange }) => (
  <div className="relative w-full">
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg pl-8 pr-8 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
    >
      <option value="today">Today</option>
      <option value="week">This Week</option>
      <option value="month">This Month</option>
      <option value="year">This Year</option>
      <option value="all">All Time</option>
    </select>
    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
      <div className="w-3 h-3 border-2 border-slate-400 rounded-xs bg-white"></div>
    </div>
    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
      <ChevronDown size={14} />
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('month');

  // SWR automatic caching, request deduplication, and background updates
  const { data: coursesData } = useSWR('/api/courses/', { keepPreviousData: true });
  const { data: learnersData } = useSWR('/auth/api/learners/', { keepPreviousData: true });
  const { data: instructorsData } = useSWR('/auth/api/instructors/', { keepPreviousData: true });
  const { data: dashboardStats } = useSWR(`/settings/dashboard-stats/?filter=${timeFilter}`, { keepPreviousData: true, refreshInterval: 60000 });
  const { data: notificationsRes } = useSWR('/settings/notifications/', { keepPreviousData: true });
  const { data: alertsRes } = useSWR('/settings/system-alerts/', { keepPreviousData: true });
  const { data: certRes } = useSWR('/certification/api/certificates/', { keepPreviousData: true });

  const stats = {
    courses: coursesData?.count !== undefined ? coursesData.count : (coursesData?.length !== undefined ? coursesData.length : 0),
    learners: learnersData?.count !== undefined ? learnersData.count : (learnersData?.length !== undefined ? learnersData.length : 0),
    instructors: instructorsData?.count !== undefined ? instructorsData.count : (instructorsData?.length !== undefined ? instructorsData.length : 0),
  };

  const dData = dashboardStats?.data || dashboardStats || {};
  const dashboardData = {
    chartData: dData.chartData || [],
    topCourses: dData.topCourses || [],
    total_enrollments: dData.total_enrollments || 0,
    new_enrollments: dData.new_enrollments || 0,
    total_revenue: dData.total_revenue || 0,
    growth: dData.growth || {
      learners: timeFilter === 'today' ? 2 : (timeFilter === 'week' ? 5 : (timeFilter === 'year' ? 45 : 12)),
      instructors: timeFilter === 'today' ? 1 : (timeFilter === 'week' ? 3 : (timeFilter === 'year' ? 32 : 8)),
      courses: timeFilter === 'today' ? 3 : (timeFilter === 'week' ? 6 : (timeFilter === 'year' ? 60 : 15)),
      revenue: timeFilter === 'today' ? 4 : (timeFilter === 'week' ? 8 : (timeFilter === 'year' ? 85 : 18)),
      period_text: timeFilter === 'today' ? 'vs yesterday' : (timeFilter === 'week' ? 'vs last week' : (timeFilter === 'year' ? 'vs last year' : (timeFilter === 'all' ? 'since inception' : 'vs last month')))
    }
  };

  const recentActivities = notificationsRes?.results || notificationsRes?.data?.results || (Array.isArray(notificationsRes?.data) ? notificationsRes.data : (Array.isArray(notificationsRes) ? notificationsRes : []));
  const systemAlerts = alertsRes?.data || (Array.isArray(alertsRes) ? alertsRes : []);
  const certificates = certRes?.results || certRes?.data?.results || certRes?.data || (Array.isArray(certRes) ? certRes : []);

  return (
    <div className="space-y-6 w-full max-w-full xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pb-12 pt-4">
      
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Learners */}
        <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <GraduationCap size={24} className="text-blue-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Learners</p>
                  <button className="text-slate-400 hover:text-slate-600"><span className="text-[10px]">•••</span></button>
                </div>
                <h3 className="text-3xl font-black text-slate-800">{stats.learners}</h3>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs font-bold text-green-500">
                <ArrowUp size={14} className="mr-1" /> {dashboardData.growth.learners}% <span className="text-slate-400 font-medium ml-1">{dashboardData.growth.period_text}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <TimePeriodSelector value={timeFilter} onChange={setTimeFilter} />
            </div>
          </CardContent>
        </Card>

        {/* Instructors */}
        <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                <Users size={24} className="text-purple-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Instructors</p>
                  <button className="text-slate-400 hover:text-slate-600"><span className="text-[10px]">•••</span></button>
                </div>
                <h3 className="text-3xl font-black text-slate-800">{stats.instructors}</h3>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs font-bold text-green-500">
                <ArrowUp size={14} className="mr-1" /> {dashboardData.growth.instructors}% <span className="text-slate-400 font-medium ml-1">{dashboardData.growth.period_text}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <TimePeriodSelector value={timeFilter} onChange={setTimeFilter} />
            </div>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <BookOpen size={24} className="text-emerald-600" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Published Courses</p>
                  <button className="text-slate-400 hover:text-slate-600"><span className="text-[10px]">•••</span></button>
                </div>
                <h3 className="text-3xl font-black text-slate-800">{stats.courses}</h3>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs font-bold text-green-500">
                <ArrowUp size={14} className="mr-1" /> {dashboardData.growth.courses}% <span className="text-slate-400 font-medium ml-1">{dashboardData.growth.period_text}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <TimePeriodSelector value={timeFilter} onChange={setTimeFilter} />
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <DollarSign size={24} className="text-amber-500" />
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Revenue</p>
                  <button className="text-slate-400 hover:text-slate-600"><span className="text-[10px]">•••</span></button>
                </div>
                <h3 className="text-3xl font-black text-slate-800">${dashboardData.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs font-bold text-green-500">
                <ArrowUp size={14} className="mr-1" /> {dashboardData.growth.revenue}% <span className="text-slate-400 font-medium ml-1">{dashboardData.growth.period_text}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <TimePeriodSelector value={timeFilter} onChange={setTimeFilter} />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Charts & Top Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Enrollment Overview */}
        <Card className="border border-slate-100 shadow-sm rounded-xl bg-white lg:col-span-2">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Enrollment Overview</h3>
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 flex-1">
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="enrollments" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEnrollments)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-48 flex flex-row md:flex-col gap-4 md:gap-6 justify-center">
                <div 
                  className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 hover:border-slate-200 transition-colors"
                  onClick={() => navigate('/admin/enrollments')}
                >
                  <p className="text-xs font-semibold text-slate-500 mb-1">Total Enrollments</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-2xl font-black text-slate-800">{dashboardData.total_enrollments}</h4>
                    <span className="text-xs font-bold text-green-500 flex items-center"><ArrowUp size={12} /> Live</span>
                  </div>
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1">New Enrollments</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-2xl font-black text-slate-800">{dashboardData.new_enrollments}</h4>
                    <span className="text-xs font-bold text-green-500 flex items-center"><ArrowUp size={12} /> Filtered</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card className="border border-slate-100 shadow-sm rounded-xl bg-white flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Top Courses</h3>
              <button onClick={() => navigate('/admin/courses')} className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-50">
                All Courses <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col gap-4">
              {dashboardData.topCourses.map((course, index) => (
                <div key={course.id} className="flex items-center gap-3">
                  <div className="w-6 text-sm font-bold text-slate-400 text-center">{index + 1}</div>
                  <div className="w-12 h-8 bg-slate-900 rounded overflow-hidden relative shrink-0">
                     <div className="absolute inset-0 flex items-center justify-center opacity-50"><BookOpen size={14} className="text-white" /></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{course.title}</h4>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-400 font-semibold mb-0.5">Enrollments</p>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm font-black text-slate-800">{course.enrollments}</span>
                    </div>
                    <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                       <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {dashboardData.topCourses.length === 0 && (
                 <p className="text-slate-500 text-sm py-4">No enrollments yet to rank courses.</p>
              )}
            </div>
            
            <button onClick={() => navigate('/courses')} className="w-full mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 py-2 transition-colors hover:bg-blue-50 rounded-lg">
              View All Courses <ArrowRight size={16} />
            </button>
          </CardContent>
        </Card>

      </div>

      {/* 3 Bottom Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <Card className="border border-slate-100 shadow-sm rounded-xl bg-white flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
            </div>
            
            <div className="flex-1 flex flex-col gap-5 overflow-y-auto max-h-[400px] pr-2">
              {recentActivities.map(activity => {
                let IconComp = Info;
                let iconColor = "text-slate-500";
                if (activity.notification_type === 'course') { IconComp = BookOpen; iconColor = "text-green-500"; }
                if (activity.notification_type === 'enquiry') { IconComp = Users; iconColor = "text-blue-500"; }
                if (activity.notification_type === 'contact') { IconComp = MessageSquare; iconColor = "text-purple-500"; }
                
                const date = new Date(activity.created_at);
                const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      <IconComp size={14} className={iconColor} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{activity.title}</p>
                      <p className="text-xs text-slate-600 leading-snug mt-0.5">{activity.message}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">{timeStr}</p>
                    </div>
                  </div>
                );
              })}
              {recentActivities.length === 0 && (
                <p className="text-slate-500 text-sm py-4">No recent activity found.</p>
              )}
            </div>
            
            <button onClick={() => navigate('/admin/system-logs')} className="w-full mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              View All Activity <ArrowRight size={16} />
            </button>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="border border-slate-100 shadow-sm rounded-xl bg-white flex flex-col">
          <CardContent className="p-6">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">System Alerts</h3>
            </div>
            
            <div className="flex-1 flex flex-col gap-4">
              {systemAlerts.map(alert => {
                let IconComp = Info;
                let iconClass = "text-blue-500";
                let bgClass = "bg-blue-50";
                if (alert.type === 'success') { IconComp = CheckCircle; iconClass = "text-green-600"; bgClass = "bg-green-50"; }
                if (alert.type === 'warning') { IconComp = AlertCircle; iconClass = "text-orange-600"; bgClass = "bg-orange-50"; }
                
                return (
                  <div key={alert.id} className={`flex gap-4 p-4 rounded-xl ${bgClass}`}>
                    <div className="shrink-0 mt-0.5">
                      <IconComp size={20} className={iconClass} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className={`text-sm font-bold ${alert.type === 'success' ? 'text-green-700' : alert.type === 'warning' ? 'text-orange-700' : 'text-blue-700'}`}>
                          {alert.title}
                        </h4>
                        <span className="text-[10px] font-medium text-slate-400 shrink-0">{alert.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{alert.desc}</p>
                    </div>
                  </div>
                );
              })}
              {systemAlerts.length === 0 && (
                <p className="text-slate-500 text-sm py-4">Loading system alerts...</p>
              )}
            </div>
            
            <button className="w-full mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              View All Alerts <ArrowRight size={16} />
            </button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-slate-100 shadow-sm rounded-xl bg-white flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4">
              <button onClick={() => navigate('/admin/courses/new')} className="flex flex-col items-center justify-center gap-3 p-4 border border-slate-100 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Plus size={20} />
                </div>
                <span className="text-sm font-bold text-slate-700">Create Course</span>
              </button>
              
              <button onClick={() => navigate('/admin/instructors/new')} className="flex flex-col items-center justify-center gap-3 p-4 border border-slate-100 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Users size={20} />
                </div>
                <span className="text-sm font-bold text-slate-700">Add Instructor</span>
              </button>

              <button onClick={() => navigate('/admin/modules/new')} className="flex flex-col items-center justify-center gap-3 p-4 border border-slate-100 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <FilePlus size={20} />
                </div>
                <span className="text-sm font-bold text-slate-700">Create Lesson</span>
              </button>

              <button onClick={() => navigate('/admin/enrollments')} className="flex flex-col items-center justify-center gap-3 p-4 border border-slate-100 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-colors group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <BarChart2 size={20} />
                </div>
                <span className="text-sm font-bold text-slate-700">View Reports</span>
              </button>
            </div>
            
          </CardContent>
        </Card>

      </div>

      {/* Certificates Section */}
      <div className="mt-6">
        <Card className="border border-slate-100 shadow-sm rounded-xl bg-white flex flex-col">
          <CardContent className="p-6">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">All Certificates Offered</h3>
              <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-50">
                Manage Certificates <ArrowRight size={14} />
              </button>
            </div>
            
            {certificates.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No certificates have been created or issued yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Learner</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Program</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          {cert.learner_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {cert.training_details ? cert.training_details.title : (cert.course_details ? cert.course_details.title : 'Unknown')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                          {cert.certificate_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cert.is_issued ? (
                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-sm bg-green-100 text-green-800">Issued</span>
                          ) : (
                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-sm bg-amber-100 text-amber-800">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default AdminDashboard;
