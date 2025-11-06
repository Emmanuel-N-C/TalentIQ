import { useState, useEffect } from 'react';
import { getAllJobs } from '../../api/jobs';
import { saveMatch } from '../../api/matches';
import { getUserResumes } from '../../api/resumes';
import { applyToJob, getMyApplications } from '../../api/applications';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, resumesData, applicationsData] = await Promise.all([
        getAllJobs(),
        getUserResumes(),
        getMyApplications()
      ]);
      setJobs(jobsData);
      setHasResume(resumesData.length > 0);
      
      // FIXED: Access jobId directly instead of app.job.id
      const appliedIds = new Set(
        applicationsData
          .filter(app => app && app.jobId) // Filter out any invalid entries
          .map(app => app.jobId)
      );
      setAppliedJobIds(appliedIds);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSave = async (jobId) => {
    if (!hasResume) {
      toast.error('Please upload a resume first');
      navigate('/jobseeker/resumes');
      return;
    }

    try {
      const resumesData = await getUserResumes();
      const matchData = {
        resumeId: resumesData[0].id,
        jobId: jobId,
        matchScore: 0.75,
        analysisResult: JSON.stringify({
          jobTitle: jobs.find(j => j.id === jobId)?.title,
          company: jobs.find(j => j.id === jobId)?.company,
          matchScore: 75,
          quickSaved: true,
          summary: 'Job saved for later review'
        })
      };

      await saveMatch(matchData);
      setSavedJobIds(prev => new Set([...prev, jobId]));
      toast.success('Job saved! View in Saved Jobs');
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
  };

  const handleApply = async (jobId) => {
    // Check if already applied (double-check to prevent duplicate clicks)
    if (appliedJobIds.has(jobId)) {
      toast.error('You have already applied to this job');
      return;
    }

    if (!hasResume) {
      toast.error('Please upload a resume first');
      navigate('/jobseeker/resumes');
      return;
    }

    try {
      setApplying(true);
      const resumesData = await getUserResumes();
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
      
      // IMPROVED: Better error message handling
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
        <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
        <p className="text-gray-600">{jobs.length} jobs available</p>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">No Jobs Available</h3>
          <p className="text-gray-600">Check back later for new opportunities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
                    {savedJobIds.has(job.id) && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        ✓ Saved
                      </span>
                    )}
                    {appliedJobIds.has(job.id) && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        ✓ Applied
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-gray-600 mb-2">{job.company}</p>
                  <div className="flex gap-3 text-sm text-gray-500">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                      {job.experienceLevel}
                    </span>
                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 line-clamp-3">{job.description}</p>
              </div>

              {job.skillsRequired && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills Required:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.split(',').slice(0, 6).map((skill, idx) => (
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

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewDetails(job)}
                  className="flex-1 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-medium"
                >
                  View Details
                </button>
                
                {!savedJobIds.has(job.id) ? (
                  <button
                    onClick={() => handleQuickSave(job.id)}
                    className="px-6 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium"
                  >
                    💾 Save Job
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-6 py-2 border-2 border-gray-300 text-gray-400 rounded-lg cursor-not-allowed"
                  >
                    ✓ Saved
                  </button>
                )}
                
                {!appliedJobIds.has(job.id) ? (
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={applying}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? '⏳' : '✉️'} Apply
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    ✓ Applied
                  </button>
                )}
              </div>
            </div>
          ))}
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