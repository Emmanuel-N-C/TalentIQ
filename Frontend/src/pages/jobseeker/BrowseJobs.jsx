import { useState, useEffect } from 'react';
import { getAllJobs } from '../../api/jobs';
import { getUserResumes } from '../../api/resumes';
import { applyToJob } from '../../api/applications';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
    fetchResumes();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getAllJobs();
      console.log('📋 Fetched jobs from database:', data);
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const data = await getUserResumes();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleApplyClick = (job) => {
    if (resumes.length === 0) {
      toast.error('Please upload a resume first');
      return;
    }
    setSelectedJob(job);
    setShowApplyModal(true);
    setSelectedResumeId(resumes[0]?.id || '');
    setCoverLetter('');
  };

  const handleSubmitApplication = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume');
      return;
    }

    try {
      setApplying(true);
      await applyToJob({
        jobId: selectedJob.id,
        resumeId: parseInt(selectedResumeId),
        coverLetter: coverLetter.trim()
      });
      toast.success('✅ Application submitted successfully!');
      setShowApplyModal(false);
      setSelectedJob(null);
      setCoverLetter('');
    } catch (error) {
      console.error('Error applying to job:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to submit application';
      toast.error(errorMessage);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Browse Jobs</h1>
        <p className="text-gray-600">{jobs.length} jobs available</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">💼</div>
          <h2 className="text-2xl font-semibold mb-2">No Jobs Available</h2>
          <p className="text-gray-600">Check back later for new opportunities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                  <p className="text-gray-600 font-medium">{job.company}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {job.experienceLevel}
                </span>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

              {job.skillsRequired && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Skills Required:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.split(',').map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    Posted {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                  </p>
                  {job.applicationCount > 0 && (
                    <p className="text-sm text-gray-500">
                      📄 {job.applicationCount} {job.applicationCount === 1 ? 'applicant' : 'applicants'}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => handleApplyClick(job)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold">Apply to Position</h2>
                <p className="text-gray-600">{selectedJob.title} at {selectedJob.company}</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Resume Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Resume <span className="text-red-500">*</span>
                </label>
                {resumes.length === 0 ? (
                  <div className="text-center py-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <p className="text-yellow-800 mb-2">No resumes available</p>
                    <a href="/jobseeker/resumes" className="text-primary-600 hover:underline">
                      Upload a resume first →
                    </a>
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.filename}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell the employer why you're a great fit for this position..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {coverLetter.length} characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitApplication}
                  disabled={applying || !selectedResumeId}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}