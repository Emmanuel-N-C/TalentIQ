import apiClient from './client';

// Get current user profile
export const getCurrentUserProfile = async () => {
  const response = await apiClient.get('/user/profile');
  return response.data;
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  const response = await apiClient.put('/user/profile', profileData);
  return response.data;
};

// Change password - FIXED: Now calls the correct endpoint
export const changePassword = async (passwordData) => {
  const response = await apiClient.post('/auth/change-password', passwordData);
  return response.data;
};

// Upload profile picture
export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/user/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Delete profile picture
export const deleteProfilePicture = async () => {
  const response = await apiClient.delete('/user/profile-picture');
  return response.data;
};

// Delete user account
export const deleteAccount = async () => {
  const response = await apiClient.delete('/user/account');
  return response.data;
};