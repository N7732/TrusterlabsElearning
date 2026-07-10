import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, User, BookOpen, MessageSquare, X } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ isSuperAdmin = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    // Prevent fetching if no token is present to avoid 401 errors
    if (!localStorage.getItem('truster_lab_token')) {
      return;
    }
    try {
      const response = await apiClient.get('/settings/notifications/');
      setNotifications(response.data?.results || response.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    
    // Handle click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/settings/notifications/mark-all-read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'course': return <BookOpen size={16} className="text-blue-500" />;
      case 'enquiry': return <User size={16} className="text-green-500" />;
      case 'contact': return <MessageSquare size={16} className="text-purple-500" />;
      default: return <Info size={16} className="text-slate-500" />;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await apiClient.patch(`/settings/notifications/${notification.id}/`, { is_read: true });
        setNotifications(notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
    
    if (notification.link) {
      setIsOpen(false);
      // If superadmin, ensure we prepend /superadmin/entity if it maps directly to admin
      let targetLink = notification.link;
      if (isSuperAdmin && targetLink.startsWith('/admin/')) {
        targetLink = targetLink.replace('/admin/', '/superadmin/entity/');
      }
      navigate(targetLink);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[400px]">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-[#0A66C2] hover:underline font-medium flex items-center"
              >
                <Check size={14} className="mr-1" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 flex flex-col items-center">
                <Bell size={24} className="text-slate-300 mb-2" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        {getIcon(notification.notification_type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm ${!notification.is_read ? 'font-bold text-slate-800' : 'font-medium text-slate-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        {new Date(notification.created_at).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
