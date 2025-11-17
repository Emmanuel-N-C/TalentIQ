import { useState, useEffect } from 'react';
import { getMyApplications } from '../../api/applications';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ClipboardList, Filter, Eye, X, Clock, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  }, [statusFilter, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getMyApplications();
      setApplications(data);
      setFilteredApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
      REVIEWING: { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
      SHORTLISTED: { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
      INTERVIEWED: { text: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/30' },
      ACCEPTED: { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
      REJECTED: { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
      WITHDRAWN: { text: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/30' }
    };
    return colors[status] || colors.PENDING;
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <Clock className="w-4 h-4" />,
      REVIEWING: <Eye className="w-4 h-4" />,
      SHORTLISTED: <AlertCircle className="w-4 h-4" />,
      INTERVIEWED: <CheckCircle className="w-4 h-4" />,
      ACCEPTED: <CheckCircle className="w-4 h-4" />,
      REJECTED: <XCircle className="w-4 h-4" />,
      WITHDRAWN: <XCircle className="w-4 h-4" />
    };
    return icons[status] || icons.PENDING;
  };

  const getStatusCount = (status) => {
    if (status === 'ALL') return applications.length;
    return applications.filter(app => app.status === status).length;
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
            My Applications
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">Track your job applications</p>
        </div>

        {/* Stats Summary - Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`p-3 sm:p-4 rounded-xl text-left transition-all ${
              statusFilter === 'ALL' 
                ? 'bg-blue-500/20 border-2 border-blue-400 ring-2 ring-blue-400/30' 
                : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className={`text-xl sm:text-2xl font-bold ${statusFilter === 'ALL' ? 'text-blue-400' : 'text-white'}`}>
              {applications.length}
            </div>
            <div className="text-slate-400 text-xs sm:text-sm mt-1">Total Applied</div>
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`p-3 sm:p-4 rounded-xl text-left transition-all ${
              statusFilter === 'PENDING' 
                ? 'bg-yellow-500/20 border-2 border-yellow-400' 
                : 'bg-yellow-500/10 border border-yellow-500/30 hover:border-yellow-400/50'
            }`}
          >
            <div className="text-xl sm:text-2xl font-bold text-yellow-400">{getStatusCount('PENDING')}</div>
            <div className="text-yellow-300 text-xs sm:text-sm mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('SHORTLISTED')}
            className={`p-3 sm:p-4 rounded-xl text-left transition-all ${
              statusFilter === 'SHORTLISTED' 
                ? 'bg-purple-500/20 border-2 border-purple-400' 
                : 'bg-purple-500/10 border border-purple-500/30 hover:border-purple-400/50'
            }`}
          >
            <div className="text-xl sm:text-2xl font-bold text-purple-400">{getStatusCount('SHORTLISTED')}</div>
            <div className="text-purple-300 text-xs sm:text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Shortlisted
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('ACCEPTED')}
            className={`p-3 sm:p-4 rounded-xl text-left transition-all ${
              statusFilter === 'ACCEPTED' 
                ? 'bg-green-500/20 border-2 border-green-400' 
                : 'bg-green-500/10 border border-green-500/30 hover:border-green-400/50'
            }`}
          >
            <div className="text-xl sm:text-2xl font-bold text-green-400">{getStatusCount('ACCEPTED')}</div>
            <div className="text-green-300 text-xs sm:text-sm mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Accepted
            </div>
          </button>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 sm:p-12 text-center">
            <ClipboardList className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              {statusFilter === 'ALL' ? 'No Applications Yet' : `No ${statusFilter} Applications`}
            </h2>
            <p className="text-slate-400 mb-6 text-sm sm:text-base">
              {statusFilter === 'ALL' 
                ? 'Start applying to jobs to see them here' 
                : `You don't have any applications with status: ${statusFilter}`}
            </p>
            {statusFilter === 'ALL' && (
              <Link
                to="/jobseeker/browse"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 sm:px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 font-semibold transition-all text-sm sm:text-base"
              >
                Browse Jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const statusColors = getStatusColor(app.status);
              return (
                <div
                  key={app.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:border-slate-600 transition-all cursor-pointer"
                  onClick={() => setSelectedApplication(app)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{app.jobTitle}</h3>
                      <p className="text-slate-400 text-sm mb-3 truncate">{app.jobCompany}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          Applied {format(new Date(app.appliedAt), 'MMM dd, yyyy')}
                        </span>
                        {app.coverLetter && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                            Cover Letter Included
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`${statusColors.text} ${statusColors.bg} ${statusColors.border} px-4 py-2 rounded-lg border font-semibold flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap self-start`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}