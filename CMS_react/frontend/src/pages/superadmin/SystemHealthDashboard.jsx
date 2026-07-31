import React, { useState, useEffect } from 'react';
import { 
  Activity, Server, Database, HardDrive, Mail, ShieldAlert,
  DownloadCloud, UploadCloud, CheckCircle, AlertTriangle, XCircle, RefreshCw, AlertCircle, Clock
} from 'lucide-react';
import apiClient from '../../../services/apiClient';
import { useAuth } from '../../../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';

const SystemHealthDashboard = () => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  const fetchHealthData = async () => {
    try {
      setRefreshing(true);
      const response = await apiClient.get('/settings/system-health/');
      setHealthData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching system health', err);
      setError('Failed to fetch system health data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const handleTriggerBackup = async () => {
    try {
      setBackupLoading(true);
      const res = await apiClient.post('/settings/system-health/trigger_backup/');
      alert(res.data.message || 'Backup generated successfully');
      fetchHealthData();
    } catch (err) {
      alert('Failed to generate backup: ' + (err.response?.data?.error || err.message));
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (filename) => {
    if (!window.confirm(`Are you sure you want to restore backup ${filename}? This will OVERWRITE existing data and CANNOT be undone.`)) return;
    
    try {
      const res = await apiClient.post('/settings/system-health/restore_backup/', { filename });
      alert(res.data.message || 'Backup restored successfully');
    } catch (err) {
      alert('Failed to restore backup: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleTestEmail = async () => {
    if (!user?.email) return alert('No email found for current user.');
    try {
      setTestEmailLoading(true);
      const res = await apiClient.post('/settings/system-health/test_email/', { email: user.email });
      alert(res.data.message || 'Test email sent successfully');
    } catch (err) {
      alert('Failed to send test email: ' + (err.response?.data?.error || err.message));
    } finally {
      setTestEmailLoading(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-white bg-[#0f172a]">Loading system health...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500 bg-[#0f172a]">{error}</div>;

  const { snapshot, recent_errors, backups, version } = healthData;

  const getStatusColor = (status) => status ? 'text-green-400' : 'text-red-400';
  const getProgressColor = (percent) => {
    if (percent < 70) return 'bg-blue-500';
    if (percent < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const score = snapshot ? Math.max(0, 100 - (snapshot.cpu_usage > 90 ? 20 : 0) - (snapshot.memory_usage > 90 ? 20 : 0) - (snapshot.disk_usage > 90 ? 20 : 0) - (!snapshot.db_status ? 50 : 0)) : 0;
  
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="text-blue-500" /> System Health & Maintenance
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time monitoring and administrative tools</p>
          </div>
          <button 
            onClick={fetchHealthData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-blue-400' : ''} /> 
            {refreshing ? 'Refreshing...' : 'Refresh Snapshot'}
          </button>
        </div>

        {/* Overall Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <p className="text-slate-400 text-sm font-medium mb-1">Health Score</p>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${score > 80 ? 'text-green-400' : score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {score}%
              </span>
            </div>
          </div>
          
          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group">
            <p className="text-slate-400 text-sm font-medium mb-1">Last Checked</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">
                {snapshot ? formatDistanceToNow(new Date(snapshot.created_at), { addSuffix: true }) : 'Never'}
              </span>
            </div>
          </div>

          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group">
            <p className="text-slate-400 text-sm font-medium mb-1">Django Version</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-indigo-400">{version.django}</span>
            </div>
          </div>

          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group">
            <p className="text-slate-400 text-sm font-medium mb-1">Python Version</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-purple-400">{version.python}</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Server Resources */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Resource Panel */}
            <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 shadow-lg">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Server size={20} className="text-blue-400" /> Server Resources
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">CPU Usage</span>
                    <span className="font-mono">{snapshot?.cpu_usage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getProgressColor(snapshot?.cpu_usage || 0)}`} style={{ width: `${snapshot?.cpu_usage || 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">Memory Usage</span>
                    <span className="font-mono">{snapshot?.memory_usage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getProgressColor(snapshot?.memory_usage || 0)}`} style={{ width: `${snapshot?.memory_usage || 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">Disk Usage</span>
                    <span className="font-mono">{snapshot?.disk_usage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getProgressColor(snapshot?.disk_usage || 0)}`} style={{ width: `${snapshot?.disk_usage || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Monitoring */}
            <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShieldAlert size={20} className="text-red-400" /> Error Log (Last 10)
                </h2>
              </div>
              
              {recent_errors.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle className="mx-auto mb-2 text-green-500/50" size={32} />
                  No recent application errors.
                </div>
              ) : (
                <div className="space-y-3">
                  {recent_errors.map((error, idx) => (
                    <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-red-900/30 flex gap-4">
                      <AlertCircle className="text-red-400 shrink-0 mt-1" size={18} />
                      <div className="min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-sm font-semibold text-red-200 truncate">{error.path}</p>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{formatDistanceToNow(new Date(error.created_at), { addSuffix: true })}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-mono bg-black/20 p-2 rounded">{error.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Database & Email Status */}
            <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 shadow-lg space-y-6">
              
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Database size={16} /> Database Health
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-slate-300">Connectivity</span>
                    {snapshot?.db_status ? <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded"><CheckCircle size={12}/> Connected</span> : <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded"><XCircle size={12}/> Failed</span>}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-slate-300">Response Time</span>
                    <span className="text-sm font-mono text-blue-400">{snapshot?.db_response_time ? snapshot.db_response_time.toFixed(2) : 0} ms</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Mail size={16} /> Email Service
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-slate-300">SMTP Status</span>
                    {snapshot?.smtp_status ? <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded"><CheckCircle size={12}/> OK</span> : <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded"><XCircle size={12}/> Failed</span>}
                  </div>
                  <button 
                    onClick={handleTestEmail}
                    disabled={testEmailLoading}
                    className="w-full mt-2 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {testEmailLoading ? <RefreshCw size={14} className="animate-spin" /> : <Mail size={14} />}
                    {testEmailLoading ? 'Sending...' : 'Send Test Email'}
                  </button>
                </div>
              </div>

            </div>

            {/* Backup & Restore */}
            <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <HardDrive size={20} className="text-cyan-400" /> Backups
                </h2>
                <button 
                  onClick={handleTriggerBackup}
                  disabled={backupLoading}
                  className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors tooltip tooltip-left"
                  data-tip="Create New Backup"
                >
                  {backupLoading ? <RefreshCw size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {backups.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No backups found.</p>
                ) : (
                  backups.map((backup, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-cyan-500/30 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-medium text-slate-300 truncate pr-2">{backup.name}</p>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">{backup.size.toFixed(2)} MB</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock size={10} /> {format(new Date(backup.created_at * 1000), 'MMM d, yyyy HH:mm')}
                        </span>
                        <button 
                          onClick={() => handleRestoreBackup(backup.name)}
                          className="text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                        >
                          <UploadCloud size={12} /> Restore
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default SystemHealthDashboard;
