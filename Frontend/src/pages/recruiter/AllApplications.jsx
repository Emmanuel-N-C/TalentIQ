import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllRecruiterApplications, updateApplicationStatus } from '../../api/applications';
import { getResumeFileBlobForRecruiter } from '../../api/resumes';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FileText, Eye, CheckCircle, XCircle, Clock, Users, Mail, Briefcase, ArrowLeft, X, Download, MapPin, Phone } from 'lucide-react';

export default function AllApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [statusFilter, applications]);

  useEffect(() => {
    if (searchParams.get('status')) {
      setStatusFilter(searchParams.get('status'));
    }
  }, [searchParams]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getAllRecruiterApplications();
      console.log('Applications data:', data);
      setApplications(data);
      setFilteredApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
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

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    if (status === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const handleViewResume = async (application) => {
    if (!application.resumeId) {
      toast.error('Resume not available');
      return;
    }

    setSelectedResume({ ...application });
    setLoadingPreview(true);
    
    try {
      const blobUrl = await getResumeFileBlobForRecruiter(application.resumeId);
      setPreviewUrl(blobUrl);
    } catch (error) {
      console.error('Error loading resume:', error);
      toast.error('Failed to load resume');
      setSelectedResume(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClosePreview = () => {
    setSelectedResume(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
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

  // Helper component for profile picture with fallback
  const ProfilePicture = ({ application, size = 'md' }) => {
    const [imageError, setImageError] = useState(false);
    const sizeClasses = {
      sm: 'w-10 h-10 text-base',
      md: 'w-12 h-12 text-lg',
      lg: 'w-20 h-20 text-2xl',
    };

    if (!application.userProfilePicturePath || imageError) {
      return (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold`}>
          {application.userName?.charAt(0) || application.userEmail?.charAt(0) || 'A'}
        </div>
      );
    }

    return (
      <img
        src={`http://localhost:8080/api/user/profile-picture/${application.userId}`}
        alt={application.userName || 'Applicant'}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-blue-500`}
        onError={() => setImageError(true)}
      />
    );
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
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/recruiter/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <FileText className="w-10 h-10 text-blue-400" />
            All Applications
          </h1>
          <p className="text-slate-400">Manage all applications across your job postings</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <button
            onClick={() => handleFilterChange('ALL')}
            className={`p-4 rounded-xl text-left transition-all ${
              statusFilter === 'ALL'
                ? 'bg-blue-500/20 border-2 border-blue-400'
                : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="text-2xl font-bold text-white">{applications.length}</div>
            <div className="text-slate-400 text-sm">Total</div>
          </button>

          {['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={`p-4 rounded-xl text-left transition-all ${
                statusFilter === status
                  ? `${getStatusColor(status).bg} border-2 ${getStatusColor(status).border.replace('/30', '')}`
                  : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className={`text-2xl font-bold ${getStatusColor(status).text}`}>
                {getStatusCount(status)}
              </div>
              <div className="text-slate-400 text-sm capitalize">{status.toLowerCase()}</div>
            </button>
          ))}
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
                      <div className="flex items-center gap-3 mb-3">
                        <ProfilePicture application={application} size="md" />
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {application.userName || 'Anonymous'}
                          </h3>
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Mail className="w-3 h-3" />
                            {application.userEmail || 'N/A'}
                          </div>
                          {application.userLocation && (
                            <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" />
                              {application.userLocation}
                            </p>
                          )}
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
                            Applied {formatDate(application.appliedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border} flex items-center gap-1`}>
                          {getStatusIcon(application.status)}
                          {application.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {application.resumeId && (
                        <button
                          onClick={() => handleViewResume(application)}
                          className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          View Resume
                        </button>
                      )}
                      {application.status !== 'ACCEPTED' && application.status !== 'REJECTED' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'SHORTLISTED')}
                            disabled={updatingId === application.id}
                            className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                            disabled={updatingId === application.id}
                            className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/recruiter/jobs/${application.jobId}/applications`)}
                        className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Resume Preview Modal */}
        {selectedResume && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-6xl w-full h-[90vh] flex flex-col">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedResume.resumeFilename || 'Resume'}</h2>
                  <p className="text-slate-400 text-sm">{selectedResume.userName || 'Anonymous'}</p>
                </div>
                <button
                  onClick={handleClosePreview}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-900">
                {loadingPreview ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : selectedResume.resumeFilename?.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={previewUrl ? `${previewUrl}#toolbar=0&navpanes=0&view=FitH` : ''}
                    className="w-full h-full"
                    title="Resume Preview"
                    style={{ border: 'none' }}
                  />
                ) : selectedResume.resumeFilename?.toLowerCase().match(/\.(docx?|doc)$/) ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <FileText className="w-16 h-16 text-slate-600 mb-4" />
                    <p className="text-slate-300 mb-4">Word documents cannot be previewed directly in browser</p>
                    <a
                      href={previewUrl}
                      download={selectedResume.resumeFilename}
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download to View
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Preview not available for this file type</p>
                    </div>
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