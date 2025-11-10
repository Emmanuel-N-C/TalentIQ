import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobApplications, updateApplicationStatus } from '../../api/applications';
import { getJobById } from '../../api/jobs';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FileText, Eye, X, CheckCircle, XCircle, Clock, Users, Filter, ArrowLeft, Download } from 'lucide-react';

export default function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  useEffect(() => {
    filterApplications();
  }, [statusFilter, applications]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobData, applicationsData] = await Promise.all([
        getJobById(jobId),
        getJobApplications(jobId)
      ]);
      setJob(jobData);
      setApplications(applicationsData);
      setFilteredApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (statusFilter === 'ALL') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      await updateApplicationStatus(applicationId, newStatus);
      toast.success(`Application ${newStatus.toLowerCase()}`);
      
      // Update local state
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update application status');
    } finally {
      setUpdatingId(null);
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
    };
    return colors[status] || colors.PENDING;
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: Clock,
      REVIEWING: Eye,
      SHORTLISTED: CheckCircle,
      INTERVIEWED: Users,
      ACCEPTED: CheckCircle,
      REJECTED: XCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
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
          <button
            onClick={() => navigate('/recruiter/jobs')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Jobs
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <FileText className="w-10 h-10 text-blue-400" />
            Applications for {job?.title}
          </h1>
          <p className="text-slate-400">{job?.company}</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`p-4 rounded-xl text-left transition-all ${
              statusFilter === 'ALL'
                ? 'bg-blue-500/20 border-2 border-blue-400'
                : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="text-2xl font-bold text-white">{applications.length}</div>
            <div className="text-slate-400 text-sm">Total</div>
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
            <div className="text-yellow-300 text-sm flex items-center gap-1">
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
            <div className="text-purple-300 text-sm flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Shortlisted
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
            <div className="text-green-300 text-sm flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Accepted
            </div>
          </button>
        </div>

        {/* Filter Pills */}
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
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {statusFilter === 'ALL'
                ? 'No Applications Yet'
                : `No ${statusFilter} Applications`}
            </h2>
            <p className="text-slate-400">
              {statusFilter === 'ALL'
                ? 'Applications will appear here once candidates apply'
                : 'No applications match this status filter'}
            </p>
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
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg font-bold">
                          {application.applicantName?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{application.applicantName || 'Anonymous'}</h3>
                          <p className="text-slate-400 text-sm">{application.applicantEmail}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className={`${statusColors.text} ${statusColors.bg} border ${statusColors.border} px-3 py-1 rounded-lg text-sm font-semibold inline-flex items-center gap-1`}>
                          {getStatusIcon(application.status)}
                          {application.status}
                        </span>
                      </div>

                      <p className="text-slate-400 text-sm mb-2 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Resume: {application.resumeFilename}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Applied {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-6 flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition font-medium whitespace-nowrap flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>

                      {application.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'SHORTLISTED')}
                            disabled={updatingId === application.id}
                            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition font-medium disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                            disabled={updatingId === application.id}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition font-medium disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}

                      {application.status === 'SHORTLISTED' && (
                        <button
                          onClick={() => handleStatusUpdate(application.id, 'INTERVIEWED')}
                          disabled={updatingId === application.id}
                          className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition font-medium disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                        >
                          <Users className="w-4 h-4" />
                          Mark Interviewed
                        </button>
                      )}

                      {application.status === 'INTERVIEWED' && (
                        <button
                          onClick={() => handleStatusUpdate(application.id, 'ACCEPTED')}
                          disabled={updatingId === application.id}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition font-medium disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                      )}
                    </div>
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
                  <h3 className="font-semibold text-blue-400 mb-1">Applicant Name</h3>
                  <p className="text-white text-lg">{selectedApplication.applicantName || 'Anonymous'}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Email</h3>
                  <p className="text-slate-300">{selectedApplication.applicantEmail}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Status</h3>
                  <span className={`inline-flex items-center gap-2 ${getStatusColor(selectedApplication.status).text} ${getStatusColor(selectedApplication.status).bg} border ${getStatusColor(selectedApplication.status).border} px-3 py-1 rounded-lg text-sm font-semibold`}>
                    {getStatusIcon(selectedApplication.status)}
                    {selectedApplication.status}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Resume</h3>
                  <p className="text-slate-300 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {selectedApplication.resumeFilename}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Applied On</h3>
                  <p className="text-slate-300">{format(new Date(selectedApplication.appliedAt), 'MMMM dd, yyyy • h:mm a')}</p>
                </div>
                
                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-2">Cover Letter</h3>
                    <p className="text-slate-300 bg-slate-900/50 p-4 rounded-lg whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
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