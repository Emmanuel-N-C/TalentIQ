import apiClient from './client';

// Get user's saved jobs (matches)
export const getMyMatches = async () => {
  const response = await apiClient.get('/match/user');
  return response.data;
};

// Save a match (save a job)
export const saveMatch = async (matchData) => {
  const response = await apiClient.post('/match', matchData);
  return response.data;
};

// Delete a match (remove saved job)
export const deleteMatch = async (matchId) => {
  const response = await apiClient.delete(`/match/${matchId}`);
  return response.data;
};