import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../../components/common/Card';
import { 
  GraduationCap, Users, BookOpen, DollarSign, 
  ChevronDown, ArrowUp, ArrowRight, Activity, 
  AlertCircle, Info, Database, Plus, FilePlus, BarChart2, ArrowLeft
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
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    courses: 0,
    modules: 0,
    lessons: 0,
    enquiries: 0,
  });
  const [dashboardData, setDashboardData] = useState({
    chartData: [],
    topCourses: [],
    total_enrollments: 0,
    new_enrollments: 0,
    total_learners: 0,
    total_instructors: 0,
    total_courses: 0,
    total_revenue: 0
  });
  const [timeFilter, setTimeFilter] = useState('month');
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    try {
      await apiClient.post('/settings/system-alerts/trigger_backup/');
      // Refetch the stats to update the alert card to green
      const dashboardStatsRes = await apiClient.get(`/settings/dashboard-stats/?filter=${timeFilter}`).catch(() => null);
      if (dashboardStatsRes) {
        const dData = dashboardStatsRes.data || dashboardStatsRes;
        setSystemAlerts(dData.system_alerts || []);
      }
    } catch (error) {
      console.error("Failed to trigger backup", error);
      const serverError = error.response?.data?.error || "Unknown server error";
      alert(`Backup failed: ${serverError}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // We now fetch EVERYTHING in one optimized call!
        const dashboardStatsRes = await apiClient.get(`/settings/dashboard-stats/?filter=${timeFilter}`).catch(() => null);
        
        if (dashboardStatsRes) {
          const dData = dashboardStatsRes.data || dashboardStatsRes;
          
          setStats({
            courses: dData.total_courses || 0,
            modules: dData.total_modules || 0,
            lessons: dData.total_lessons || 0,
            enquiries: dData.total_enquiries || 0,
          });

          setDashboardData({
            chartData: dData.chartData || [],
            topCourses: dData.topCourses || [],
            total_enrollments: dData.total_enrollments || 0,
            new_enrollments: dData.new_enrollments || 0,
            total_learners: dData.total_learners || 0,
            total_instructors: dData.total_instructors || 0,
            total_courses: dData.total_courses || 0,
            total_revenue: dData.total_revenue || 0
          });
          
          setRecentActivities(dData.recent_notifications || []);
          setSystemAlerts(dData.system_alerts || []);
          setRecentVisitors(dData.recent_visitors || []);
        }
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [timeFilter]);

  if (isLoading && Object.keys(dashboardData).length > 0 && dashboardData.total_learners === 0 && dashboardData.total_courses === 0) {
    return (
      <div className="w-full min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-slate-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-semibold tracking-wide">Synchronizing with Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 pb-12 pt-4 relative">
      
      {/* Loading overlay for timeFilter changes */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} />
          Back to Home Page
        </button>
      </div>

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
                  <p 
                    className="text-slate-500 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigate('/superadmin/entity/learners')}
                  >
                    Total Learners
                  </p>
                  <button className="text-slate-400 hover:text-slate-600"><span className="text-[10px]">•••</span></button>
                </div>
                <h3 className="text-3xl font-black text-slate-800">{dashboardData.total_learners.toLocaleString()}</h3>
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
                  <p 
                    className="text-slate-500 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-purple-600 transition-colors"
                    onClick={() => navigate('/superadmin/entity/instructors')}
                  >
                    Active Instructors
                  </p>
                  <button className="text-slate-400 hover:text-slate-600"><span className="text-[10px]">•••</span></button>
                </div>
                <h3 className="text-3xl font-black text-slate-800">{dashboardData.total_instructors.toLocaleString()}</h3>
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
                  <p 
                    className="text-slate-500 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-emerald-600 transition-colors"
                    onClick={() => navigate('/superadmin/entity/courses')}
                  >
                    Published Courses
                  </p>
                  <button className="text-slate-400 hover:text-slate-600"><span className="text-[10px]">•••</span></button>
                </div>
                <h3 className="text-3xl font-black text-slate-800">{dashboardData.total_courses.toLocaleString()}</h3>
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
                  <p 
                    className="text-slate-500 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
                    onClick={() => navigate('/superadmin/entity/payments')}
                  >
                    Revenue
                  </p>
                  <button className="text-slate-400 hover:text-slate-600"><span className="text-[10px]">•••</span></button>
                </div>
                <h3 className="text-3xl font-black text-slate-800">${dashboardData.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
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
                {dashboardData.chartData && dashboardData.chartData.length > 0 ? (
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
                ) : (
                  <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <BarChart2 size={32} className="mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">No enrollment data for this period</p>
                    <p className="text-xs mt-1 text-slate-400">The chart will appear once students enroll.</p>
                  </div>
                )}
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
                <div className="w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 py-8 my-auto">
                  <Activity size={24} className="mb-2 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">No recent activity</p>
                  <p className="text-xs mt-1 text-slate-400">Events will appear here.</p>
                </div>
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
                
                const isBackupAlert = alert.id === 3;
                const showCursor = isBackupAlert && alert.type === 'warning';
                
                return (
                  <div 
                    key={alert.id} 
                    onClick={showCursor && !isBackingUp ? handleTriggerBackup : undefined}
                    className={`flex gap-4 p-4 rounded-xl ${bgClass} ${showCursor ? 'cursor-pointer hover:shadow-md transition-all' : ''} ${isBackingUp && isBackupAlert ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isBackingUp && isBackupAlert ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      ) : (
                        <IconComp size={20} className={iconClass} />
                      )}
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
                <div className="w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 py-8 my-auto">
                  <AlertCircle size={24} className="mb-2 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">No active alerts</p>
                  <p className="text-xs mt-1 text-slate-400">System status is normal.</p>
                </div>
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

      {/* Website Visitors */}
      <div className="mt-6">
        <Card className="border border-slate-100 shadow-sm rounded-xl bg-white flex flex-col">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Recent Website Visitors</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">IP Address</th>
                    <th className="px-4 py-3 font-semibold">Path Visited</th>
                    <th className="px-4 py-3 font-semibold">Device / User Agent</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisitors.slice(0, 10).map((visitor) => (
                    <tr key={visitor.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-700">{visitor.ip_address || 'Unknown'}</td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-xs">{visitor.path || '/'}</td>
                      <td className="px-4 py-3 text-slate-500 truncate max-w-sm">{visitor.user_agent ? visitor.user_agent.substring(0, 50) + (visitor.user_agent.length > 50 ? '...' : '') : 'Unknown'}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(visitor.visited_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {recentVisitors.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-slate-500">No recent visitors logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
