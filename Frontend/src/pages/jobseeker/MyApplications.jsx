import { useState, useEffect } from 'react';
import { getMyApplications } from '../../api/applications';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getMyApplications();
      console.log('📄 My applications:', data);
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: '⏳',
      REVIEWING: '👀',
      SHORTLISTED: '⭐',
      INTERVIEWED: '🎤',
      ACCEPTED: '✅',
      REJECTED: '❌',
      WITHDRAWN: '🚫'
    };
    return icons[status] || '📄';
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-gray-600 mt-1">Track your job applications</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-primary-600">{applications.length}</div>
          <div className="text-gray-600 text-sm">Total Applied</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-700">
            {applications.filter(a => a.status === 'PENDING').length}
          </div>
          <div className="text-yellow-800 text-sm">Pending</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-700">
            {applications.filter(a => a.status === 'SHORTLISTED').length}
          </div>
          <div className="text-purple-800 text-sm">Shortlisted</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-700">
            {applications.filter(a => a.status === 'ACCEPTED').length}
          </div>
          <div className="text-green-800 text-sm">Accepted</div>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-semibold mb-2">No Applications Yet</h2>
          <p className="text-gray-600 mb-6">
            Start applying to jobs to see your applications here
          </p>
          <a
            href="/jobseeker/browse"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold"
          >
            Browse Jobs
          </a>
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
                    <h3 className="text-xl font-bold text-gray-900">{application.jobTitle}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)} {application.status}
                    </span>
                  </div>

                  <p className="text-gray-600 font-medium mb-2">{application.jobCompany}</p>
                  <p className="text-gray-600 mb-4">📄 Resume: {application.resumeFilename}</p>

                  {application.coverLetter && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        Cover Letter: {application.coverLetter.substring(0, 100)}
                        {application.coverLetter.length > 100 && '...'}
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

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedApplication(application)}
                  className="ml-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium whitespace-nowrap"
                >
                  View Details
                </button>
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
                <h3 className="font-semibold text-gray-700">Job Position</h3>
                <p className="text-gray-900 text-lg">{selectedApplication.jobTitle}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Company</h3>
                <p className="text-gray-900">{selectedApplication.jobCompany}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Status</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                  {getStatusIcon(selectedApplication.status)} {selectedApplication.status}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Resume Used</h3>
                <p className="text-gray-900">{selectedApplication.resumeFilename}</p>
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
              {selectedApplication.recruiterNotes && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Recruiter Notes</h3>
                  <p className="text-gray-900 bg-blue-50 p-4 rounded">
                    {selectedApplication.recruiterNotes}
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