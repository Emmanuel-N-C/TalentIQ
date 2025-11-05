import apiClient from './client';

// Job seeker applies to a job
export const applyToJob = async (applicationData) => {
  const response = await apiClient.post('/applications', applicationData);
  return response.data;
};

// Job seeker gets their applications
export const getMyApplications = async () => {
  const response = await apiClient.get('/applications/my-applications');
  return response.data;
};

// Recruiter gets applications for a specific job
export const getJobApplications = async (jobId) => {
  const response = await apiClient.get(`/applications/job/${jobId}`);
  return response.data;
};

// Recruiter gets all applications across all jobs
export const getAllRecruiterApplications = async () => {
  const response = await apiClient.get('/applications/recruiter/all');
  return response.data;
};

// Recruiter updates application status
export const updateApplicationStatus = async (applicationId, status, notes = '') => {
  const response = await apiClient.put(
    `/applications/${applicationId}/status`,
    null,
    {
      params: { status, notes }
    }
  );
  return response.data;
};

// Recruiter gets job statistics
export const getJobStats = async (jobId) => {
  const response = await apiClient.get(`/applications/job/${jobId}/stats`);
  return response.data;
};