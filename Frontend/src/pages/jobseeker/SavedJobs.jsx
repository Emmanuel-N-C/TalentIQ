import { useState, useEffect } from 'react';
import { getMyMatches, deleteMatch } from '../../api/matches';
import { getAllJobs } from '../../api/jobs';
import { applyToJob, getMyApplications } from '../../api/applications';
import { getUserResumes } from '../../api/resumes';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load both saved jobs and applications
      const [matchesData, applicationsData] = await Promise.all([
        getMyMatches(),
        getMyApplications()
      ]);
      
      setSavedJobs(matchesData);
      
      // Track which jobs user already applied to
      const appliedIds = new Set(
        applicationsData
          .filter(app => app && app.jobId)
          .map(app => app.jobId)
      );
      setAppliedJobIds(appliedIds);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (matchId) => {
    if (window.confirm('Remove this saved job?')) {
      try {
        await deleteMatch(matchId);
        toast.success('Job removed from saved list');
        loadData();
      } catch (error) {
        console.error('Error removing job:', error);
        toast.error('Failed to remove job');
      }
    }
  };

  const handleViewDetails = async (jobId) => {
    try {
      const jobs = await getAllJobs();
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        setSelectedJob(job);
      } else {
        toast.error('Job not found');
      }
    } catch (error) {
      console.error('Error loading job details:', error);
      toast.error('Failed to load job details');
    }
  };

  const handleApply = async (jobId) => {
    // Check if already applied
    if (appliedJobIds.has(jobId)) {
      toast.error('You have already applied to this job');
      return;
    }

    try {
      setApplying(true);
      const resumesData = await getUserResumes();
      if (resumesData.length === 0) {
        toast.error('Please upload a resume first');
        navigate('/jobseeker/resumes');
        return;
      }
      
      await applyToJob({
        jobId: jobId,
        resumeId: resumesData[0].id
      });
      
      // Add to applied jobs set
      setAppliedJobIds(prev => new Set([...prev, jobId]));
      
      toast.success('Application submitted successfully! ✅');
      setSelectedJob(null);
    } catch (error) {
      console.error('Error applying:', error);
      
      // Better error message handling
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      
      if (errorMessage && errorMessage.includes('already applied')) {
        toast.error('You have already applied to this job');
        // Update the state to reflect this
        setAppliedJobIds(prev => new Set([...prev, jobId]));
      } else {
        toast.error(errorMessage || 'Failed to apply to job');
      }
    } finally {
      setApplying(false);
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">💾 Saved Jobs</h1>
        <p className="text-gray-600">
          Jobs you've saved for later review
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">No Saved Jobs Yet</h3>
          <p className="text-gray-600 mb-6">
            Browse jobs and save the ones you're interested in
          </p>
          <button
            onClick={() => navigate('/jobseeker/browse')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
          >
            📋 Browse Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((match) => {
            let analysisData = {};
            try {
              analysisData = typeof match.analysisResult === 'string' 
                ? JSON.parse(match.analysisResult) 
                : match.analysisResult;
            } catch (error) {
              console.error('Error parsing analysis result:', error);
            }

            const isApplied = appliedJobIds.has(match.jobId);

            return (
              <div
                key={match.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {analysisData.jobTitle || match.jobTitle || 'Job Title'}
                      </h3>
                      {isApplied && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          ✓ Applied
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {analysisData.company || match.company || 'Company Name'}
                    </p>
                  </div>
                </div>

                {/* Saved Date */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Saved on {new Date(match.createdAt).toLocaleDateString()}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDetails(match.jobId)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                    
                    {!isApplied ? (
                      <button
                        onClick={() => handleApply(match.jobId)}
                        disabled={applying}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applying ? '⏳' : '✉️'} Apply
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
                      >
                        ✓ Applied
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleRemove(match.id)}
                      className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Company</h3>
                <p className="text-gray-700">{selectedJob.company}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Experience Level</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {selectedJob.experienceLevel}
                </span>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>
              
              {selectedJob.skillsRequired && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skillsRequired.split(',').map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 pt-4 border-t">
                {!appliedJobIds.has(selectedJob.id) ? (
                  <button
                    onClick={() => handleApply(selectedJob.id)}
                    disabled={applying}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? '⏳ Applying...' : '✉️ Apply Now'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-gray-300 text-gray-600 px-6 py-3 rounded-lg cursor-not-allowed font-medium"
                  >
                    ✓ Already Applied
                  </button>
                )}
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}