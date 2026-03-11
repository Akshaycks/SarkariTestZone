import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, LogOut, User as UserIcon, LogIn, Search, Bell, ChevronDown, Zap, Menu, Sparkles, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [trending, setTrending] = useState<{title: string, id: number}[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    fetch('/api/trending-exams')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTrending(data);
        }
      })
      .catch(err => console.error("Error fetching trending exams:", err));
  }, []);

  useEffect(() => {
    if (user) {
      fetch(`/api/notifications/${user.id}`)
        .then(res => res.json())
        .then(data => setNotifications(data));
    }
  }, [user]);

  const markAsRead = async (id: number) => {
    const res = await fetch(`/api/notifications/read/${id}`, { method: 'POST' });
    if (res.ok) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const res = await fetch(`/api/notifications/read-all/${user.id}`, { method: 'POST' });
    if (res.ok) {
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const trendingColors = [
    'text-blue-600 bg-blue-50 hover:bg-blue-100',
    'text-emerald-600 bg-emerald-50 hover:bg-emerald-100',
    'text-orange-600 bg-orange-50 hover:bg-orange-100'
  ];

  const navLinks = [
    { to: '/', label: 'Home', icon: null },
    { to: '/exams', label: 'Mock Tests', icon: null },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: LayoutDashboard }] : []),
    { to: '/ai-doubt-solver', label: 'AI Doubt Solver', icon: Sparkles, special: true },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-[100]">
      {/* Top Header */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center">
            <span className="text-xl font-black tracking-tighter italic">
              <span className="text-slate-800">Sarkari</span>
              <span className="text-blue-600">TestZone</span>
            </span>
          </div>
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-2xl relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Search for tests, courses..."
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[200] overflow-hidden">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                        >
                          {!notif.is_read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
                          <div className="pl-2">
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{notif.type}</p>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">{notif.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2">{new Date(notif.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 text-slate-700 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <UserIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm hidden sm:inline">{user.name}</span>
              </div>
              <button 
                onClick={logout}
                className="text-slate-400 hover:text-red-600 transition-colors p-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/login" className="px-3 sm:px-4 py-2 text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1 text-sm sm:text-base">
                <LogIn className="w-4 h-4" />
                <span className="hidden xs:inline">Login</span>
              </Link>
              <Link to="/register" className="bg-[#00A884] text-white px-4 sm:px-5 py-2 rounded-lg font-bold hover:bg-[#008F70] transition-all shadow-md flex items-center gap-2 text-sm sm:text-base">
                <span className="hidden xs:inline">Register</span>
                <Zap className="w-4 h-4 fill-white" />
              </Link>
            </div>
          )}
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 py-4 px-4 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm"
              placeholder="Search..."
            />
          </div>
          
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  location.pathname === link.to 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.icon && <link.icon className={`w-5 h-5 ${link.special ? 'text-blue-500' : ''}`} />}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-4">Trending Exams</p>
            <div className="flex flex-wrap gap-2 px-2">
              {trending.map((exam, i) => (
                <Link 
                  key={exam.id} 
                  to={`/exams/${exam.id}/instructions`} 
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${trendingColors[i % trendingColors.length]}`}
                >
                  {exam.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-navigation Menu (Desktop) */}
      <div className="bg-slate-50 border-t border-slate-100 hidden lg:block">
        <div className="container mx-auto px-4 flex items-center gap-10 h-11">
          {navLinks.map((link) => (
            <Link 
              key={link.to}
              to={link.to} 
              className={`text-sm font-bold h-full flex items-center px-1 transition-colors gap-1.5 group ${
                location.pathname === link.to 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              {link.icon && <link.icon className={`w-4 h-4 ${link.special ? 'text-blue-500 group-hover:animate-pulse' : ''}`} />}
              {link.label}
            </Link>
          ))}
          
          <div className="ml-auto flex items-center gap-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trending:</span>
            {trending.length > 0 ? (
              trending.map((exam, i) => (
                <Link 
                  key={exam.id} 
                  to={`/exams/${exam.id}/instructions`} 
                  className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${trendingColors[i % trendingColors.length]}`}
                >
                  {exam.title}
                </Link>
              ))
            ) : (
              <span className="text-[11px] font-bold text-slate-400 italic">Loading trends...</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
