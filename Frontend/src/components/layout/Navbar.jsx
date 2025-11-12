import { useAuth } from '../../context/AuthContext';
import { ChevronDown, User as UserIcon, Settings, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUserProfile } from '../../api/user';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Listen for profile update events
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user) {
        fetchProfile();
      }
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await getCurrentUserProfile();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

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
    if (path.includes('/profile')) return { section: 'Settings', page: 'Profile' };
    if (path.includes('/settings')) return { section: 'Settings', page: 'Settings' };
    return { section: 'Overview', page: 'Dashboard' };
  };

  const breadcrumb = getBreadcrumb();

  const getSettingsPath = () => {
    if (user?.role === 'recruiter') return '/recruiter/settings';
    if (user?.role === 'admin') return '/admin/settings';
    return '/jobseeker/profile';
  };

  const profilePictureUrl = profileData?.profilePictureUrl 
    ? `http://localhost:8080${profileData.profilePictureUrl}`
    : null;

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-4 sticky top-0 z-50 shadow-xl">
      <div className="flex items-center justify-between">
        {/* Left - Hamburger + Breadcrumb */}
        <div className="flex items-center gap-4">
          {/* Hamburger Button - Only visible on mobile */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          
          {/* Breadcrumb - Hidden on smallest screens */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-slate-400">{breadcrumb.section}</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">{breadcrumb.page}</span>
          </div>
        </div>

        {/* Right - Profile Only */}
        <div className="flex items-center gap-4">
          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-slate-700"
                />
              ) : (
                <div className={`w-8 h-8 ${
                  user?.role === 'admin' 
                    ? 'bg-gradient-to-br from-red-500 to-pink-500' 
                    : 'bg-gradient-to-br from-purple-500 to-blue-500'
                } rounded-full flex items-center justify-center text-sm font-bold`}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-sm font-medium text-white hidden md:block truncate max-w-[150px]">
                {user?.name || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt={user?.name || 'User'}
                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-600"
                      />
                    ) : (
                      <div className={`w-10 h-10 ${
                        user?.role === 'admin' 
                          ? 'bg-gradient-to-br from-red-500 to-pink-500' 
                          : 'bg-gradient-to-br from-purple-500 to-blue-500'
                      } rounded-full flex items-center justify-center text-sm font-bold`}>
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded capitalize">
                    {user?.role?.replace('_', ' ') || 'User'}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    navigate(getSettingsPath());
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {user?.role === 'jobseeker' ? 'Profile' : 'Settings'}
                </button>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
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