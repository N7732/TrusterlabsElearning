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

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    courses: 54,
    modules: 0,
    lessons: 0,
    enquiries: 0,
  });
  const [dashboardData, setDashboardData] = useState({
    chartData: [],
    topCourses: [],
    total_enrollments: 0,
    new_enrollments: 0
  });
  const [timeFilter, setTimeFilter] = useState('month');
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    // Quick fetches to get counts
    const fetchStats = async () => {
      try {
        const [cRes, mRes, lRes, eRes, dashboardStats, notificationsRes, alertsRes] = await Promise.all([
          apiClient.get('/api/courses/').catch(() => null),
          apiClient.get('/api/modules/').catch(() => null),
          apiClient.get('/api/lessons/').catch(() => null),
          apiClient.get('/enquiry/').catch(() => null),
          apiClient.get(`/settings/dashboard-stats/?filter=${timeFilter}`).catch(() => null),
          apiClient.get('/settings/notifications/').catch(() => null),
          apiClient.get('/settings/system-alerts/').catch(() => null),
        ]);
        
        setStats({
          courses: cRes?.length || cRes?.results?.length || 54,
          modules: mRes?.length || mRes?.results?.length || 0,
          lessons: lRes?.length || lRes?.results?.length || 0,
          enquiries: eRes?.length || eRes?.results?.length || 0,
        });

        if (dashboardStats && dashboardStats.data) {
          setDashboardData({
            chartData: dashboardStats.data.chartData || [],
            topCourses: dashboardStats.data.topCourses || [],
            total_enrollments: dashboardStats.data.total_enrollments || 0,
            new_enrollments: dashboardStats.data.new_enrollments || 0
          });
        }
        
        if (notificationsRes) {
          const notifs = notificationsRes.data?.results || notificationsRes.data || [];
          setRecentActivities(notifs.slice(0, 5));
        }
        
        if (alertsRes && alertsRes.data) {
          setSystemAlerts(alertsRes.data);
        }
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };
    fetchStats();
  }, [timeFilter]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      
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
                <h3 className="text-3xl font-black text-slate-800">1,248</h3>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs font-bold text-green-500">
                <ArrowUp size={14} className="mr-1" /> 12% <span className="text-slate-400 font-medium ml-1">vs last month</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 border border-slate-400 rounded-sm"></div> This Month</div>
                <ChevronDown size={14} />
              </button>
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
                <h3 className="text-3xl font-black text-slate-800">86</h3>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs font-bold text-green-500">
                <ArrowUp size={14} className="mr-1" /> 8% <span className="text-slate-400 font-medium ml-1">vs last month</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 border border-slate-400 rounded-sm"></div> This Month</div>
                <ChevronDown size={14} />
              </button>
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
                <ArrowUp size={14} className="mr-1" /> 15% <span className="text-slate-400 font-medium ml-1">vs last month</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 border border-slate-400 rounded-sm"></div> This Month</div>
                <ChevronDown size={14} />
              </button>
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
                <h3 className="text-3xl font-black text-slate-800">$12,540</h3>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs font-bold text-green-500">
                <ArrowUp size={14} className="mr-1" /> 18% <span className="text-slate-400 font-medium ml-1">vs last month</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 border border-slate-400 rounded-sm"></div> This Month</div>
                <ChevronDown size={14} />
              </button>
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
              
              <div className="w-full md:w-48 flex flex-col gap-6 justify-center">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Total Enrollments</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-2xl font-black text-slate-800">{dashboardData.total_enrollments}</h4>
                    <span className="text-xs font-bold text-green-500 flex items-center"><ArrowUp size={12} /> Live</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
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
              <button onClick={() => navigate('/superadmin/entity/courses')} className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-50">
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
            
            <div className="flex-1 flex flex-col gap-5">
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
            
            <button onClick={() => navigate('/superadmin/entity/notifications')} className="w-full mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              View All Activity <ArrowRight size={16} />
            </button>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="border border-slate-100 shadow-sm rounded-xl bg-white flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
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
            
            <button onClick={() => navigate('/superadmin')} className="w-full mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
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
    </div>
  );
};

export default SuperAdminDashboard;
