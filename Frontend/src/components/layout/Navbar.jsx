import { useAuth } from '../../context/AuthContext';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();

  // Get breadcrumb based on current path
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return { section: 'Overview', page: 'Dashboard' };
    if (path.includes('/users')) return { section: 'Management', page: 'User Management' };
    if (path.includes('/jobs')) return { section: 'Management', page: 'Job Management' };
    if (path.includes('/analytics')) return { section: 'Analytics', page: 'Platform Analytics' };
    if (path.includes('/reports')) return { section: 'Analytics', page: 'Reports' };
    if (path.includes('/settings')) return { section: 'System', page: 'Settings' };
    if (path.includes('/applications')) return { section: 'Management', page: 'Applications' };
    if (path.includes('/browse')) return { section: 'Account', page: 'Browse Jobs' };
    if (path.includes('/resumes')) return { section: 'Account', page: 'My Resumes' };
    if (path.includes('/saved-jobs')) return { section: 'Account', page: 'Saved Jobs' };
    if (path.includes('/interview-prep')) return { section: 'Activity', page: 'Interview Prep' };
    if (path.includes('/ats-checker')) return { section: 'Others', page: 'ATS Checker' };
    if (path.includes('/resume-optimizer')) return { section: 'Others', page: 'Resume Optimizer' };
    if (path.includes('/shortlisted')) return { section: 'Insights', page: 'Shortlisted' };
    return { section: 'Overview', page: 'Dashboard' };
  };

  // Get search placeholder based on role
  const getSearchPlaceholder = () => {
    if (user?.role === 'admin') return 'Search users, jobs, statistics...';
    if (user?.role === 'recruiter') return 'Search candidates, jobs...';
    return 'Search jobs, companies...';
  };

  const breadcrumb = getBreadcrumb();

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 sticky top-0 z-50 shadow-xl">
      <div className="flex items-center justify-between">
        {/* Left - Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">{breadcrumb.section}</span>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium">{breadcrumb.page}</span>
        </div>

        {/* Right - Search and Profile */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
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
              <div className={`w-8 h-8 ${
                user?.role === 'admin' 
                  ? 'bg-gradient-to-br from-red-500 to-pink-500' 
                  : 'bg-gradient-to-br from-purple-500 to-blue-500'
              } rounded-full flex items-center justify-center text-sm font-bold`}>
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="text-sm font-medium text-white hidden md:block">
                {user?.name || 'Admin User'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2">
                <div className="px-4 py-2 border-b border-slate-700">
                  <p className="text-sm font-medium text-white">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                  <p className="text-xs text-purple-400 mt-1 capitalize">{user?.role || 'Admin'}</p>
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