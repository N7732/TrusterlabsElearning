import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { 
  Activity, DollarSign, BookOpen, Layers, Users, ChevronRight, Settings, Download, Plus, AlertCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { format } from 'date-fns';
import { apiClient } from '../../../api/apiClient';

const fetcher = (url) => apiClient.get(url);

const FinancialOverview = () => {
  const [timeFilter, setTimeFilter] = useState('monthly'); // weekly, monthly, yearly
  const [activeTab, setActiveTab] = useState('overview'); // overview, courses, negotiations, settings

  const { data: overviewData, error: overviewError, isLoading: overviewLoading } = useSWR('/api/v1/finance/overview/', fetcher);
  const { data: coursesData, error: coursesError, isLoading: coursesLoading } = useSWR('/api/v1/finance/courses/', fetcher);
  const { data: negotiationsData, error: negotiationsError, isLoading: negotiationsLoading } = useSWR('/api/v1/finance/negotiations/', fetcher);
  const { data: siteSettings, error: settingsError, isLoading: settingsLoading } = useSWR('/settings/site-settings/1/', fetcher);

  const [newNegotiation, setNewNegotiation] = useState({ amount: '', reason: '', date: '', notes: '' });
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: false });

  const handleNegotiationSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, error: null, success: false });
    try {
      await apiClient.post('/api/v1/finance/negotiations/', newNegotiation);
      setSubmitStatus({ loading: false, error: null, success: true });
      setNewNegotiation({ amount: '', reason: '', date: '', notes: '' });
      mutate('/api/v1/finance/negotiations/');
      mutate('/api/v1/finance/overview/');
    } catch (err) {
      setSubmitStatus({ loading: false, error: err.response?.data?.detail || 'Failed to submit', success: false });
    }
  };

  if (overviewLoading || coursesLoading || settingsLoading || negotiationsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Activity className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (overviewError || coursesError || negotiationsError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
        Error loading financial data. Please try again.
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const getChartData = () => {
    if (!overviewData) return [];
    return overviewData[timeFilter].map(item => ({
      date: format(new Date(item.period), timeFilter === 'yearly' ? 'yyyy' : timeFilter === 'monthly' ? 'MMM yyyy' : 'MMM d, yyyy'),
      amount: parseFloat(item.total)
    }));
  };

  const chartData = getChartData();

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Income Overview
        </button>
        <button 
          onClick={() => setActiveTab('courses')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'courses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Course Income
        </button>
        <button 
          onClick={() => setActiveTab('negotiations')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'negotiations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Negotiated Income
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          API Settings
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <DollarSign size={24} />
              </div>
              <p className="text-slate-500 font-medium mb-1">Total Platform Income</p>
              <h3 className="text-3xl font-black text-slate-900">{formatCurrency(overviewData?.total_income || 0)}</h3>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Income Curves</h3>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setTimeFilter('weekly')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${timeFilter === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setTimeFilter('monthly')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${timeFilter === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setTimeFilter('yearly')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${timeFilter === 'yearly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Yearly
                </button>
              </div>
            </div>
            
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}} 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [formatCurrency(value), 'Income']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 font-medium">
                  No income data available for this timeframe.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Course Income Report</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course</th>
                  <th className="pb-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="pb-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Enrollments</th>
                  <th className="pb-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coursesData && coursesData.map((course) => (
                  <tr key={course.course_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <BookOpen size={16} />
                      </div>
                      {course.title}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">
                      {course.price ? formatCurrency(course.price) : 'Free'}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600 text-center">
                      {course.enrollments}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-emerald-600 text-right">
                      {formatCurrency(course.total_income)}
                    </td>
                  </tr>
                ))}
                {(!coursesData || coursesData.length === 0) && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500 font-medium">No courses available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'negotiations' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Record Negotiated Income</h3>
              <p className="text-sm text-slate-500 mb-6">
                Securely log income generated outside the platform (e.g., enterprise deals). 
                <span className="font-bold text-rose-500 ml-1">Note: This record is immutable and cannot be deleted or altered once saved.</span>
              </p>
              
              <form onSubmit={handleNegotiationSubmit} className="space-y-4 max-w-md">
                {submitStatus.error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{submitStatus.error}</span>
                  </div>
                )}
                {submitStatus.success && (
                  <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg">
                    Record securely saved.
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (USD) *</label>
                  <input type="number" step="0.01" required value={newNegotiation.amount} onChange={e => setNewNegotiation({...newNegotiation, amount: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date *</label>
                  <input type="date" required value={newNegotiation.date} onChange={e => setNewNegotiation({...newNegotiation, date: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Reason/Client Name *</label>
                  <input type="text" required value={newNegotiation.reason} onChange={e => setNewNegotiation({...newNegotiation, reason: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. Enterprise License Deal" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Additional Notes</label>
                  <textarea rows="3" value={newNegotiation.notes} onChange={e => setNewNegotiation({...newNegotiation, notes: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Optional details..." />
                </div>
                <button type="submit" disabled={submitStatus.loading} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex justify-center items-center">
                  {submitStatus.loading ? <Activity className="animate-spin mr-2" size={18} /> : <Plus className="mr-2" size={18} />}
                  Record Income Securely
                </button>
              </form>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Past Negotiations</h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {negotiationsData && negotiationsData.length > 0 ? (
                  negotiationsData.map(neg => (
                    <div key={neg.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-800">{neg.reason}</h4>
                        <p className="text-xs text-slate-500 mt-1">{format(new Date(neg.date), 'MMM d, yyyy')} • {neg.notes || 'No notes'}</p>
                      </div>
                      <span className="font-black text-emerald-600 text-lg">
                        {formatCurrency(neg.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No recorded negotiations yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in max-w-3xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Settings size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">External API Integration</h3>
              <p className="text-sm text-slate-500 mt-1">
                Provide these details to the Trusterlabs Financial Department so they can access platform income records securely.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">API Endpoint URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={`${import.meta.env.VITE_API_BASE_URL || window.location.origin}/api/v1/finance/external/`} 
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-mono text-slate-700 outline-none"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(`${import.meta.env.VITE_API_BASE_URL || window.location.origin}/api/v1/finance/external/`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">X-API-Key Header (Secret)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={siteSettings?.external_finance_api_key || 'Not Generated. Go to Site Settings to generate.'} 
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-mono text-slate-700 outline-none"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(siteSettings?.external_finance_api_key || '')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Instruct the financial department to include <code className="bg-slate-200 px-1 py-0.5 rounded text-rose-600">X-API-Key: &lt;secret_key&gt;</code> in their HTTP request headers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialOverview;
