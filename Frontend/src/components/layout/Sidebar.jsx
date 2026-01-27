import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Star, 
  ClipboardList, 
  MessageSquare,
  BarChart3,
  User,
  Sparkles,
  LogOut,
  CirclePlus,  // NEW IMPORT
  Layout
} from 'lucide-react';
import Logo from '../../assets/Talentiqsymb.png';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { logout, user } = useAuth();  // Added user from useAuth
  const userRole = 'jobseeker';
  
  const navigation = {
    overview: [
      { name: 'Dashboard', icon: LayoutDashboard, href: `/${userRole}/dashboard` },
    ],
    'Job Management': [
      { name: 'Browse Jobs', icon: Briefcase, href: `/${userRole}/browse` },
      { name: 'Saved Jobs', icon: Star, href: `/${userRole}/saved-jobs` },
      { name: 'My Applications', icon: ClipboardList, href: `/${userRole}/applications` },
    ],
    'AI Tools': [
      { name: 'Interview Prep', icon: MessageSquare, href: `/${userRole}/interview-prep` },
      { name: 'ATS Checker', icon: BarChart3, href: `/${userRole}/ats-checker` },
      { name: 'Resume Optimizer', icon: Sparkles, href: `/${userRole}/resume-optimizer` },
    ],
    Resume: [
      { name: 'My Resumes', icon: FileText, href: `/${userRole}/resumes` },
      // NEW: Create Resume menu item - only for jobseekers
      ...(user?.role === 'jobseeker' ? [
        { name: 'Beta Optimizer CV', icon: CirclePlus, href: `/${userRole}/resumes/new` },
        { name: 'Beta CV Builder', icon: Layout, href: `/${userRole}/cv-builder` }
      ] : [])
    ]
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - Fixed on desktop, slide-in on mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-40
        w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 
        text-white border-r border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={Logo} alt="TalentIQ Logo" className="w-full h-full object-contain" />
              </div>
            <div>
              <h1 className="text-xl font-bold">TalentIQ</h1>
              <p className="text-xs text-slate-400">AI-Powered Hiring</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-6">
            {Object.entries(navigation).map(([section, items]) => (
              <div key={section}>
                <h3 className="text-xs uppercase text-slate-500 mb-3 font-semibold tracking-wider">
                  {section}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                          isActive 
                            ? 'bg-white/10 text-white font-medium shadow-lg' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-blue-400' : ''
                        }`} />
                        <span className="truncate">{item.name}</span>
                        {isActive && (
                          <div className="ml-auto w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Settings Section - Fixed at Bottom */}
        <div className="border-t border-slate-800 p-4 space-y-1">
          <h3 className="text-xs uppercase text-slate-500 mb-3 font-semibold tracking-wider px-2">
            Settings
          </h3>
          <Link
            to={`/${userRole}/profile`}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
              location.pathname.includes('/profile')
                ? 'bg-white/10 text-white font-medium shadow-lg' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <User className={`w-5 h-5 transition-transform group-hover:scale-110 ${
              location.pathname.includes('/profile') ? 'text-blue-400' : ''
            }`} />
            <span className="truncate">Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}