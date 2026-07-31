'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '../../store/slices/authSlice';
import { Bell, LogOut, Shield, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const [time, setTime] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifs();
    } catch (e) {}
  };

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title / Clock */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise HR Management</h2>
          <p className="text-xs text-slate-500">Location-Based Attendance & Automated Payroll</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{time || 'Loading time...'}</span>
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition relative border border-slate-200"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                <h4 className="text-sm font-bold text-slate-900">System Alerts & Notifications</h4>
                <span className="text-[11px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} New
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markRead(n._id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                        n.isRead
                          ? 'bg-slate-50 border-slate-200 text-slate-500'
                          : 'bg-indigo-50/50 border-indigo-200 text-slate-900 font-medium'
                      }`}
                    >
                      <p className="font-semibold text-indigo-600 mb-0.5">{n.title}</p>
                      <p className="text-slate-600 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Shield className="w-4 h-4 text-violet-600" />
          <span className="text-xs font-semibold text-slate-700">{user?.role}</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-semibold border border-rose-200 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
