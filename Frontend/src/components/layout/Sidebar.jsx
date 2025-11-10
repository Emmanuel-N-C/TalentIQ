import { Link, useLocation } from 'react-router-dom';
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
  Settings
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const userRole = 'jobseeker'; // This should come from your auth context
  
  const navigation = {
    overview: [
      { name: 'Dashboard', icon: LayoutDashboard, href: `/${userRole}/dashboard` },
    ],
    account: [
      { name: 'Browse Jobs', icon: Briefcase, href: `/${userRole}/browse` },
      { name: 'My Resumes', icon: FileText, href: `/${userRole}/resumes` },
      { name: 'Saved Jobs', icon: Star, href: `/${userRole}/saved-jobs` },
    ],
    activity: [
      { name: 'My Applications', icon: ClipboardList, href: `/${userRole}/applications` },
      { name: 'Interview Prep', icon: MessageSquare, href: `/${userRole}/interview-prep` },
    ],
    others: [
      { name: 'ATS Checker', icon: BarChart3, href: `/${userRole}/ats-checker` },
      { name: 'Resume Optimizer', icon: Sparkles, href: `/${userRole}/resume-optimizer` },
    ],
    settings: [
      { name: 'Profile', icon: User, href: `/${userRole}/profile` },
    ]
  };

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white min-h-screen p-6 border-r border-slate-800">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
          <Briefcase className="w-6 h-6" />
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                      isActive 
                        ? 'bg-white/10 text-white font-medium shadow-lg' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-blue-400' : ''
                    }`} />
                    <span>{item.name}</span>
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
  );
}