import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/formatters';
import { getUserStats } from '../../api/admin';
import ConfirmDialog from '../common/ConfirmDialog';
import { X, User, Calendar, Activity } from 'lucide-react';

export default function UserDetailsModal({ user, onClose, onDelete }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await onDelete(user.id);
      onClose();
    } catch (error) {
      setDeleting(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'RECRUITER': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'JOB_SEEKER': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
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
          className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-sm" 
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-slate-800 border border-slate-700 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-blue-600">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{user.fullName}</h3>
                  <p className="text-blue-100 mt-1">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* User Info */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                User Information
              </h4>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">User ID:</span>
                  <span className="font-medium text-white">{user.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Role:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Joined:</span>
                  <span className="font-medium text-white">{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Last Updated:</span>
                  <span className="font-medium text-white">{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Activity Statistics
              </h4>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {user.role === 'RECRUITER' && (
                    <>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{stats?.jobsPosted || 0}</div>
                        <div className="text-sm text-blue-300 mt-1">Jobs Posted</div>
                      </div>
                      <div className="col-span-2 bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-center justify-center">
                        <div className="text-center text-slate-400">
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
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-400">{stats?.resumesUploaded || 0}</div>
                        <div className="text-sm text-green-300 mt-1">Resumes</div>
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-orange-400">{stats?.applicationsSubmitted || 0}</div>
                        <div className="text-sm text-orange-300 mt-1">Applications</div>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-center justify-center">
                        <div className="text-center text-slate-400">
                          <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  )}
                  {user.role === 'ADMIN' && (
                    <div className="col-span-3 bg-purple-500/10 border border-purple-500/20 rounded-lg p-6 text-center">
                      <svg className="w-16 h-16 mx-auto mb-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div className="text-lg font-semibold text-purple-400">Administrator Account</div>
                      <div className="text-sm text-purple-300 mt-1">Full platform access & management</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-900/50 border-t border-slate-700 px-6 py-4 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            {user.role !== 'ADMIN' && (
              <button
                onClick={handleDeleteClick}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete ${user.fullName}? This will permanently remove their account, all resumes, applications, and associated data. This action cannot be undone.`}
        confirmText="Delete User"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}