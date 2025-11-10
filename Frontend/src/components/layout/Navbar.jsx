import { useAuth } from '../../context/AuthContext';
import { ChevronDown } from 'lucide-react';
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
    if (path.includes('/applications')) return { section: 'Activity', page: 'Applications' };
    if (path.includes('/browse')) return { section: 'Account', page: 'Browse Jobs' };
    if (path.includes('/resumes')) return { section: 'Account', page: 'My Resumes' };
    if (path.includes('/saved-jobs')) return { section: 'Account', page: 'Saved Jobs' };
    if (path.includes('/interview-prep')) return { section: 'Activity', page: 'Interview Prep' };
    if (path.includes('/ats-checker')) return { section: 'Others', page: 'ATS Checker' };
    if (path.includes('/resume-optimizer')) return { section: 'Others', page: 'Resume Optimizer' };
    if (path.includes('/shortlisted')) return { section: 'Insights', page: 'Shortlisted' };
    return { section: 'Overview', page: 'Dashboard' };
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

        {/* Right - Profile Only */}
        <div className="flex items-center gap-4">
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
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-medium text-white hidden md:block">
                {user?.name || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2">
                <div className="px-4 py-2 border-b border-slate-700">
                  <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                  <p className="text-xs text-purple-400 mt-1 capitalize">{user?.role || 'User'}</p>
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