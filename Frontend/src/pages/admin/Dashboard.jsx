import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchAdminStats } from '../../api/admin';
import { Users, Briefcase, FileText, Zap, UserCheck, Building2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load platform statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'blue',
      path: '/admin/users'
    },
    {
      title: 'Job Seekers',
      value: stats?.totalJobSeekers || 0,
      icon: UserCheck,
      color: 'green',
      path: '/admin/users?role=jobseeker'
    },
    {
      title: 'Recruiters',
      value: stats?.totalRecruiters || 0,
      icon: Building2,
      color: 'purple',
      path: '/admin/users?role=recruiter'
    },
    {
      title: 'Admins',
      value: stats?.totalAdmins || 0,
      icon: Shield,
      color: 'pink',
      path: '/admin/users?role=admin'
    },
    {
      title: 'Total Jobs',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'indigo',
      path: '/admin/jobs'
    },
    {
      title: 'Total Resumes',
      value: stats?.totalResumes || 0,
      icon: FileText,
      color: 'orange',
      path: null
    },
    {
      title: 'Total Matches',
      value: stats?.totalMatches || 0,
      icon: Zap,
      color: 'yellow',
      path: null
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}!</h1>
        <p className="text-slate-400 mt-2">Here's what's happening with your platform today.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            onClick={() => stat.path && handleStatClick(stat.path)}
            className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 ${
              stat.path ? 'cursor-pointer hover:bg-slate-800/80 transform hover:scale-105 transition-all' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-500/10 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all text-left group"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-white">Manage Users</h3>
              <p className="text-sm text-slate-400">View and manage all platform users</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/admin/jobs')}
            className="flex items-center p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all text-left group"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <Briefcase className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-white">Manage Jobs</h3>
              <p className="text-sm text-slate-400">Oversee all job postings</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}