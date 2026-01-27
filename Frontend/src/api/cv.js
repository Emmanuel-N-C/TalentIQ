import client from './client';

/**
 * CV API endpoints
 */

// Create new CV
export const createCV = async (cvData) => {
  const response = await client.post('/api/cv/create', cvData);
  return response.data;
};

// Update existing CV
export const updateCV = async (cvId, cvData) => {
  const response = await client.put(`/api/cv/${cvId}`, cvData);
  return response.data;
};

// Get CV by ID
export const getCVById = async (cvId) => {
  const response = await client.get(`/api/cv/${cvId}`);
  return response.data;
};

// Get all CVs for current user
export const getUserCVs = async () => {
  const response = await client.get('/api/cv/my-cvs');
  return response.data;
};

// Delete CV
export const deleteCV = async (cvId) => {
  const response = await client.delete(`/api/cv/${cvId}`);
  return response.data;
};

// Rename CV
export const renameCV = async (cvId, newTitle) => {
  const response = await client.put(`/api/cv/${cvId}/rename`, null, {
    params: { newTitle }
  });
  return response.data;
};

// Generate CV with AI
export const generateCVWithAI = async (aiRequest) => {
  const response = await client.post('/api/cv/generate-with-ai', aiRequest);
  return response.data;
};

// Import CV from existing resume
export const importCVFromResume = async (resumeId, templateId) => {
  const response = await client.post(`/api/cv/import-from-resume/${resumeId}`, null, {
    params: { templateId }
  });
  return response.data;
};

// Create CV from tailored resume (Resume Optimizer Beta)
export const createCVFromTailoredResume = async (tailoredRequest) => {
  const response = await client.post('/api/cv/from-tailored-resume', tailoredRequest);
  return response.data;
};

// Generate PDF from CV
export const generatePDF = async (cvId) => {
  const response = await client.post(`/api/cv/${cvId}/generate-pdf`);
  return response.data; // Returns S3 URL
};

// Download PDF directly
export const downloadPDF = async (cvId, filename) => {
  const response = await client.get(`/api/cv/${cvId}/download-pdf`, {
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename || 'cv.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return true;
};

