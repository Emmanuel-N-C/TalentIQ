import apiClient from './client';

// Get current user profile
export const getCurrentUserProfile = async () => {
  const response = await apiClient.get('/user/profile');
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await apiClient.put('/user/profile', profileData);
  return response.data;
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await apiClient.put('/user/password', passwordData);
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

// Get profile picture URL
export const getProfilePictureUrl = (userId) => {
  return `http://localhost:8080/api/user/profile-picture/${userId}`;
};

// Delete profile picture
export const deleteProfilePicture = async () => {
  const response = await apiClient.delete('/user/profile-picture');
  return response.data;
};

