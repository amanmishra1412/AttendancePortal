'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '../../store/slices/authSlice';
import { Bell, LogOut, Shield, Clock, Menu, HelpCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import HowItWorksModal from './HowItWorksModal';

export default function Header({ onOpenMobileMenu = () => {} }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const [time, setTime] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

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
    <>
      <header className="h-16 sm:h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Title / Mobile Hamburger / Clock */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Hamburger Menu on Mobile */}
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight line-clamp-1">Enterprise HRMS</h2>
            <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">Location-Based Attendance & Automated Payroll</p>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{time || 'Loading time...'}</span>
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* How It Works Button */}
          <button
            onClick={() => setHowItWorksOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 text-indigo-700 border border-indigo-200/80 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition shadow-xs"
            title="Open Software Guide & Walkthrough"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">How It Works</span>
            <span className="sm:hidden">Guide</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition relative border border-slate-200"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">System Alerts & Notifications</h4>
                  <span className="text-[10px] sm:text-[11px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
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
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold border border-rose-200 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Guide Modal */}
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </>
  );
}
