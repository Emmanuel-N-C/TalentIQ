import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Briefcase, FileText, CheckCircle, Star, BarChart3, ArrowRight, Clock, Building2, MapPin } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../../api/applications';
import { getUserResumes } from '../../api/resumes';
import { getMyMatches } from '../../api/matches';
import { getAllJobs } from '../../api/jobs';
import toast from 'react-hot-toast';

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    saved: 0,
    resumes: 0,
    interviews: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [applicationsData, resumesData, matchesData, jobsData] = await Promise.all([
        getMyApplications().catch(() => []),
        getUserResumes().catch(() => []),
        getMyMatches().catch(() => []),
        getAllJobs().catch(() => [])
      ]);

      const interviewCount = applicationsData.filter(
        app => app.status === 'INTERVIEWED' || app.status === 'SHORTLISTED'
      ).length;

      setStats({
        applications: applicationsData.length,
        saved: matchesData.length,
        resumes: resumesData.length,
        interviews: interviewCount
      });

      setRecentApplications(applicationsData.slice(0, 4));
      setFeaturedJobs(jobsData.slice(0, 2));

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (trend = 'up') => {
    const baseValues = trend === 'up' 
      ? [2, 3, 5, 4, 7, 6, 8] 
      : [6, 7, 5, 6, 4, 5, 3];
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
      name: day,
      value: baseValues[i]
    }));
  };

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.applications,
      change: stats.applications > 0 ? '+12%' : '0%',
      trend: 'up',
      icon: Briefcase,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Saved Jobs',
      value: stats.saved,
      change: `+${stats.saved}`,
      trend: 'up',
      icon: Star,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'Active Resumes',
      value: stats.resumes,
      change: '0',
      trend: 'neutral',
      icon: FileText,
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'Interviews',
      value: stats.interviews,
      change: `+${stats.interviews}`,
      trend: 'up',
      icon: CheckCircle,
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/20'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      PENDING: { text: 'text-yellow-400', bg: 'bg-yellow-400/10' },
      REVIEWING: { text: 'text-blue-400', bg: 'bg-blue-400/10' },
      SHORTLISTED: { text: 'text-purple-400', bg: 'bg-purple-400/10' },
      INTERVIEWED: { text: 'text-indigo-400', bg: 'bg-indigo-400/10' },
      ACCEPTED: { text: 'text-green-400', bg: 'bg-green-400/10' },
      REJECTED: { text: 'text-red-400', bg: 'bg-red-400/10' },
      WITHDRAWN: { text: 'text-gray-400', bg: 'bg-gray-400/10' }
    };
    return colors[status] || colors.PENDING;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Welcome Back, {user?.name || 'Jason'}
          </h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last login: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`bg-slate-800/50 backdrop-blur-sm border ${stat.borderColor} rounded-xl p-6 hover:border-opacity-50 transition-all hover:transform hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-400' : 
                  stat.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {stat.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                  {stat.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                  <span className="font-semibold">{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Live Updates Section */}
        {featuredJobs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold">Live Job Updates</h2>
              <span className="text-sm text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last update: 2 min ago
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredJobs.map((job, index) => {
                const chartData = generateChartData(index === 0 ? 'up' : 'down');
                const trend = index === 0 ? 'up' : 'down';
                
                return (
                  <div
                    key={job.id}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${
                          trend === 'up' ? 'from-orange-500 to-orange-600' : 'from-blue-500 to-blue-600'
                        } rounded-full flex items-center justify-center shadow-lg`}>
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{job.title}</h3>
                          <p className="text-slate-400 text-sm flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {job.company}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Match Score</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold">{85 + index * 5}%</p>
                          <div className={`flex items-center gap-1 text-xs ${
                            trend === 'up' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{trend === 'up' ? '+5.2%' : '-2.1%'}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Experience</p>
                        <p className="text-sm font-semibold">{job.experienceLevel}</p>
                      </div>
                    </div>

                    {/* Mini Chart */}
                    <div className="h-24 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={trend === 'up' ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={trend === 'up' ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={trend === 'up' ? "#10b981" : "#ef4444"} 
                            fill={`url(#color${index})`}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.skillsRequired?.split(',')[0] || 'Skills Required'}
                      </span>
                      <Link 
                        to="/jobseeker/browse"
                        className="ml-auto text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
                      >
                        View Details <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Applications Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold">Recent Applications</h2>
            </div>
            <Link 
              to="/jobseeker/applications"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              View All
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No applications yet</p>
              <Link 
                to="/jobseeker/browse"
                className="inline-block px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
              >
                Start Applying
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">No</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Job Title</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Company</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Applied</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app, index) => {
                    const statusColors = getStatusColor(app.status);
                    return (
                      <tr 
                        key={app.id} 
                        className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-4 text-slate-300 font-mono text-sm">#{index + 1}</td>
                        <td className="py-4 px-4 font-medium">{app.jobTitle}</td>
                        <td className="py-4 px-4 text-slate-300">{app.jobCompany}</td>
                        <td className="py-4 px-4 text-slate-400 text-sm">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`${statusColors.text} ${statusColors.bg} px-3 py-1 rounded-full text-xs font-semibold`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/jobseeker/browse"
            className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all group"
          >
            <Briefcase className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-2">Browse Jobs</h3>
            <p className="text-slate-400 text-sm">Explore new opportunities</p>
          </Link>

          <Link 
            to="/jobseeker/interview-prep"
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all group"
          >
            <CheckCircle className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-2">Interview Prep</h3>
            <p className="text-slate-400 text-sm">Practice with AI coach</p>
          </Link>

          <Link 
            to="/jobseeker/ats-checker"
            className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all group"
          >
            <BarChart3 className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-2">ATS Checker</h3>
            <p className="text-slate-400 text-sm">Optimize your resume</p>
          </Link>
        </div>
      </div>
    </div>
  );
}