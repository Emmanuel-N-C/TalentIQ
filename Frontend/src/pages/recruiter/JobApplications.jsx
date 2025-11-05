import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../../api/jobs';
import { getJobApplications, updateApplicationStatus } from '../../api/applications';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobData, applicationsData] = await Promise.all([
        getJobById(jobId),
        getJobApplications(jobId)
      ]);
      setJob(jobData);
      setApplications(applicationsData);
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

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      REVIEWING: 'bg-blue-100 text-blue-800',
      SHORTLISTED: 'bg-purple-100 text-purple-800',
      INTERVIEWED: 'bg-indigo-100 text-indigo-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      WITHDRAWN: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-semibold mb-2">No Applications Yet</h2>
          <p className="text-gray-600">
            Applications will appear here when job seekers apply
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{application.userName}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-2">✉️ {application.userEmail}</p>
                  <p className="text-gray-600 mb-4">📄 Resume: {application.resumeFilename}</p>

                  {application.coverLetter && (
                    <div className="mb-4">
                      <p className="font-semibold text-gray-700 mb-1">Cover Letter:</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">
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

                {/* Status Update Buttons */}
                <div className="ml-6 flex flex-col gap-2">
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
                <h3 className="font-semibold text-gray-700">Resume</h3>
                <p className="text-gray-900">{selectedApplication.resumeFilename}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Status</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                  {selectedApplication.status}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Applied On</h3>
                <p className="text-gray-900">{format(new Date(selectedApplication.appliedAt), 'MMMM dd, yyyy • h:mm a')}</p>
              </div>
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