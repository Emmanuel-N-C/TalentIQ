import { useState, useEffect } from 'react';
import { getAllJobs } from '../../api/jobs';
import { saveMatch } from '../../api/matches';
import { getUserResumes, uploadResume } from '../../api/resumes';
import { applyToJob, getMyApplications } from '../../api/applications';
import { useAI } from '../../hooks/useAI';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Bookmark, Send, X, Search, Filter, FileText, Upload, Plus, Sparkles, Wand2, Loader2, Check, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [jobToApply, setJobToApply] = useState(null);
  const [userResumes, setUserResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // AI Cover Letter States
  const [showAICoverLetterModal, setShowAICoverLetterModal] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  
  const navigate = useNavigate();
  const { generateCoverLetter: generateAICoverLetter, loading: aiLoading } = useAI();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, experienceFilter, sortOrder, jobs]);

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (experienceFilter !== 'ALL') {
      filtered = filtered.filter(job => job.experienceLevel === experienceFilter);
    }

    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      if (sortOrder === 'NEWEST') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    setFilteredJobs(filtered);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, resumesData, applicationsData] = await Promise.all([
        getAllJobs(),
        getUserResumes(),
        getMyApplications()
      ]);
      setJobs(jobsData);
      setFilteredJobs(jobsData);
      setUserResumes(resumesData);
      setHasResume(resumesData.length > 0);
      if (resumesData.length > 0) {
        setSelectedResumeId(resumesData[0].id);
      }
      
      const appliedIds = new Set(
        applicationsData
          .filter(app => app && app.jobId)
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

  const openApplicationModal = async (job) => {
    if (appliedJobIds.has(job.id)) {
      toast.error('You have already applied to this job');
      return;
    }

    if (!hasResume) {
      toast.error('Please upload a resume first');
      navigate('/jobseeker/resumes');
      return;
    }

    try {
      const resumesData = await getUserResumes();
      setUserResumes(resumesData);
      if (resumesData.length > 0 && !selectedResumeId) {
        setSelectedResumeId(resumesData[0].id);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    }

    setJobToApply(job);
    setCoverLetter('');
    setGeneratedCoverLetter(null);
    setShowApplicationModal(true);
    setShowUploadForm(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      const uploadedResume = await uploadResume(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Upload progress:', percentCompleted);
      });

      toast.success('Resume uploaded successfully!');
      
      const resumesData = await getUserResumes();
      setUserResumes(resumesData);
      setSelectedResumeId(uploadedResume.id);
      setHasResume(true);
      setShowUploadForm(false);
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume');
      return;
    }

    try {
      setApplying(true);
      await applyToJob({
        jobId: jobToApply.id,
        resumeId: selectedResumeId,
        coverLetter: coverLetter
      });
      
      setAppliedJobIds(prev => new Set([...prev, jobToApply.id]));
      toast.success('Application submitted successfully! ✅');
      setShowApplicationModal(false);
      setSelectedJob(null);
      setCoverLetter('');
      setGeneratedCoverLetter(null);
    } catch (error) {
      console.error('Error applying:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      
      if (errorMessage && errorMessage.includes('already applied')) {
        toast.error('You have already applied to this job');
        setAppliedJobIds(prev => new Set([...prev, jobToApply.id]));
      } else {
        toast.error(errorMessage || 'Failed to apply to job');
      }
    } finally {
      setApplying(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume first');
      return;
    }

    try {
      setGeneratingCoverLetter(true);
      setShowAICoverLetterModal(true);
      
      const selectedResume = userResumes.find(r => r.id === selectedResumeId);
      if (!selectedResume) {
        throw new Error('Selected resume not found');
      }

      const resumeText = selectedResume.parsedText || `Resume: ${selectedResume.filename}`;
      
      const result = await generateAICoverLetter(
        jobToApply.title,
        jobToApply.company,
        jobToApply.description,
        resumeText,
        'Applicant'
      );
      
      setGeneratedCoverLetter(result);
      toast.success('Cover letter generated! ✨');
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast.error(error.message || 'Failed to generate cover letter');
      setShowAICoverLetterModal(false);
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const handleUseCoverLetter = () => {
    if (generatedCoverLetter) {
      setCoverLetter(generatedCoverLetter.coverLetter);
      setShowAICoverLetterModal(false);
      toast.success('Cover letter added! You can edit it before submitting.');
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
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            Browse Jobs
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">{filteredJobs.length} jobs available</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 sm:mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Filter Controls Container */}
          <div className="flex flex-col gap-4">
            {/* Experience Level Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <span className="text-xs sm:text-sm text-slate-400 whitespace-nowrap">Experience:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {['ALL', 'Entry', 'Mid-Level', 'Senior', 'Lead'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setExperienceFilter(level)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      experienceFilter === level
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort by Date Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <span className="text-xs sm:text-sm text-slate-400 whitespace-nowrap">Sort:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortOrder('NEWEST')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 ${
                    sortOrder === 'NEWEST'
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  }`}
                >
                  <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  Newest
                </button>
                <button
                  onClick={() => setSortOrder('OLDEST')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 ${
                    sortOrder === 'OLDEST'
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  }`}
                >
                  <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  Oldest
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchTerm || experienceFilter !== 'ALL' || sortOrder !== 'NEWEST') && (
            <div className="flex items-center gap-2 flex-wrap p-3 sm:p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
              <span className="text-xs sm:text-sm text-slate-400">Active filters:</span>
              {searchTerm && (
                <span className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  Search: "{searchTerm}"
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-blue-300" 
                    onClick={() => setSearchTerm('')}
                  />
                </span>
              )}
              {experienceFilter !== 'ALL' && (
                <span className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  Experience: {experienceFilter}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-blue-300" 
                    onClick={() => setExperienceFilter('ALL')}
                  />
                </span>
              )}
              {sortOrder !== 'NEWEST' && (
                <span className="px-2 sm:px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                  Sort: {sortOrder === 'OLDEST' ? 'Oldest First' : 'Newest First'}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-purple-300" 
                    onClick={() => setSortOrder('NEWEST')}
                  />
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setExperienceFilter('ALL');
                  setSortOrder('NEWEST');
                }}
                className="ml-auto px-2 sm:px-3 py-1 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-4">📭</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No Jobs Found</h3>
            <p className="text-sm sm:text-base text-slate-400 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setExperienceFilter('ALL');
                setSortOrder('NEWEST');
              }}
              className="px-4 sm:px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-sm sm:text-base"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:border-slate-600 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                          {job.title}
                        </h2>
                        <p className="text-base sm:text-lg text-slate-400 truncate">{job.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400 mt-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        {job.location || 'Not Specified'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500/20 text-blue-400 rounded-full font-medium text-xs sm:text-sm">
                        {job.experienceLevel}
                      </span>
                    </div>

                    {/* Status Badges */}
                    <div className="flex gap-2 mt-3">
                      {savedJobIds.has(job.id) && (
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          ✓ Saved
                        </span>
                      )}
                      {appliedJobIds.has(job.id) && (
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                          ✓ Applied
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm sm:text-base text-slate-300 line-clamp-2">{job.description}</p>
                </div>

                {job.skillsRequired && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {job.skillsRequired.split(',').slice(0, 6).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 sm:px-3 py-0.5 sm:py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs sm:text-sm"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => handleViewDetails(job)}
                    className="flex-1 bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 font-medium transition-colors text-sm sm:text-base"
                  >
                    View Details
                  </button>
                  
                  {!savedJobIds.has(job.id) ? (
                    <button
                      onClick={() => handleQuickSave(job.id)}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Save
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-green-500/30 text-green-400 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> Saved
                    </button>
                  )}
                  
                  {!appliedJobIds.has(job.id) ? (
                    <button
                      onClick={() => openApplicationModal(job)}
                      disabled={applying}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Apply
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-600 text-slate-400 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-white pr-4">{selectedJob.title}</h2>
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
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs sm:text-sm font-medium inline-block">
                    {selectedJob.experienceLevel}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2 text-blue-400">Description</h3>
                  <p className="text-sm sm:text-base text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedJob.description}</p>
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
                      onClick={() => {
                        setSelectedJob(null);
                        openApplicationModal(selectedJob);
                      }}
                      disabled={applying}
                      className="flex-1 bg-green-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      Apply Now
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

        {/* Application Modal */}
        {showApplicationModal && jobToApply && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-start sticky top-0 bg-slate-800 z-10">
                <div className="pr-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Apply to {jobToApply.title}</h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">{jobToApply.company}</p>
                </div>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Resume Selection */}
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-3 text-blue-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                    Select Resume
                  </h3>
                  
                  {userResumes.length > 0 && !showUploadForm ? (
                    <div className="space-y-2 sm:space-y-3">
                      {userResumes.map((resume) => (
                        <div
                          key={resume.id}
                          onClick={() => setSelectedResumeId(resume.id)}
                          className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedResumeId === resume.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm sm:text-base truncate">{resume.filename}</p>
                              <p className="text-xs sm:text-sm text-slate-400">
                                Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                            {selectedResumeId === resume.id && (
                              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => setShowUploadForm(true)}
                        className="w-full p-3 sm:p-4 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg text-slate-400 hover:text-blue-400 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Upload New Resume
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="block">
                        <div className="border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all">
                          <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-3" />
                          <p className="text-sm sm:text-base text-slate-300 font-medium mb-1">
                            {uploadingResume ? 'Uploading...' : 'Click to upload resume'}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-400">PDF, DOCX, or DOC (Max 5MB)</p>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeUpload}
                            disabled={uploadingResume}
                            className="hidden"
                          />
                        </div>
                      </label>
                      {userResumes.length > 0 && (
                        <button
                          onClick={() => setShowUploadForm(false)}
                          className="mt-3 text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
                        >
                          ← Use existing resume
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Cover Letter with AI Help */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 sm:gap-0">
                    <h3 className="font-semibold text-base sm:text-lg text-blue-400">Cover Letter (Optional)</h3>
                    <button
                      onClick={handleGenerateCoverLetter}
                      disabled={!selectedResumeId || generatingCoverLetter}
                      className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      AI Help
                    </button>
                  </div>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Write a brief cover letter..."
                    rows={6}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-2">{coverLetter.length} characters</p>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-slate-700">
                  <button
                    onClick={handleSubmitApplication}
                    disabled={applying || !selectedResumeId || uploadingResume}
                    className="flex-1 bg-green-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    disabled={applying}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Cover Letter Generation Modal */}
        {showAICoverLetterModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-start sticky top-0 bg-slate-800 z-10">
                <div className="flex items-center gap-2 sm:gap-3 pr-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">AI Cover Letter Generator</h2>
                    <p className="text-slate-400 text-xs sm:text-sm">Powered by AI ✨</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAICoverLetterModal(false)}
                  disabled={generatingCoverLetter}
                  className="text-slate-400 hover:text-white transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6">
                {generatingCoverLetter ? (
                  <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                    <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500 animate-spin mb-4" />
                    <p className="text-slate-300 text-base sm:text-lg font-medium mb-2">Crafting your cover letter...</p>
                    <p className="text-slate-400 text-xs sm:text-sm">This may take a few seconds</p>
                  </div>
                ) : generatedCoverLetter ? (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Generated Cover Letter */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-base sm:text-lg text-blue-400">Your Cover Letter</h3>
                        <span className="text-xs text-slate-400">{generatedCoverLetter.wordCount} words</span>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 sm:p-6 text-sm sm:text-base text-slate-300 whitespace-pre-line break-words leading-relaxed max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                        {generatedCoverLetter.coverLetter}
                      </div>
                    </div>

                    {/* Highlights */}
                    {generatedCoverLetter.highlights && generatedCoverLetter.highlights.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg text-blue-400 mb-3">Key Highlights</h3>
                        <ul className="space-y-2">
                          {generatedCoverLetter.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm sm:text-base text-slate-300">
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="whitespace-pre-line break-words">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-slate-700">
                      <button
                        onClick={handleUseCoverLetter}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                      >
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                        Use This Cover Letter
                      </button>
                      <button
                        onClick={handleGenerateCoverLetter}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-purple-500 text-purple-400 rounded-lg hover:bg-purple-500/10 font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        Regenerate
                      </button>
                      <button
                        onClick={() => setShowAICoverLetterModal(false)}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}