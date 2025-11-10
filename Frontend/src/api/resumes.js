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

// Download resume file
export const downloadResume = async (resumeId) => {
  const response = await apiClient.get(`/resumes/${resumeId}/download`, {
    responseType: 'blob'
  });
  return response;
};

// Get resume file as blob for preview (Job Seeker - with authentication)
export const getResumeFileBlob = async (resumeId) => {
  const response = await apiClient.get(`/resumes/${resumeId}/file`, {
    responseType: 'blob'
  });
  return URL.createObjectURL(response.data);
};

// NEW: Get resume file as blob for preview (Recruiter - with authentication)
export const getResumeFileBlobForRecruiter = async (resumeId) => {
  const response = await apiClient.get(`/resumes/${resumeId}/file/recruiter`, {
    responseType: 'blob'
  });
  return URL.createObjectURL(response.data);
};

// Legacy function - kept for backward compatibility but not recommended for iframe use
export const getResumeFileUrl = (resumeId) => {
  return `http://localhost:8080/api/resumes/${resumeId}/file`;
};