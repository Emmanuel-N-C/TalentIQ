import { useState, useEffect } from 'react';
import { getMyMatches, deleteMatch } from '../../api/matches';
import { getAllJobs } from '../../api/jobs';
import { applyToJob, getMyApplications } from '../../api/applications';
import { getUserResumes } from '../../api/resumes';
import { useNavigate, Link } from 'react-router-dom';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { Bookmark, Trash2, Eye, Send, X, Briefcase } from 'lucide-react';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [matchesData, applicationsData] = await Promise.all([
        getMyMatches(),
        getMyApplications()
      ]);
      
      setSavedJobs(matchesData);
      
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

  const handleRemoveClick = (job) => {
    setJobToDelete(job);
    setShowDeleteDialog(true);
  };

  const handleRemoveConfirm = async () => {
    if (!jobToDelete) return;

    try {
      await deleteMatch(jobToDelete.id);
      toast.success('Job removed from saved list');
      loadData();
      setJobToDelete(null);
    } catch (error) {
      console.error('Error removing job:', error);
      toast.error('Failed to remove job');
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
      
      setAppliedJobIds(prev => new Set([...prev, jobId]));
      toast.success('Application submitted successfully! ✅');
      setSelectedJob(null);
    } catch (error) {
      console.error('Error applying:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      
      if (errorMessage && errorMessage.includes('already applied')) {
        toast.error('You have already applied to this job');
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Bookmark className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
            Saved Jobs
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">Jobs you've saved for later review</p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 sm:p-12 text-center">
            <Bookmark className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No Saved Jobs Yet</h3>
            <p className="text-slate-400 mb-6 text-sm sm:text-base">
              Browse jobs and save the ones you're interested in
            </p>
            <Link
              to="/jobseeker/browse"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 font-medium transition-colors text-sm sm:text-base"
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
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
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:border-slate-600 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                            {analysisData.jobTitle || match.jobTitle || 'Job Title'}
                          </h3>
                          <p className="text-slate-400 text-sm sm:text-base truncate">
                            {analysisData.company || match.company || 'Company Name'}
                          </p>
                        </div>
                      </div>
                      
                      {isApplied && (
                        <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium mt-2">
                          ✓ Applied
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-700">
                    <div className="text-xs sm:text-sm text-slate-400">
                      Saved on {new Date(match.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewDetails(match.jobId)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        View
                      </button>
                      
                      {!isApplied ? (
                        <button
                          onClick={() => handleApply(match.jobId)}
                          disabled={applying}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Apply
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-600 text-slate-400 rounded-lg cursor-not-allowed text-xs sm:text-sm font-medium"
                        >
                          ✓ Applied
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleRemoveClick(match)}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-white pr-4 truncate">{selectedJob.title}</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2 text-blue-400">Company</h3>
                  <p className="text-slate-300 text-base sm:text-lg">{selectedJob.company}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2 text-blue-400">Experience Level</h3>
                  <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs sm:text-sm font-medium">
                    {selectedJob.experienceLevel}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2 text-blue-400">Description</h3>
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{selectedJob.description}</p>
                </div>
                
                {selectedJob.skillsRequired && (
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-3 text-blue-400">Skills Required</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skillsRequired.split(',').map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs sm:text-sm"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-slate-700">
                  {!appliedJobIds.has(selectedJob.id) ? (
                    <button
                      onClick={() => handleApply(selectedJob.id)}
                      disabled={applying}
                      className="flex-1 bg-green-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      {applying ? 'Applying...' : 'Apply Now'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-slate-600 text-slate-400 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg cursor-not-allowed font-medium text-sm sm:text-base"
                    >
                      ✓ Already Applied
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setJobToDelete(null);
          }}
          onConfirm={handleRemoveConfirm}
          title="Remove Saved Job"
          message={`Are you sure you want to remove "${jobToDelete?.job?.title || 'this job'}" from your saved jobs? You can save it again later if needed.`}
          confirmText="Remove Job"
          cancelText="Cancel"
          type="warning"
        />
      </div>
    </div>
  );
}