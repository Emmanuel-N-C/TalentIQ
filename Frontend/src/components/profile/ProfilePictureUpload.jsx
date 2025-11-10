import { useState, useRef } from 'react';
import { Camera, X, Upload, Trash2 } from 'lucide-react';
import { uploadProfilePicture, deleteProfilePicture, getProfilePictureUrl } from '../../api/user';
import toast from 'react-hot-toast';

export default function ProfilePictureUpload({ user, onProfileUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const currentProfilePicture = user?.profilePictureUrl 
    ? `http://localhost:8080${user.profilePictureUrl}`
    : null;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      toast.error('Only JPEG and PNG images are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must not exceed 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const response = await uploadProfilePicture(selectedFile);
      toast.success('Profile picture updated successfully!');
      setPreviewUrl(null);
      setSelectedFile(null);
      if (onProfileUpdate) {
        onProfileUpdate(response);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.response?.data?.error || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProfilePicture();
      toast.success('Profile picture removed successfully!');
      setPreviewUrl(null);
      setSelectedFile(null);
      if (onProfileUpdate) {
        onProfileUpdate({ ...user, profilePictureUrl: null });
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      toast.error('Failed to delete profile picture');
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5 text-blue-400" />
        Profile Picture
      </h3>

      <div className="flex flex-col items-center gap-4">
        {/* Current/Preview Picture */}
        <div className="relative">
          {previewUrl || currentProfilePicture ? (
            <img
              src={previewUrl || currentProfilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-slate-700"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold text-white">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {previewUrl ? (
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {currentProfilePicture ? 'Change Photo' : 'Upload Photo'}
            </button>
            {currentProfilePicture && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />

        <p className="text-xs text-slate-400 text-center">
          JPEG or PNG. Max size 5MB.
        </p>
      </div>
    </div>
  );
}

