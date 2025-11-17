import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobApplications, updateApplicationStatus } from '../../api/applications';
import { getJobById } from '../../api/jobs';
import { getResumeFileBlobForRecruiter } from '../../api/resumes';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FileText, Eye, X, CheckCircle, XCircle, Clock, Users, Filter, ArrowLeft, Download, MapPin, Phone, Mail } from 'lucide-react';

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
  const [selectedResume, setSelectedResume] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

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

  const handleViewResume = async (application) => {
    if (!application.resumeId) {
      toast.error('Resume not available');
      return;
    }

    setSelectedResume({ ...application });
    setLoadingPreview(true);
    
    try {
      const s3Url = await getResumeFileBlobForRecruiter(application.resumeId);
      setPreviewUrl(s3Url); // Now stores S3 URL directly
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
    setPreviewUrl(null); // No need to revoke S3 URL
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
        src={application.userProfilePicturePath} // Direct S3 URL
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/recruiter/jobs')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Jobs
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-2 sm:gap-3">
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 flex-shrink-0" />
            <span className="break-words">Applications for {job?.title}</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">{job?.company}</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`p-3 sm:p-4 rounded-xl text-left transition-all ${
              statusFilter === 'ALL'
                ? 'bg-blue-500/20 border-2 border-blue-400'
                : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="text-xl sm:text-2xl font-bold text-white">{applications.length}</div>
            <div className="text-slate-400 text-xs sm:text-sm">Total</div>
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
            <div className="text-yellow-300 text-xs sm:text-sm flex items-center gap-1">
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
            <div className="text-purple-300 text-xs sm:text-sm flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Shortlisted
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
            <div className="text-green-300 text-xs sm:text-sm flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Accepted
            </div>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="mb-4 sm:mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-300 text-sm sm:text-base">Filter by Status:</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED'].map((status) => {
              const statusColors = getStatusColor(status);
              const count = getStatusCount(status);
              
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                    statusFilter === status
                      ? `${statusColors.bg} ${statusColors.text} border-2 ${statusColors.border}`
                      : `bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700`
                  }`}
                >
                  {status !== 'ALL' && getStatusIcon(status)}
                  <span className="whitespace-nowrap">{status} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 sm:p-12 text-center">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">
              {statusFilter === 'ALL'
                ? 'No Applications Yet'
                : `No ${statusFilter} Applications`}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {statusFilter === 'ALL'
                ? 'Applications will appear here once candidates apply'
                : 'No applications match this status filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredApplications.map((application) => {
              const statusColors = getStatusColor(application.status);
              
              return (
                <div
                  key={application.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:border-slate-600 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <ProfilePicture application={application} size="md" />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                            {application.userName || 'Anonymous'}
                          </h3>
                          <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{application.userEmail}</span>
                          </p>
                          {application.userLocation && (
                            <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{application.userLocation}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className={`${statusColors.text} ${statusColors.bg} border ${statusColors.border} px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-1`}>
                          {getStatusIcon(application.status)}
                          {application.status}
                        </span>
                      </div>

                      <p className="text-slate-400 text-xs sm:text-sm mb-2 flex items-center gap-1 truncate">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">Resume: {application.resumeFilename}</span>
                      </p>

                      <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">Applied {format(new Date(application.appliedAt), 'MMM dd, yyyy')}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row lg:flex-col gap-2 flex-wrap lg:flex-nowrap lg:ml-6">
                      {application.resumeId && (
                        <button
                          onClick={() => handleViewResume(application)}
                          className="px-3 sm:px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition font-medium whitespace-nowrap flex items-center gap-2 text-xs sm:text-sm"
                        >
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">View Resume</span>
                          <span className="sm:hidden">Resume</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="px-3 sm:px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition font-medium whitespace-nowrap flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">Details</span>
                      </button>

                      {application.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'SHORTLISTED')}
                            disabled={updatingId === application.id}
                            className="px-3 sm:px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition font-medium disabled:opacity-50 whitespace-nowrap flex items-center gap-2 text-xs sm:text-sm"
                          >
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                            disabled={updatingId === application.id}
                            className="px-3 sm:px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition font-medium disabled:opacity-50 whitespace-nowrap flex items-center gap-2 text-xs sm:text-sm"
                          >
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            Reject
                          </button>
                        </>
                      )}

                      {application.status === 'SHORTLISTED' && (
                        <button
                          onClick={() => handleStatusUpdate(application.id, 'INTERVIEWED')}
                          disabled={updatingId === application.id}
                          className="px-3 sm:px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition font-medium disabled:opacity-50 whitespace-nowrap flex items-center gap-2 text-xs sm:text-sm"
                        >
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Mark Interviewed</span>
                          <span className="sm:hidden">Interviewed</span>
                        </button>
                      )}

                      {application.status === 'INTERVIEWED' && (
                        <button
                          onClick={() => handleStatusUpdate(application.id, 'ACCEPTED')}
                          disabled={updatingId === application.id}
                          className="px-3 sm:px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition font-medium disabled:opacity-50 whitespace-nowrap flex items-center gap-2 text-xs sm:text-sm"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto">
              <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4">
                {/* Profile Section with Picture */}
                <div className="flex items-start gap-3 sm:gap-4 pb-4 border-b border-slate-700">
                  <ProfilePicture application={selectedApplication} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 break-words">
                      {selectedApplication.userName || 'Anonymous'}
                    </h3>
                    <p className="text-slate-400 text-sm sm:text-base flex items-center gap-1 mb-1 break-all">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{selectedApplication.userEmail}</span>
                    </p>
                    {selectedApplication.userPhone && (
                      <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-1">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        {selectedApplication.userPhone}
                      </p>
                    )}
                    {selectedApplication.userLocation && (
                      <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-1 truncate">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{selectedApplication.userLocation}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio Section */}
                {selectedApplication.userBio && (
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-2 text-sm sm:text-base">About</h3>
                    <p className="text-slate-300 bg-slate-900/50 p-3 rounded-lg text-sm whitespace-pre-wrap break-words">
                      {selectedApplication.userBio}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1 text-sm sm:text-base">Status</h3>
                  <span className={`inline-flex items-center gap-2 ${getStatusColor(selectedApplication.status).text} ${getStatusColor(selectedApplication.status).bg} border ${getStatusColor(selectedApplication.status).border} px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold`}>
                    {getStatusIcon(selectedApplication.status)}
                    {selectedApplication.status}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1 text-sm sm:text-base">Resume</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="text-slate-300 flex items-center gap-2 text-sm min-w-0">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{selectedApplication.resumeFilename}</span>
                    </p>
                    {selectedApplication.resumeId && (
                      <button
                        onClick={() => handleViewResume(selectedApplication)}
                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1 justify-center sm:justify-start"
                      >
                        <Eye className="w-4 h-4" />
                        View Resume
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1 text-sm sm:text-base">Applied On</h3>
                  <p className="text-slate-300 text-sm sm:text-base">{format(new Date(selectedApplication.appliedAt), 'MMMM dd, yyyy • h:mm a')}</p>
                </div>
                
                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-2 text-sm sm:text-base">Cover Letter</h3>
                    <p className="text-slate-300 bg-slate-900/50 p-3 sm:p-4 rounded-lg whitespace-pre-wrap text-sm break-words">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resume Preview Modal */}
        {selectedResume && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-6xl w-full h-[95vh] sm:h-[90vh] flex flex-col">
              <div className="p-3 sm:p-4 border-b border-slate-700 flex justify-between items-center">
                <div className="min-w-0 flex-1 mr-2">
                  <h2 className="text-base sm:text-xl font-bold text-white truncate">{selectedResume.resumeFilename || 'Resume'}</h2>
                  <p className="text-slate-400 text-xs sm:text-sm truncate">{selectedResume.userName || 'Anonymous'}</p>
                </div>
                <button
                  onClick={handleClosePreview}
                  className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-900">
                {loadingPreview ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : selectedResume.resumeFilename?.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={previewUrl ? `${previewUrl}#toolbar=0&navpanes=0&view=FitH` : ''}
                    className="w-full h-full"
                    title="Resume Preview"
                    style={{ border: 'none' }}
                  />
                ) : selectedResume.resumeFilename?.toLowerCase().match(/\.(docx?|doc)$/) ? (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mb-4" />
                    <p className="text-slate-300 mb-4 text-sm sm:text-base text-center">Word documents cannot be previewed directly in browser</p>
                    <a
                      href={previewUrl}
                      download={selectedResume.resumeFilename}
                      className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      Download to View
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-4">
                    <div className="text-center">
                      <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm sm:text-base">Preview not available for this file type</p>
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