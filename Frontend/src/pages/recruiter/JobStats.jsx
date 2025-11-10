import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobStats } from '../../api/applications';
import { getJobById } from '../../api/jobs';
import toast from 'react-hot-toast';
import { BarChart3, TrendingUp, Users, Clock, CheckCircle, XCircle, ArrowLeft, Eye, FileText } from 'lucide-react';

export default function JobStats() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobData, statsData] = await Promise.all([
        getJobById(jobId),
        getJobStats(jobId)
      ]);
      setJob(jobData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load job statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Applications',
      value: stats?.totalApplications || 0,
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Pending Review',
      value: stats?.pendingApplications || 0,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    },
    {
      title: 'Shortlisted',
      value: stats?.shortlistedApplications || 0,
      icon: CheckCircle,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Rejected',
      value: stats?.rejectedApplications || 0,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/recruiter/jobs')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Jobs
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-purple-400" />
            Job Statistics
          </h1>
          <p className="text-slate-400">{job?.title} at {job?.company}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`bg-slate-800/50 backdrop-blur-sm border ${stat.borderColor} rounded-xl p-6`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Application Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Acceptance Rate</p>
              <p className="text-2xl font-bold text-green-400">
                {stats?.totalApplications > 0
                  ? Math.round(((stats?.acceptedApplications || 0) / stats?.totalApplications) * 100)
                  : 0}%
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Rejection Rate</p>
              <p className="text-2xl font-bold text-red-400">
                {stats?.totalApplications > 0
                  ? Math.round(((stats?.rejectedApplications || 0) / stats?.totalApplications) * 100)
                  : 0}%
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Interviewed</p>
              <p className="text-2xl font-bold text-indigo-400">{stats?.interviewedApplications || 0}</p>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            Job Details
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Position</p>
              <p className="text-lg font-semibold">{job?.title}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Company</p>
              <p className="text-lg font-semibold">{job?.company}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Experience Level</p>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/30">
                {job?.experienceLevel}
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Posted On</p>
              <p className="text-slate-300">{new Date(job?.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}