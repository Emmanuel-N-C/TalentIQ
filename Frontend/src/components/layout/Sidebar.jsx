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
  Target,
  Sparkles
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

      {/* Bottom Badge */}
      <div className="mt-12 p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <p className="text-xs font-semibold text-purple-300">Premium Features</p>
        </div>
        <p className="text-xs text-slate-400">Unlock AI-powered insights</p>
        <button className="mt-3 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium py-2 rounded-lg hover:shadow-lg transition-all">
          Upgrade Now
        </button>
      </div>
    </div>
  );
}