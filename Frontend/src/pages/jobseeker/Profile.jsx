import { useState, useEffect } from 'react';
import { User as UserIcon, Calendar, Shield, AlertCircle, Trash2 } from 'lucide-react';
import { getCurrentUserProfile, deleteAccount } from '../../api/user';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfilePictureUpload from '../../components/profile/ProfilePictureUpload';
import ProfileInfoForm from '../../components/profile/ProfileInfoForm';
import PasswordChangeForm from '../../components/profile/PasswordChangeForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Profile() {
  const { user: authUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    // Simply pass the updated profile data - let updateUser handle merging
    updateUser(updatedProfile);
    // Force navbar refresh by triggering a small state change
    window.dispatchEvent(new Event('profileUpdated'));
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success('Your account has been deleted successfully');
      
      // Log out user and redirect
      setTimeout(() => {
        logout();
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.error || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if user needs to complete their profile (OAuth users with default name)
  const needsProfileCompletion = profile?.authProvider && 
    profile.authProvider !== 'LOCAL' && 
    (!profile.fullName || profile.fullName === 'User');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <UserIcon className="w-10 h-10 text-blue-400" />
            My Profile
          </h1>
          <p className="text-slate-400">Manage your personal information and settings</p>
        </div>

        {/* Profile Completion Alert for OAuth Users */}
        {needsProfileCompletion && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-300 font-medium mb-1">
                Complete Your Profile
              </p>
              <p className="text-slate-300 text-sm">
                Please update your full name below to complete your profile setup.
              </p>
            </div>
          </div>
        )}

        {/* Account Info Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-400">Account Status</p>
              <p className="text-white font-medium flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Active
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Member Since</p>
              <p className="text-white font-medium mt-1">
                {profile?.createdAt ? format(new Date(profile.createdAt), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Last Updated</p>
              <p className="text-white font-medium mt-1">
                {profile?.updatedAt ? format(new Date(profile.updatedAt), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Picture */}
          <div className="lg:col-span-1">
            <ProfilePictureUpload user={profile} onProfileUpdate={handleProfileUpdate} />
          </div>

          {/* Middle Column - Profile Info */}
          <div className="lg:col-span-2">
            <ProfileInfoForm user={profile} onProfileUpdate={handleProfileUpdate} />
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Security & Privacy
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PasswordChangeForm user={profile} />
              
              {/* Delete Account Section */}
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  Delete Account
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-300">
                    <strong>Warning:</strong> Deleting your account will:
                  </p>
                  <ul className="text-xs text-red-300 mt-2 space-y-1 ml-4">
                    <li>• Remove all your resumes</li>
                    <li>• Delete all your job applications</li>
                    <li>• Remove your profile data</li>
                    <li>• This action is permanent and irreversible</li>
                  </ul>
                </div>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete My Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you absolutely sure you want to delete your account? This will permanently remove all your data including resumes, applications, and profile information. This action cannot be undone."
        confirmText="Yes, Delete My Account"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}