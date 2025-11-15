import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRecruiterApplications, updateApplicationStatus } from '../../api/applications';
import { getResumeFileBlobForRecruiter } from '../../api/resumes';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Star, FileText, Eye, CheckCircle, XCircle, Clock, Users, Mail, Briefcase, ArrowLeft, X, Download, MapPin, Phone } from 'lucide-react';

export default function ShortlistedCandidates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    fetchShortlistedApplications();
  }, []);

  const fetchShortlistedApplications = async () => {
    try {
      setLoading(true);
      const data = await getAllRecruiterApplications();
      // Filter only SHORTLISTED applications
      const shortlisted = data.filter(app => app.status === 'SHORTLISTED');
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
      
      // Remove from list if no longer shortlisted
      if (newStatus !== 'SHORTLISTED') {
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

  // Helper component for profile picture with fallback
  const ProfilePicture = ({ application, size = 'md' }) => {
    const [imageError, setImageError] = useState(false);
    const sizeClasses = {
      sm: 'w-10 h-10 text-base',
      md: 'w-12 h-12 text-lg',
      lg: 'w-16 h-16 text-xl',
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
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-purple-500`}
        onError={() => setImageError(true)}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/recruiter/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Star className="w-10 h-10 text-purple-400" />
            Shortlisted Candidates
          </h1>
          <p className="text-slate-400">Review and manage your top candidates</p>
        </div>

        {/* Stats Card */}
        <div className="bg-purple-500/10 border-2 border-purple-400/50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-purple-400">{applications.length}</h2>
              <p className="text-slate-300">Shortlisted Candidates</p>
            </div>
            <Star className="w-12 h-12 text-purple-400" />
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
            <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Shortlisted Candidates Yet</h2>
            <p className="text-slate-400">Candidates you shortlist will appear here</p>
            <button
              onClick={() => navigate('/recruiter/applications')}
              className="mt-4 px-6 py-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors font-medium"
            >
              View All Applications
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-slate-800/50 backdrop-blur-sm border-2 border-purple-400/30 rounded-xl p-6 hover:border-purple-400/50 transition-all"
              >
                {/* Profile Section */}
                <div className="flex items-start gap-4 mb-4">
                  <ProfilePicture application={application} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1 truncate">
                      {application.userName || 'Anonymous'}
                    </h3>
                    <p className="text-slate-400 text-sm flex items-center gap-1 mb-1">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{application.userEmail}</span>
                    </p>
                    {application.userLocation && (
                      <p className="text-slate-500 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {application.userLocation}
                      </p>
                    )}
                    {application.userPhone && (
                      <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        {application.userPhone}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-purple-400/30">
                      <Star className="w-3 h-3" />
                      SHORTLISTED
                    </div>
                  </div>
                </div>

                {/* Job Info */}
                <div className="mb-4 pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm font-medium">{application.jobTitle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">Applied {formatDate(application.appliedAt)}</span>
                  </div>
                </div>

                {/* Bio Preview */}
                {application.userBio && (
                  <div className="mb-4 bg-slate-900/50 p-3 rounded-lg">
                    <p className="text-slate-300 text-sm line-clamp-2">
                      {application.userBio}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {application.resumeId && (
                    <button
                      onClick={() => handleViewResume(application)}
                      className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      Resume
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/recruiter/jobs/${application.jobId}/applications`)}
                    className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                </div>

                {/* Status Update Buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'INTERVIEWED')}
                    disabled={updatingId === application.id}
                    className="flex-1 px-3 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <Users className="w-4 h-4" />
                    Interview
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                    disabled={updatingId === application.id}
                    className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
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