import { useAuth } from '../../context/AuthContext';
import { Search, Bell, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock live stats - Replace with real data from your API
  const liveStats = [
    { label: 'APPLICATIONS', value: '24', change: '+12%', positive: true },
    { label: 'INTERVIEWS', value: '5', change: '+2', positive: true },
    { label: 'RESPONSES', value: '18', change: '-3%', positive: false },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-xl">
      <div className="flex items-center justify-between">
        {/* Left - Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Overview</span>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium">Dashboard</span>
        </div>

        {/* Center - Live Stats */}
        <div className="hidden lg:flex items-center gap-4">
          {liveStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all">
              <div>
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                <p className="text-lg font-bold text-white">{stat.value}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Right - Search and Profile */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs, companies..."
              className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 transition-all"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                {user?.name?.charAt(0) || 'J'}
              </div>
              <span className="text-sm font-medium text-white hidden md:block">
                {user?.name || 'Jason'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2">
                <div className="px-4 py-2 border-b border-slate-700">
                  <p className="text-sm font-medium text-white">{user?.name || 'Jason'}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                  Settings
                </button>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}