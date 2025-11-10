import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRecruiterApplications, updateApplicationStatus } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { UserCheck, Mail, Briefcase, Clock, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function ShortlistedCandidates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchShortlistedApplications();
  }, []);

  const fetchShortlistedApplications = async () => {
    try {
      setLoading(true);
      const data = await getAllRecruiterApplications();
      // Filter only shortlisted and interviewed candidates
      const shortlisted = data.filter(app => 
        app.status === 'SHORTLISTED' || app.status === 'INTERVIEWED'
      );
      setApplications(shortlisted);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load shortlisted candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      await updateApplicationStatus(applicationId, newStatus);
      toast.success(`Application ${newStatus.toLowerCase()}`);
      
      // Remove from list if rejected or accepted
      if (newStatus === 'REJECTED' || newStatus === 'ACCEPTED') {
        setApplications(applications.filter(app => app.id !== applicationId));
      } else {
        setApplications(applications.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update application status');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      SHORTLISTED: { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
      INTERVIEWED: { text: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/30' },
    };
    return colors[status] || colors.SHORTLISTED;
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
            <UserCheck className="w-10 h-10 text-purple-400" />
            Shortlisted Candidates
          </h1>
          <p className="text-slate-400">Manage your shortlisted and interviewed candidates</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-400">{applications.filter(a => a.status === 'SHORTLISTED').length}</div>
            <div className="text-slate-400 text-sm mt-1">Shortlisted</div>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-indigo-400">{applications.filter(a => a.status === 'INTERVIEWED').length}</div>
            <div className="text-slate-400 text-sm mt-1">Interviewed</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-400">{applications.length}</div>
            <div className="text-slate-400 text-sm mt-1">Total Candidates</div>
          </div>
        </div>

        {/* Candidates List */}
        {applications.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
            <UserCheck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Shortlisted Candidates</h2>
            <p className="text-slate-400">Candidates you shortlist will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusColors = getStatusColor(application.status);
              
              return (
                <div
                  key={application.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-xl font-bold">
                          {application.applicantName?.charAt(0) || application.applicantEmail?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {application.applicantName || application.jobseekerName || 'Anonymous'}
                          </h3>
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Mail className="w-3 h-3" />
                            {application.applicantEmail || application.jobseekerEmail || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Briefcase className="w-4 h-4" />
                          <span className="text-sm">{application.jobTitle || 'Job Title N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            Applied {formatDate(application.appliedDate || application.createdAt || application.submittedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                          {application.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {application.status === 'SHORTLISTED' && (
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'INTERVIEWED')}
                            disabled={updatingId === application.id}
                            className="px-3 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Mark Interviewed
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusUpdate(application.id, 'ACCEPTED')}
                          disabled={updatingId === application.id}
                          className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                          disabled={updatingId === application.id}
                          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                      <button
                        onClick={() => navigate(`/recruiter/jobs/${application.jobId}/applications`)}
                        className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
                      >
                        View Full Details
                      </button>
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