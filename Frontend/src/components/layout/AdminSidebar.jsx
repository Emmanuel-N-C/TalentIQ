import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Shield,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import Logo from '../../assets/Talentiqsymb.png';

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { logout } = useAuth();
  const userRole = 'admin';
  
  const navigation = {
    overview: [
      { name: 'Dashboard', icon: LayoutDashboard, href: `/${userRole}/dashboard` },
    ],
    management: [
      { name: 'User Management', icon: Users, href: `/${userRole}/users` },
      { name: 'Job Management', icon: Briefcase, href: `/${userRole}/jobs` },
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
              <p className="text-xs text-slate-400">Admin Portal</p>
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
                          isActive ? 'text-red-400' : ''
                        }`} />
                        <span className="truncate">{item.name}</span>
                        {isActive && (
                          <div className="ml-auto w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
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
            System
          </h3>
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