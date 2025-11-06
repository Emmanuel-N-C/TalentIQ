import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/formatters';
import { getUserStats } from '../../api/admin';

export default function UserDetailsModal({ user, onClose, onDelete }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUserStats();
  }, [user.id]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const data = await getUserStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading user stats:', error);
      setStats({ jobsPosted: 0, resumesUploaded: 0, applicationsSubmitted: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${user.fullName}? This action cannot be undone.`)) {
      setDeleting(true);
      try {
        await onDelete(user.id);
        onClose();
      } catch (error) {
        setDeleting(false);
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'RECRUITER': return 'bg-blue-100 text-blue-800';
      case 'JOB_SEEKER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'JOB_SEEKER': return 'Job Seeker';
      case 'RECRUITER': return 'Recruiter';
      case 'ADMIN': return 'Admin';
      default: return role;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{user.fullName}</h3>
                  <p className="text-primary-100 mt-1">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* User Info */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">User Information</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-medium text-gray-900">{user.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Role:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium text-gray-900">{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium text-gray-900">{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Activity Statistics</h4>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {user.role === 'RECRUITER' && (
                    <>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats?.jobsPosted || 0}</div>
                        <div className="text-sm text-blue-800 mt-1">Jobs Posted</div>
                      </div>
                      <div className="col-span-2 bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">Recruiter Account</p>
                        </div>
                      </div>
                    </>
                  )}
                  {user.role === 'JOB_SEEKER' && (
                    <>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{stats?.resumesUploaded || 0}</div>
                        <div className="text-sm text-green-800 mt-1">Resumes</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-orange-600">{stats?.applicationsSubmitted || 0}</div>
                        <div className="text-sm text-orange-800 mt-1">Applications</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  )}
                  {user.role === 'ADMIN' && (
                    <div className="col-span-3 bg-purple-50 rounded-lg p-6 text-center">
                      <svg className="w-16 h-16 mx-auto mb-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div className="text-lg font-semibold text-purple-800">Administrator Account</div>
                      <div className="text-sm text-purple-600 mt-1">Full platform access & management</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
            {user.role !== 'ADMIN' && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}