import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Calendar, Shield, AlertCircle } from 'lucide-react';
import { getCurrentUserProfile } from '../../api/user';
import { useAuth } from '../../context/AuthContext';
import ProfilePictureUpload from '../../components/profile/ProfilePictureUpload';
import ProfileInfoForm from '../../components/profile/ProfileInfoForm';
import PasswordChangeForm from '../../components/profile/PasswordChangeForm';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Settings() {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
    // Force navbar refresh
    window.dispatchEvent(new Event('profileUpdated'));
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
            <SettingsIcon className="w-10 h-10 text-blue-400" />
            Settings
          </h1>
          <p className="text-slate-400">Manage your account and company information</p>
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
              <p className="text-sm text-slate-400">Account Type</p>
              <p className="text-white font-medium mt-1">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                  Recruiter
                </span>
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
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                <h4 className="text-white font-semibold mb-3">Security Tips</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Use a strong, unique password with at least 8 characters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Include uppercase, lowercase, numbers, and special characters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Never share your password with anyone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Change your password regularly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Keep your company information up to date</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}