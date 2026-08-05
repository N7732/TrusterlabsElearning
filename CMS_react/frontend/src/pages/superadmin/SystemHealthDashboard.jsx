import React, { useState } from 'react';
import { 
  Activity, Server, Database, HardDrive, Mail, ShieldAlert,
  DownloadCloud, UploadCloud, CheckCircle, AlertTriangle, XCircle, RefreshCw, AlertCircle as AlertCircleIcon, Clock, Zap
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import useSWR, { mutate } from 'swr';

const SystemHealthDashboard = () => {
  const { user } = useAuth();
  const [backupLoading, setBackupLoading] = useState(false);

  const { data: healthData, error: swrError, isLoading: loading, isValidating: refreshing } = useSWR(
    '/settings/system-health/',
    {
      revalidateOnFocus: true,
      refreshInterval: 30000, // Background health checks every 30 seconds
      keepPreviousData: true
    }
  );
  
  const error = swrError ? 'Failed to fetch system health data.' : null;

  const fetchHealthData = () => mutate('/settings/system-health/');

  const handleTriggerBackup = async () => {
    try {
      setBackupLoading(true);
      const res = await apiClient.post('/settings/system-health/trigger_backup/');
      alert(res.message || 'Backup generated successfully');
      fetchHealthData();
    } catch (err) {
      alert('Failed to generate backup: ' + err.message);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (filename) => {
    if (!window.confirm(`Are you sure you want to restore backup ${filename}? This will OVERWRITE existing data and CANNOT be undone.`)) return;
    
    try {
      const res = await apiClient.post('/settings/system-health/restore_backup/', { filename });
      alert(res.message || 'Backup restored successfully');
    } catch (err) {
      alert('Failed to restore backup: ' + err.message);
    }
  };

  const handleDownloadBackup = async (filename) => {
    try {
      // Since the backend returns a FileResponse (application/octet-stream),
      // we must use a direct fetch to handle blobs safely rather than apiClient
      // which attempts to parse the response as JSON.
      const token = localStorage.getItem('truster_lab_token');
      const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/settings/system-health/download_backup/?filename=${filename}`;
      const fetchRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!fetchRes.ok) throw new Error('Download failed');
      const blob = await fetchRes.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('Failed to download backup: ' + err.message);
    }
  };

  const handleTestEmail = async () => {
    if (!user?.email) return alert('No email found for current user.');
    try {
      setTestEmailLoading(true);
      const res = await apiClient.post('/settings/system-health/test_email/', { email: user.email });
      alert(res.message || 'Test email sent successfully');
    } catch (err) {
      alert('Failed to send test email: ' + err.message);
    } finally {
      setTestEmailLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#09090b]">
      <div className="flex flex-col items-center gap-4">
        <Activity className="text-blue-500 animate-pulse" size={48} />
        <p className="text-slate-400 animate-pulse text-lg font-medium tracking-wide">Analyzing System Matrix...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex h-screen items-center justify-center bg-[#09090b]">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl flex flex-col items-center max-w-md text-center">
        <ShieldAlert className="text-red-500 mb-4" size={48} />
        <h3 className="text-red-400 text-xl font-bold mb-2">Critical Failure</h3>
        <p className="text-red-200/70">{error}</p>
        <button onClick={fetchHealthData} className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]">Retry Connection</button>
      </div>
    </div>
  );

  const { snapshot, recent_errors, backups, version } = healthData;

  const score = snapshot ? Math.max(0, 100 - (snapshot.cpu_usage > 90 ? 20 : 0) - (snapshot.memory_usage > 90 ? 20 : 0) - (snapshot.disk_usage > 90 ? 20 : 0) - (!snapshot.db_status ? 50 : 0)) : 0;
  
  // Advanced color coding system
  const getHealthTheme = (score) => {
    if (score >= 90) return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/30', glow: 'shadow-[0_0_30px_rgba(52,211,153,0.15)]', pulse: 'animate-none' };
    if (score >= 70) return { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/30', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)]', pulse: 'animate-none' };
    return { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/50', glow: 'shadow-[0_0_40px_rgba(244,63,94,0.3)]', pulse: 'animate-pulse' };
  };

  const getResourceColor = (val) => {
    if (val < 50) return 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]';
    if (val < 75) return 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]';
    if (val < 90) return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
    return 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-pulse';
  };

  const getResourceText = (val) => {
    if (val < 50) return 'text-emerald-400';
    if (val < 75) return 'text-amber-400';
    if (val < 90) return 'text-orange-400';
    return 'text-rose-500 font-bold';
  };

  const theme = getHealthTheme(score);
  
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      
      {/* Background ambient light */}
      <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000 ${theme.bg}`}></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
              <Zap className={`${theme.color} ${theme.pulse}`} size={28} /> 
              System Diagnostics
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.bg.replace('/10', '')}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${theme.bg.replace('/10', '')}`}></span>
              </span>
              Live telemetry and maintenance array
            </p>
          </div>
          <button 
            onClick={fetchHealthData}
            disabled={refreshing}
            className={`flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 border border-white/10 shadow-lg hover:shadow-white/5 group overflow-hidden relative`}
          >
            <div className="absolute inset-0 w-0 bg-white/5 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
            <RefreshCw size={16} className={`relative z-10 ${refreshing ? 'animate-spin text-blue-400' : 'group-hover:rotate-180 transition-transform duration-500'}`} /> 
            <span className="relative z-10 font-medium">{refreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>
        </div>

        {/* Overall Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`bg-[#0a0a0c] backdrop-blur-md p-6 rounded-2xl border ${theme.border} ${theme.glow} relative overflow-hidden group transition-all duration-500 hover:scale-[1.02]`}>
            <div className={`absolute right-0 top-0 w-32 h-32 ${theme.bg} rounded-full -mr-16 -mt-16 blur-2xl transition-all duration-700 group-hover:scale-150`}></div>
            <p className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2 uppercase tracking-wider text-[11px]">
              <Activity size={14} /> Overall Integrity
            </p>
            <div className="flex items-end gap-2">
              <span className={`text-5xl font-black tracking-tighter ${theme.color}`}>
                {score}%
              </span>
            </div>
          </div>
          
          <div className="bg-[#0a0a0c] p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-colors">
            <p className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2 uppercase tracking-wider text-[11px]">
              <Clock size={14} /> Last Scan
            </p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {snapshot ? formatDistanceToNow(new Date(snapshot.created_at), { addSuffix: true }) : 'Never'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-mono">{snapshot ? format(new Date(snapshot.created_at), 'HH:mm:ss.SSS') : '--'}</p>
          </div>

          <div className="bg-[#0a0a0c] p-6 rounded-2xl border border-indigo-500/20 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
            <p className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2 uppercase tracking-wider text-[11px]">
              <Server size={14} className="text-indigo-400" /> Django Core
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-indigo-300 tracking-tight">{version.django}</span>
            </div>
          </div>

          <div className="bg-[#0a0a0c] p-6 rounded-2xl border border-purple-500/20 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-colors">
            <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-purple-500/20 transition-all"></div>
            <p className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2 uppercase tracking-wider text-[11px]">
              <HardDrive size={14} className="text-purple-400" /> Python Env
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-purple-300 tracking-tight">{version.python}</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Wider) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Resource Panel */}
            <div className="bg-[#0a0a0c] p-7 rounded-2xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
              
              <h2 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Server size={20} className="text-blue-400" /> 
                </div>
                Hardware Utilization
              </h2>
              
              <div className="space-y-8">
                {/* CPU */}
                <div className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-300 uppercase tracking-wide">CPU Cores</span>
                    <span className={`text-xl font-mono ${getResourceText(snapshot?.cpu_usage || 0)}`}>
                      {snapshot?.cpu_usage || 0}<span className="text-sm opacity-50">%</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#1a1a24] rounded-full h-3 p-0.5 border border-white/5 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${getResourceColor(snapshot?.cpu_usage || 0)}`} 
                      style={{ width: `${snapshot?.cpu_usage || 0}%` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>

                {/* Memory */}
                <div className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-300 uppercase tracking-wide">Physical Memory</span>
                    <span className={`text-xl font-mono ${getResourceText(snapshot?.memory_usage || 0)}`}>
                      {snapshot?.memory_usage || 0}<span className="text-sm opacity-50">%</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#1a1a24] rounded-full h-3 p-0.5 border border-white/5 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${getResourceColor(snapshot?.memory_usage || 0)}`} 
                      style={{ width: `${snapshot?.memory_usage || 0}%` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 translate-x-[-100%] animate-[shimmer_2.5s_infinite]"></div>
                    </div>
                  </div>
                </div>

                {/* Disk */}
                <div className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-300 uppercase tracking-wide">Storage Array</span>
                    <span className={`text-xl font-mono ${getResourceText(snapshot?.disk_usage || 0)}`}>
                      {snapshot?.disk_usage || 0}<span className="text-sm opacity-50">%</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#1a1a24] rounded-full h-3 p-0.5 border border-white/5 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${getResourceColor(snapshot?.disk_usage || 0)}`} 
                      style={{ width: `${snapshot?.disk_usage || 0}%` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Monitoring */}
            <div className="bg-[#0a0a0c] p-7 rounded-2xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <ShieldAlert size={20} className="text-red-400" /> 
                  </div>
                  Exception Tracking
                </h2>
                <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">LAST 10</span>
              </div>
              
              {recent_errors.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] rounded-xl border border-white-[0.02] border-dashed">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
                    <CheckCircle className="text-emerald-400" size={32} />
                  </div>
                  <h3 className="text-emerald-400 font-medium mb-1 tracking-wide">System Stable</h3>
                  <p className="text-slate-500 text-sm">No recent application errors detected.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {recent_errors.map((error, idx) => (
                    <div key={idx} className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/30 flex gap-4 hover:border-rose-500/40 transition-colors group">
                      <div className="mt-1">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 group-hover:bg-rose-500/20 transition-colors">
                          <AlertCircle className="text-rose-400" size={16} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start gap-4 mb-1.5">
                          <p className="text-sm font-semibold text-rose-200 truncate">{error.path}</p>
                          <span className="text-xs text-rose-500/70 whitespace-nowrap font-mono">{formatDistanceToNow(new Date(error.created_at), { addSuffix: true })}</span>
                        </div>
                        <p className="text-xs text-rose-200/60 leading-relaxed font-mono bg-[#050505] p-3 rounded-lg border border-rose-900/40 shadow-inner overflow-x-auto whitespace-pre-wrap">{error.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Services Status */}
            <div className="bg-[#0a0a0c] p-7 rounded-2xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                 <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <Database size={20} className="text-cyan-400" /> 
                </div>
                External Services
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 pl-1">Primary Database</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3.5 bg-white-[0.02] border border-white/5 rounded-xl hover:bg-white-[0.04] transition-colors">
                      <span className="text-sm font-medium text-slate-300">Connection State</span>
                      {snapshot?.db_status ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md shadow-[0_0_10px_rgba(52,211,153,0.2)] border border-emerald-500/20">
                          <CheckCircle size={14}/> ONLINE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-md shadow-[0_0_10px_rgba(244,63,94,0.2)] border border-rose-500/20">
                          <XCircle size={14}/> OFFLINE
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center p-3.5 bg-white-[0.02] border border-white/5 rounded-xl hover:bg-white-[0.04] transition-colors">
                      <span className="text-sm font-medium text-slate-300">Latency</span>
                      <span className="text-sm font-mono font-bold text-cyan-400">
                        {snapshot?.db_response_time ? snapshot.db_response_time.toFixed(2) : 0} <span className="text-slate-500 text-xs">ms</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 pl-1">SMTP Gateway</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3.5 bg-white-[0.02] border border-white/5 rounded-xl hover:bg-white-[0.04] transition-colors">
                      <span className="text-sm font-medium text-slate-300">Auth & Reachability</span>
                      {snapshot?.smtp_status ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md shadow-[0_0_10px_rgba(52,211,153,0.2)] border border-emerald-500/20">
                          <CheckCircle size={14}/> VERIFIED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-md shadow-[0_0_10px_rgba(244,63,94,0.2)] border border-rose-500/20">
                          <XCircle size={14}/> FAILED
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={handleTestEmail}
                      disabled={testEmailLoading}
                      className="w-full mt-2 py-3 text-sm bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl transition-all shadow-[0_4px_14px_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] font-semibold flex items-center justify-center gap-2 group"
                    >
                      {testEmailLoading ? <RefreshCw size={16} className="animate-spin" /> : <Mail size={16} className="group-hover:scale-110 transition-transform" />}
                      {testEmailLoading ? 'Dispatching...' : 'Dispatch Test Email'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="bg-[#0a0a0c] p-7 rounded-2xl border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <HardDrive size={20} className="text-amber-400" /> 
                  </div>
                  Data Vault
                </h2>
                <button 
                  onClick={handleTriggerBackup}
                  disabled={backupLoading}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors border border-amber-500/30 flex items-center gap-2 font-medium text-xs group"
                >
                  {backupLoading ? <RefreshCw size={14} className="animate-spin" /> : <DownloadCloud size={14} className="group-hover:-translate-y-0.5 transition-transform" />}
                  CREATE BACKUP
                </button>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {backups.length === 0 ? (
                  <div className="text-center py-8 bg-white-[0.02] rounded-xl border border-white-[0.02] border-dashed">
                    <Database className="mx-auto mb-3 text-slate-600" size={24} />
                    <p className="text-sm font-medium text-slate-400">Vault Empty</p>
                    <p className="text-xs text-slate-500 mt-1">No backups generated yet.</p>
                  </div>
                ) : (
                  backups.map((backup, idx) => (
                    <div key={idx} className="p-4 bg-white-[0.02] rounded-xl border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/[0.02] transition-all group shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-semibold text-slate-200 truncate pr-3 group-hover:text-amber-100 transition-colors">{backup.name}</p>
                        <span className="text-[10px] bg-slate-800 text-amber-200/70 border border-amber-500/20 px-2 py-0.5 rounded-md font-mono shrink-0 shadow-inner">{backup.size.toFixed(2)} MB</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                          <Clock size={12} className="text-slate-600" /> {format(new Date(backup.created_at * 1000), 'MMM d, yyyy • HH:mm')}
                        </span>
                        <button 
                          onClick={() => handleDownloadBackup(backup.name)}
                          className="text-[11px] font-bold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500 px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 border border-blue-500/20 hover:border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0)] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] mr-2"
                        >
                          <DownloadCloud size={12} /> DOWNLOAD
                        </button>
                        <button 
                          onClick={() => handleRestoreBackup(backup.name)}
                          className="text-[11px] font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 border border-rose-500/20 hover:border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0)] hover:shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                        >
                          <UploadCloud size={12} /> RESTORE
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
      
      {/* Global styles for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%) skewX(-12deg);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default SystemHealthDashboard;
