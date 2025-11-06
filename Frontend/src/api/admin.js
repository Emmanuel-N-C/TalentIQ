import apiClient from './client';

// Get platform statistics
export const fetchAdminStats = async () => {
  const response = await apiClient.get('/admin/stats');
  return response.data;
};

// Get all users with pagination and sorting
export const getAllUsers = async (page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'desc') => {
  const response = await apiClient.get('/admin/users', {
    params: { page, size, sortBy, sortDirection }
  });
  return response.data;
};

// Update user role
export const updateUserRole = async (userId, role) => {
  const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

// Delete user
export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/admin/users/${userId}`);
  return response.data;
};

// Get all jobs (admin view) with pagination
export const getAllJobsAdmin = async (page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'desc') => {
  const response = await apiClient.get('/admin/jobs', {
    params: { page, size, sortBy, sortDirection }
  });
  return response.data;
};

// Delete job (admin override)
export const deleteJobAdmin = async (jobId) => {
  const response = await apiClient.delete(`/admin/jobs/${jobId}`);
  return response.data;
};