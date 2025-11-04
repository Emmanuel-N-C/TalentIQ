import apiClient from './client';

// Save match result
export const saveMatch = async (matchData) => {
  const response = await apiClient.post('/match/save', matchData);
  return response.data;
};

// Get user's matches
export const getUserMatches = async () => {
  const response = await apiClient.get('/match/user');
  return response.data;
};

// Delete match - NEW
export const deleteMatch = async (matchId) => {
  const response = await apiClient.delete(`/match/${matchId}`);
  return response.data;
};