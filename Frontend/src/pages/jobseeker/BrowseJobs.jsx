import { useState, useEffect } from 'react';
import { getAllJobs } from '../../api/jobs';
import { saveMatch } from '../../api/matches';
import { getUserResumes } from '../../api/resumes';
import { applyToJob, getMyApplications } from '../../api/applications';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Bookmark, Send, X, Search, Filter } from 'lucide-react';

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
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, experienceFilter, jobs]);

  const filterJobs = () => {
    let filtered = jobs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Experience filter
    if (experienceFilter !== 'ALL') {
      filtered = filtered.filter(job => job.experienceLevel === experienceFilter);
    }

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
      setHasResume(resumesData.length > 0);
      
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

  const handleApply = async (jobId) => {
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            Browse Jobs
          </h1>
          <p className="text-slate-400">{filteredJobs.length} jobs available</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title, company, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Experience Level Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-400">Filter by experience:</span>
            {['ALL', 'Entry', 'Mid-Level', 'Senior', 'Lead'].map((level) => (
              <button
                key={level}
                onClick={() => setExperienceFilter(level)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  experienceFilter === level
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
            <p className="text-slate-400 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setExperienceFilter('ALL');
              }}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                          {job.title}
                        </h2>
                        <p className="text-lg text-slate-400">{job.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 text-sm text-slate-400 mt-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Remote
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-medium">
                        {job.experienceLevel}
                      </span>
                    </div>

                    {/* Status Badges */}
                    <div className="flex gap-2 mt-3">
                      {savedJobIds.has(job.id) && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          ✓ Saved
                        </span>
                      )}
                      {appliedJobIds.has(job.id) && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                          ✓ Applied
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-slate-300 line-clamp-2">{job.description}</p>
                </div>

                {job.skillsRequired && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired.split(',').slice(0, 6).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => handleViewDetails(job)}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium transition-colors"
                  >
                    View Details
                  </button>
                  
                  {!savedJobIds.has(job.id) ? (
                    <button
                      onClick={() => handleQuickSave(job.id)}
                      className="px-6 py-3 border-2 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4" /> Save
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-6 py-3 border-2 border-green-500/30 text-green-400 rounded-lg cursor-not-allowed flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4 fill-current" /> Saved
                    </button>
                  )}
                  
                  {!appliedJobIds.has(job.id) ? (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applying}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Apply
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-6 py-3 bg-slate-600 text-slate-400 rounded-lg cursor-not-allowed flex items-center gap-2"
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
              <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
                <h2 className="text-2xl font-bold text-white">{selectedJob.title}</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-blue-400">Company</h3>
                  <p className="text-slate-300 text-lg">{selectedJob.company}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-blue-400">Experience Level</h3>
                  <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                    {selectedJob.experienceLevel}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-blue-400">Description</h3>
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedJob.description}</p>
                </div>
                
                {selectedJob.skillsRequired && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-blue-400">Skills Required</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skillsRequired.split(',').map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4 pt-4 border-t border-slate-700">
                  {!appliedJobIds.has(selectedJob.id) ? (
                    <button
                      onClick={() => handleApply(selectedJob.id)}
                      disabled={applying}
                      className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      {applying ? 'Applying...' : 'Apply Now'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-slate-600 text-slate-400 px-6 py-3 rounded-lg cursor-not-allowed font-medium"
                    >
                      ✓ Already Applied
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-6 py-3 border-2 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}