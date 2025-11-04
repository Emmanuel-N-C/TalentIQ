import apiClient from './client';

// Get all jobs
export const getAllJobs = async () => {
  const response = await apiClient.get('/jobs');
  return response.data;
};

// Get paginated jobs
export const getJobsPaginated = async (page = 0, size = 10) => {
  const response = await apiClient.get('/jobs/paginated', {
    params: { page, size },
  });
  return response.data;
};

// Search jobs by keyword
export const searchJobs = async (keyword, page = 0, size = 10) => {
  const response = await apiClient.get('/jobs/search', {
    params: { keyword, page, size },
  });
  return response.data;
};

// Get job by ID
export const getJobById = async (jobId) => {
  const response = await apiClient.get(`/jobs/${jobId}`);
  return response.data;
};