import apiClient from './client';

export const authAPI = {
  // Register user (sends OTP)
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    const response = await apiClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email) => {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // OAuth Login
  oauthLogin: async (token, provider, role) => {
    const response = await apiClient.post('/auth/oauth/login', {
      token,
      provider,
      role
    });
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset Password
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};