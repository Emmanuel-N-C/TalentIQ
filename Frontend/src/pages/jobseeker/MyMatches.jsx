import { useState, useEffect } from 'react';
import { getUserMatches, deleteMatch } from '../../api/matches';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function MyMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await getUserMatches();
      console.log('📊 Fetched matches:', data);
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (match) => {
    // Parse the analysis result JSON
    try {
      const analysis = JSON.parse(match.analysisResult);
      setSelectedMatch({ ...match, analysis });
    } catch (error) {
      console.error('Error parsing analysis:', error);
      toast.error('Failed to load match details');
    }
  };

  // NEW: Handle delete
  const handleDelete = async (matchId) => {
    if (!window.confirm('Are you sure you want to delete this match?')) {
      return;
    }

    try {
      setDeletingId(matchId);
      await deleteMatch(matchId);
      toast.success('Match deleted successfully');
      
      // Remove from local state
      setMatches(matches.filter(m => m.id !== matchId));
      
      // Close modal if the deleted match was being viewed
      if (selectedMatch?.id === matchId) {
        setSelectedMatch(null);
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      toast.error(error.response?.data?.message || 'Failed to delete match');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Saved Matches</h1>
        <span className="text-gray-600">{matches.length} saved</span>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-semibold mb-2">No Matches Yet</h2>
          <p className="text-gray-600 mb-6">
            Use the Job Matcher to analyze your resume against job postings
          </p>
          <button
            onClick={() => window.location.href = '/jobseeker/job-matcher'}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Go to Job Matcher
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition relative"
            >
              {/* Delete Button */}
              <button
                onClick={() => handleDelete(match.id)}
                disabled={deletingId === match.id}
                className="absolute top-4 right-4 text-red-600 hover:text-red-800 disabled:opacity-50"
                title="Delete match"
              >
                {deletingId === match.id ? '⏳' : '🗑️'}
              </button>

              <div className="flex items-center justify-between mb-4 pr-8">
                <div className="text-4xl font-bold text-primary-600">
                  {Math.round(match.matchScore)}%
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    match.matchScore >= 80
                      ? 'bg-green-100 text-green-800'
                      : match.matchScore >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {match.matchScore >= 80
                    ? 'Excellent'
                    : match.matchScore >= 60
                    ? 'Good'
                    : 'Low'}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-1">{match.jobTitle}</h3>
                <p className="text-gray-600 text-sm">{match.jobCompany}</p>
              </div>

              <div className="mb-4 pb-4 border-b">
                <p className="text-sm text-gray-600">
                  📄 {match.resumeFilename}
                </p>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                {format(new Date(match.createdAt), 'MMM dd, yyyy • h:mm a')}
              </div>

              <button
                onClick={() => viewDetails(match)}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold">Match Details</h2>
                <p className="text-gray-600">
                  {selectedMatch.resumeFilename} → {selectedMatch.jobTitle}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(selectedMatch.id)}
                  disabled={deletingId === selectedMatch.id}
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded disabled:opacity-50"
                  title="Delete match"
                >
                  {deletingId === selectedMatch.id ? '⏳ Deleting...' : '🗑️ Delete'}
                </button>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="text-gray-600 hover:text-gray-800 text-2xl px-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Match Score */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Match Score</h3>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-primary-600">
                    {Math.round(selectedMatch.matchScore)}%
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-primary-600 h-4 rounded-full"
                        style={{ width: `${selectedMatch.matchScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Matching Skills */}
              {selectedMatch.analysis?.matchingSkills && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-green-800 mb-3">
                    ✅ Matching Skills ({selectedMatch.analysis.matchingSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMatch.analysis.matchingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {selectedMatch.analysis?.missingSkills && (
                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-red-800 mb-3">
                    ❌ Missing Skills ({selectedMatch.analysis.missingSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMatch.analysis.missingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {selectedMatch.analysis?.summary && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-3">📝 Summary</h3>
                  <p className="text-gray-700">{selectedMatch.analysis.summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}