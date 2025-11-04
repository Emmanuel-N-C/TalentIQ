import apiClient from './client';

// Upload resume file
export const uploadResume = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

  return response.data;
};

// Get user's resumes
export const getUserResumes = async () => {
  const response = await apiClient.get('/resumes');
  return response.data;
};

// Get extracted text from resume
export const getResumeText = async (resumeId) => {
  const response = await apiClient.get(`/resumes/${resumeId}/text`);
  return response.data;
};

// Delete resume
export const deleteResume = async (resumeId) => {
  const response = await apiClient.delete(`/resumes/${resumeId}`);
  return response.data;
};