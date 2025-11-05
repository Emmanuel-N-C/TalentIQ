import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../../api/jobs';
import { getJobApplications, updateApplicationStatus } from '../../api/applications';
import { downloadResume } from '../../api/resumes';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // NEW: Status filter

  useEffect(() => {
    fetchData();
  }, [jobId]);

  // NEW: Filter applications when status changes
  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
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
      navigate('/recruiter/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingId(applicationId);
      await updateApplicationStatus(applicationId, newStatus);
      toast.success(`Application status updated to ${newStatus}`);
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, reviewedAt: new Date().toISOString() }
          : app
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadResume = async (application) => {
    try {
      const response = await downloadResume(application.resumeId);
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', application.resumeFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Resume downloaded successfully');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      REVIEWING: 'bg-blue-100 text-blue-800 border-blue-300',
      SHORTLISTED: 'bg-purple-100 text-purple-800 border-purple-300',
      INTERVIEWED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      ACCEPTED: 'bg-green-100 text-green-800 border-green-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300',
      WITHDRAWN: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // NEW: Get count by status
  const getStatusCount = (status) => {
    if (status === 'ALL') return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/recruiter/jobs')}
        className="text-primary-600 hover:text-primary-700 mb-4"
      >
        ← Back to My Jobs
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{job?.title}</h1>
        <p className="text-gray-600 mt-1">{job?.company}</p>
        <div className="mt-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
          </span>
        </div>
      </div>

      {/* NEW: Status Filter Buttons */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-semibold mb-3">Filter by Status:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'ALL'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({getStatusCount('ALL')})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'PENDING'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            ⏳ Pending ({getStatusCount('PENDING')})
          </button>
          <button
            onClick={() => setStatusFilter('REVIEWING')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'REVIEWING'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            👀 Reviewing ({getStatusCount('REVIEWING')})
          </button>
          <button
            onClick={() => setStatusFilter('SHORTLISTED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'SHORTLISTED'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            }`}
          >
            ⭐ Shortlisted ({getStatusCount('SHORTLISTED')})
          </button>
          <button
            onClick={() => setStatusFilter('INTERVIEWED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'INTERVIEWED'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
            }`}
          >
            🎤 Interviewed ({getStatusCount('INTERVIEWED')})
          </button>
          <button
            onClick={() => setStatusFilter('ACCEPTED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'ACCEPTED'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            ✅ Accepted ({getStatusCount('ACCEPTED')})
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'REJECTED'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            ❌ Rejected ({getStatusCount('REJECTED')})
          </button>
        </div>
      </div>

      {/* Applications List - NOW SHOWS FILTERED */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-semibold mb-2">
            {statusFilter === 'ALL' 
              ? 'No Applications Yet' 
              : `No ${statusFilter} Applications`}
          </h2>
          <p className="text-gray-600">
            {statusFilter === 'ALL'
              ? 'Applications will appear here when job seekers apply'
              : 'No applications match this status filter'}
          </p>
          {statusFilter !== 'ALL' && (
            <button
              onClick={() => setStatusFilter('ALL')}
              className="mt-4 text-primary-600 hover:underline"
            >
              View all applications →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{application.userName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-2">✉️ {application.userEmail}</p>
                  <p className="text-gray-600 mb-4">📄 Resume: {application.resumeFilename}</p>

                  {application.coverLetter && (
                    <div className="mb-4">
                      <p className="font-semibold text-gray-700 mb-1">Cover Letter:</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded line-clamp-3">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>📅 Applied {format(new Date(application.appliedAt), 'MMM dd, yyyy')}</span>
                    {application.reviewedAt && (
                      <span>👁️ Reviewed {format(new Date(application.reviewedAt), 'MMM dd, yyyy')}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="ml-6 flex flex-col gap-2">
                  <button
                    onClick={() => handleDownloadResume(application)}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium whitespace-nowrap"
                  >
                    📥 Download Resume
                  </button>
                  
                  <button
                    onClick={() => setSelectedApplication(application)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium whitespace-nowrap"
                  >
                    👁️ View Details
                  </button>
                  
                  {application.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'REVIEWING')}
                        disabled={updatingId === application.id}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium whitespace-nowrap disabled:opacity-50"
                      >
                        📋 Mark Reviewing
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'SHORTLISTED')}
                        disabled={updatingId === application.id}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium whitespace-nowrap disabled:opacity-50"
                      >
                        ⭐ Shortlist
                      </button>
                    </>
                  )}

                  {application.status === 'REVIEWING' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'SHORTLISTED')}
                        disabled={updatingId === application.id}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium whitespace-nowrap disabled:opacity-50"
                      >
                        ⭐ Shortlist
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                        disabled={updatingId === application.id}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium whitespace-nowrap disabled:opacity-50"
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}

                  {application.status === 'SHORTLISTED' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'INTERVIEWED')}
                        disabled={updatingId === application.id}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition font-medium whitespace-nowrap disabled:opacity-50"
                      >
                        🎤 Mark Interviewed
                      </button>
                    </>
                  )}

                  {application.status === 'INTERVIEWED' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'ACCEPTED')}
                        disabled={updatingId === application.id}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium whitespace-nowrap disabled:opacity-50"
                      >
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                        disabled={updatingId === application.id}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium whitespace-nowrap disabled:opacity-50"
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Application Details</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Applicant Name</h3>
                <p className="text-gray-900">{selectedApplication.userName}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Email</h3>
                <p className="text-gray-900">{selectedApplication.userEmail}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Resume</h3>
                <div className="flex items-center gap-3">
                  <p className="text-gray-900">{selectedApplication.resumeFilename}</p>
                  <button
                    onClick={() => handleDownloadResume(selectedApplication)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
                  >
                    📥 Download
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Status</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusColor(selectedApplication.status)}`}>
                  {selectedApplication.status}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Applied On</h3>
                <p className="text-gray-900">{format(new Date(selectedApplication.appliedAt), 'MMMM dd, yyyy • h:mm a')}</p>
              </div>
              {selectedApplication.reviewedAt && (
                <div>
                  <h3 className="font-semibold text-gray-700">Reviewed On</h3>
                  <p className="text-gray-900">{format(new Date(selectedApplication.reviewedAt), 'MMMM dd, yyyy • h:mm a')}</p>
                </div>
              )}
              {selectedApplication.coverLetter && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Cover Letter</h3>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded whitespace-pre-wrap">
                    {selectedApplication.coverLetter}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}