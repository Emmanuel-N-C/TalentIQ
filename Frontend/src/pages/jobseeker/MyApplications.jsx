import { useState, useEffect } from 'react';
import { getMyApplications } from '../../api/applications';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // NEW: Status filter

  useEffect(() => {
    fetchApplications();
  }, []);

  // NEW: Filter applications when status changes
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
      console.log('📄 My applications:', data);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-gray-600 mt-1">Track your job applications</p>
      </div>

      {/* Stats Summary - Clickable Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-lg shadow-md text-left transition hover:shadow-lg ${
            statusFilter === 'ALL' ? 'ring-2 ring-primary-600 bg-primary-50' : 'bg-white'
          }`}
        >
          <div className={`text-2xl font-bold ${statusFilter === 'ALL' ? 'text-primary-600' : 'text-primary-600'}`}>
            {applications.length}
          </div>
          <div className="text-gray-600 text-sm mt-1">Total Applied</div>
        </button>

        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`p-4 rounded-lg shadow-md text-left transition hover:shadow-lg ${
            statusFilter === 'PENDING' ? 'ring-2 ring-yellow-600 bg-yellow-50' : 'bg-yellow-50'
          }`}
        >
          <div className="text-2xl font-bold text-yellow-700">
            {getStatusCount('PENDING')}
          </div>
          <div className="text-yellow-800 text-sm mt-1">⏳ Pending</div>
        </button>

        <button
          onClick={() => setStatusFilter('SHORTLISTED')}
          className={`p-4 rounded-lg shadow-md text-left transition hover:shadow-lg ${
            statusFilter === 'SHORTLISTED' ? 'ring-2 ring-purple-600 bg-purple-50' : 'bg-purple-50'
          }`}
        >
          <div className="text-2xl font-bold text-purple-700">
            {getStatusCount('SHORTLISTED')}
          </div>
          <div className="text-purple-800 text-sm mt-1">⭐ Shortlisted</div>
        </button>

        <button
          onClick={() => setStatusFilter('ACCEPTED')}
          className={`p-4 rounded-lg shadow-md text-left transition hover:shadow-lg ${
            statusFilter === 'ACCEPTED' ? 'ring-2 ring-green-600 bg-green-50' : 'bg-green-50'
          }`}
        >
          <div className="text-2xl font-bold text-green-700">
            {getStatusCount('ACCEPTED')}
          </div>
          <div className="text-green-800 text-sm mt-1">✅ Accepted</div>
        </button>
      </div>

      {/* NEW: Additional Status Filter Buttons */}
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
          <p className="text-gray-600 mb-6">
            {statusFilter === 'ALL'
              ? 'Start applying to jobs to see your applications here'
              : 'No applications match this status filter'}
          </p>
          {statusFilter === 'ALL' ? (
            <a
              href="/jobseeker/browse"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold"
            >
              Browse Jobs
            </a>
          ) : (
            <button
              onClick={() => setStatusFilter('ALL')}
              className="text-primary-600 hover:underline"
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
                    <h3 className="text-xl font-bold text-gray-900">{application.jobTitle}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)} {application.status}
                    </span>
                  </div>

                  <p className="text-gray-600 font-medium mb-2">{application.jobCompany}</p>
                  <p className="text-gray-600 mb-4">📄 Resume: {application.resumeFilename}</p>

                  {application.coverLetter && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        <span className="font-semibold">Cover Letter:</span> {application.coverLetter}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>📅 Applied {format(new Date(application.appliedAt), 'MMM dd, yyyy')}</span>
                    {application.reviewedAt && (
                      <span>👁️ Reviewed {format(new Date(application.reviewedAt), 'MMM dd, yyyy')}</span>
                    )}
                  </div>

                  {/* Status-specific messages */}
                  {application.status === 'PENDING' && (
                    <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-sm">
                      ⏳ Your application is waiting for review
                    </div>
                  )}
                  {application.status === 'REVIEWING' && (
                    <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-400 text-blue-700 text-sm">
                      👀 Your application is being reviewed
                    </div>
                  )}
                  {application.status === 'SHORTLISTED' && (
                    <div className="mt-3 p-2 bg-purple-50 border-l-4 border-purple-400 text-purple-700 text-sm">
                      ⭐ Congratulations! You've been shortlisted
                    </div>
                  )}
                  {application.status === 'INTERVIEWED' && (
                    <div className="mt-3 p-2 bg-indigo-50 border-l-4 border-indigo-400 text-indigo-700 text-sm">
                      🎤 You've completed the interview stage
                    </div>
                  )}
                  {application.status === 'ACCEPTED' && (
                    <div className="mt-3 p-2 bg-green-50 border-l-4 border-green-400 text-green-700 text-sm">
                      🎉 Congratulations! Your application has been accepted
                    </div>
                  )}
                  {application.status === 'REJECTED' && (
                    <div className="mt-3 p-2 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
                      ❌ Unfortunately, your application was not selected
                    </div>
                  )}
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
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusColor(selectedApplication.status)}`}>
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

              {/* Status-specific messages in modal */}
              {selectedApplication.status === 'ACCEPTED' && (
                <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-2">🎉 Congratulations!</h3>
                  <p className="text-green-700">
                    Your application has been accepted. The company may contact you soon with next steps.
                  </p>
                </div>
              )}
              {selectedApplication.status === 'REJECTED' && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <h3 className="font-bold text-red-800 mb-2">Application Not Selected</h3>
                  <p className="text-red-700">
                    Unfortunately, your application was not selected for this position. Keep applying to other opportunities!
                  </p>
                </div>
              )}
              {selectedApplication.status === 'SHORTLISTED' && (
                <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <h3 className="font-bold text-purple-800 mb-2">⭐ You've Been Shortlisted!</h3>
                  <p className="text-purple-700">
                    Great news! You've been shortlisted for this position. The company may reach out for an interview soon.
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