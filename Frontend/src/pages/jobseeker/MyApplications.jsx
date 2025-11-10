import { useState, useEffect } from 'react';
import { getMyApplications } from '../../api/applications';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ClipboardList, Filter, Eye, X, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <ClipboardList className="w-10 h-10 text-blue-400" />
            My Applications
          </h1>
          <p className="text-slate-400">Track your job applications</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`p-4 rounded-xl text-left transition-all ${
              statusFilter === 'ALL' 
                ? 'bg-blue-500/20 border-2 border-blue-400 ring-2 ring-blue-400/30' 
                : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className={`text-2xl font-bold ${statusFilter === 'ALL' ? 'text-blue-400' : 'text-white'}`}>
              {applications.length}
            </div>
            <div className="text-slate-400 text-sm mt-1">Total Applied</div>
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`p-4 rounded-xl text-left transition-all ${
              statusFilter === 'PENDING' 
                ? 'bg-yellow-500/20 border-2 border-yellow-400' 
                : 'bg-yellow-500/10 border border-yellow-500/30 hover:border-yellow-400/50'
            }`}
          >
            <div className="text-2xl font-bold text-yellow-400">{getStatusCount('PENDING')}</div>
            <div className="text-yellow-300 text-sm mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('SHORTLISTED')}
            className={`p-4 rounded-xl text-left transition-all ${
              statusFilter === 'SHORTLISTED' 
                ? 'bg-purple-500/20 border-2 border-purple-400' 
                : 'bg-purple-500/10 border border-purple-500/30 hover:border-purple-400/50'
            }`}
          >
            <div className="text-2xl font-bold text-purple-400">{getStatusCount('SHORTLISTED')}</div>
            <div className="text-purple-300 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Shortlisted
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('ACCEPTED')}
            className={`p-4 rounded-xl text-left transition-all ${
              statusFilter === 'ACCEPTED' 
                ? 'bg-green-500/20 border-2 border-green-400' 
                : 'bg-green-500/10 border border-green-500/30 hover:border-green-400/50'
            }`}
          >
            <div className="text-2xl font-bold text-green-400">{getStatusCount('ACCEPTED')}</div>
            <div className="text-green-300 text-sm mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Accepted
            </div>
          </button>
        </div>

        {/* Status Filter Pills */}
        <div className="mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-300">Filter by Status:</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED'].map((status) => {
              const statusColors = getStatusColor(status);
              const count = getStatusCount(status);
              
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    statusFilter === status
                      ? `${statusColors.bg} ${statusColors.text} border-2 ${statusColors.border}`
                      : `bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700`
                  }`}
                >
                  {status !== 'ALL' && getStatusIcon(status)}
                  {status} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
            <ClipboardList className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {statusFilter === 'ALL' 
                ? 'No Applications Yet' 
                : `No ${statusFilter} Applications`}
            </h2>
            <p className="text-slate-400 mb-6">
              {statusFilter === 'ALL'
                ? 'Start applying to jobs to see your applications here'
                : 'No applications match this status filter'}
            </p>
            {statusFilter === 'ALL' ? (
              <Link
                to="/jobseeker/browse"
                className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 font-semibold transition-colors"
              >
                Browse Jobs
              </Link>
            ) : (
              <button
                onClick={() => setStatusFilter('ALL')}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all applications →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const statusColors = getStatusColor(application.status);
              
              return (
                <div
                  key={application.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{application.jobTitle}</h3>
                        <span className={`${statusColors.text} ${statusColors.bg} border ${statusColors.border} px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1`}>
                          {getStatusIcon(application.status)}
                          {application.status}
                        </span>
                      </div>

                      <p className="text-slate-400 font-medium mb-2">{application.jobCompany}</p>
                      <p className="text-slate-500 text-sm mb-4">📄 Resume: {application.resumeFilename}</p>

                      <div className="flex items-center gap-6 text-sm text-slate-400">
                        <span>📅 Applied {format(new Date(application.appliedAt), 'MMM dd, yyyy')}</span>
                        {application.reviewedAt && (
                          <span>👁️ Reviewed {format(new Date(application.reviewedAt), 'MMM dd, yyyy')}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="ml-6 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors font-medium whitespace-nowrap flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Application Details Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
                <h2 className="text-2xl font-bold text-white">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Job Position</h3>
                  <p className="text-white text-lg">{selectedApplication.jobTitle}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Company</h3>
                  <p className="text-slate-300">{selectedApplication.jobCompany}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Status</h3>
                  <span className={`inline-flex items-center gap-2 ${getStatusColor(selectedApplication.status).text} ${getStatusColor(selectedApplication.status).bg} border ${getStatusColor(selectedApplication.status).border} px-3 py-1 rounded-lg text-sm font-semibold`}>
                    {getStatusIcon(selectedApplication.status)}
                    {selectedApplication.status}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Resume Used</h3>
                  <p className="text-slate-300">{selectedApplication.resumeFilename}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Applied On</h3>
                  <p className="text-slate-300">{format(new Date(selectedApplication.appliedAt), 'MMMM dd, yyyy • h:mm a')}</p>
                </div>
                
                {selectedApplication.reviewedAt && (
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-1">Reviewed On</h3>
                    <p className="text-slate-300">{format(new Date(selectedApplication.reviewedAt), 'MMMM dd, yyyy • h:mm a')}</p>
                  </div>
                )}
                
                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-2">Cover Letter</h3>
                    <p className="text-slate-300 bg-slate-900/50 p-4 rounded-lg whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}
                
                {selectedApplication.recruiterNotes && (
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-2">Recruiter Notes</h3>
                    <p className="text-slate-300 bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                      {selectedApplication.recruiterNotes}
                    </p>
                  </div>
                )}

                {/* Status Messages */}
                {selectedApplication.status === 'ACCEPTED' && (
                  <div className="mt-4 p-4 bg-green-500/10 border-2 border-green-500/30 rounded-lg">
                    <h3 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Congratulations!
                    </h3>
                    <p className="text-green-300">
                      Your application has been accepted. The company may contact you soon with next steps.
                    </p>
                  </div>
                )}
                {selectedApplication.status === 'REJECTED' && (
                  <div className="mt-4 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-lg">
                    <h3 className="font-bold text-red-400 mb-2">Application Not Selected</h3>
                    <p className="text-red-300">
                      Unfortunately, your application was not selected for this position. Keep applying to other opportunities!
                    </p>
                  </div>
                )}
                {selectedApplication.status === 'SHORTLISTED' && (
                  <div className="mt-4 p-4 bg-purple-500/10 border-2 border-purple-500/30 rounded-lg">
                    <h3 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> You've Been Shortlisted!
                    </h3>
                    <p className="text-purple-300">
                      Great news! You've been shortlisted for this position. The company may reach out for an interview soon.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}