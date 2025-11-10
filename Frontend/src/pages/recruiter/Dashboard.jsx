import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { Briefcase, PlusCircle, Users, TrendingUp, Clock, Eye, FileText, BarChart3 } from 'lucide-react';
import { getAllJobs } from '../../api/jobs';
import { getAllRecruiterApplications } from '../../api/applications';
import toast from 'react-hot-toast';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingReview: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [jobsData, applicationsData] = await Promise.all([
        getAllJobs().catch(() => []),
        getAllRecruiterApplications().catch(() => [])
      ]);

      // Filter jobs by current recruiter
      const myJobs = jobsData.filter(job => job.recruiterId === user.id);
      const pendingApps = applicationsData.filter(app => app.status === 'PENDING' || app.status === 'REVIEWING');

      setStats({
        totalJobs: myJobs.length,
        activeJobs: myJobs.filter(j => new Date(j.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
        totalApplications: applicationsData.length,
        pendingReview: pendingApps.length
      });

      setRecentJobs(myJobs.slice(0, 3));
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      onClick: () => navigate('/recruiter/jobs')
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      onClick: () => navigate('/recruiter/jobs')
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      onClick: () => navigate('/recruiter/applications')
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      onClick: () => navigate('/recruiter/applications?status=PENDING')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Recruiter Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <button
              key={index}
              onClick={card.onClick}
              className={`bg-slate-800/50 backdrop-blur-sm border ${card.borderColor} rounded-xl p-6 hover:border-opacity-50 transition-all hover:transform hover:scale-105 cursor-pointer text-left`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <card.icon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/recruiter/jobs"
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 hover:border-slate-600 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">My Jobs</h3>
                <p className="text-slate-400">View and manage your job postings</p>
              </div>
            </div>
          </Link>

          <Link
            to="/recruiter/jobs/create"
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 hover:border-slate-600 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Post New Job</h3>
                <p className="text-slate-400">Create a new job listing</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Jobs */}
        {recentJobs.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold">Recent Job Postings</h2>
              </div>
              <Link 
                to="/recruiter/jobs"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{job.title}</h3>
                      <p className="text-slate-400 text-sm mb-2">{job.company}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {job.applicationCount || 0} applications
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/recruiter/jobs/${job.id}/applications`}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
                    >
                      View Applications
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}