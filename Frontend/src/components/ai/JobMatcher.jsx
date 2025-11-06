import { useState, useEffect } from 'react';
import { getUserResumes, getResumeText } from '../../api/resumes';
import { getAllJobs } from '../../api/jobs';
import { saveMatch } from '../../api/matches';
import { useAI } from '../../hooks/useAI';
import toast from 'react-hot-toast';

export default function JobMatcher() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { matchResumeToJob, loading: aiLoading } = useAI();

  // Fetch resumes and jobs on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resumesData, jobsData] = await Promise.all([
        getUserResumes(),
        getAllJobs(),
      ]);
      setResumes(resumesData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Handle Match & Analyze
  const handleMatch = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume');
      return;
    }
    if (!selectedJobId) {
      toast.error('Please select a job');
      return;
    }

    try {
      // Get resume text
      const resumeData = await getResumeText(selectedResumeId);
      const resumeText = resumeData.extractedText;

      // Get job details
      const selectedJob = jobs.find((j) => j.id === parseInt(selectedJobId));
      const jobDescription = `${selectedJob.title}\n\nCompany: ${selectedJob.company}\n\nDescription:\n${selectedJob.description}\n\nSkills Required: ${selectedJob.skillsRequired}\n\nExperience Level: ${selectedJob.experienceLevel}`;

      // Perform AI analysis
      const result = await matchResumeToJob(resumeText, jobDescription);
      
      // Add job and resume info to result
      const enhancedResult = {
        ...result,
        resumeId: parseInt(selectedResumeId),
        jobId: parseInt(selectedJobId),
        jobTitle: selectedJob.title,
        company: selectedJob.company,
        resumeFilename: resumes.find(r => r.id === parseInt(selectedResumeId))?.filename,
      };
      
      setMatchResult(enhancedResult);
      toast.success('Match analysis complete!');
    } catch (error) {
      console.error('Error analyzing match:', error);
      toast.error('Failed to analyze match');
    }
  };

  // Save match to database - Only if score >= 75%
  const handleSaveMatch = async () => {
    if (!matchResult) return;
    
    if (matchResult.matchScore < 75) {
      toast.error('Match score must be 75% or higher to save');
      return;
    }

    try {
      setSaving(true);
      const matchData = {
        resumeId: matchResult.resumeId,
        jobId: matchResult.jobId,
        matchScore: parseFloat(matchResult.matchScore), // Convert to decimal
        analysisResult: JSON.stringify(matchResult),
      };

      console.log('💾 Saving match data:', matchData);
      await saveMatch(matchData);
      toast.success('Job saved to your Saved Jobs! ✅');
    } catch (error) {
      console.error('❌ Error saving match:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save job');
    } finally {
      setSaving(false);
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
      <h1 className="text-3xl font-bold mb-2">🎯 Job Matcher</h1>
      <p className="text-gray-600 mb-8">
        Analyze how well your resume matches specific job openings
      </p>

      {/* Selection Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Resume Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Your Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">-- Choose a resume --</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  📄 {resume.filename}
                </option>
              ))}
            </select>
            {resumes.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                No resumes found. Please upload a resume first.
              </p>
            )}
          </div>

          {/* Job Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Job Posting
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">-- Choose a job --</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  💼 {job.title} at {job.company}
                </option>
              ))}
            </select>
            {jobs.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                No jobs available. Check back later.
              </p>
            )}
          </div>
        </div>

        {/* Match Button */}
        <button
          onClick={handleMatch}
          disabled={!selectedResumeId || !selectedJobId || aiLoading}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
        >
          {aiLoading ? '🔄 Analyzing...' : '🚀 Analyze Match'}
        </button>
      </div>

      {/* Results Section */}
      {matchResult && (
        <div className="space-y-6">
          {/* Header with Save Button */}
          <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Match Results</h2>
              <p className="text-gray-600 mt-1">
                {matchResult.resumeFilename} → {matchResult.jobTitle} at {matchResult.company}
              </p>
            </div>
            
            {/* Save Match Button - Only show if score >= 75% */}
            {matchResult.matchScore >= 75 ? (
              <button
                onClick={handleSaveMatch}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Job
                  </>
                )}
              </button>
            ) : (
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-gray-500 mb-1">
                  💡 Need 75%+ match to save
                </div>
                <div className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded text-sm">
                  {matchResult.matchScore}% (too low)
                </div>
              </div>
            )}
          </div>

          {/* Match Score */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4">Match Score</h3>
            <div className="flex items-center gap-4">
              <div className="text-6xl font-bold text-primary-600">
                {matchResult.matchScore}%
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      matchResult.matchScore >= 75
                        ? 'bg-green-600'
                        : matchResult.matchScore >= 60
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${matchResult.matchScore}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {matchResult.matchScore >= 75
                    ? '🎉 Strong match! This job is worth saving and applying to.'
                    : matchResult.matchScore >= 60
                    ? '👍 Decent match, but consider improving your resume before applying'
                    : '⚠️ Low match. Focus on jobs that better match your skills or upskill in missing areas'}
                </p>
              </div>
            </div>
          </div>

          {/* Matching Skills */}
          {matchResult.matchingSkills && matchResult.matchingSkills.length > 0 && (
            <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-green-800">
                ✅ Matching Skills ({matchResult.matchingSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {matchResult.matchingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {matchResult.missingSkills && matchResult.missingSkills.length > 0 && (
            <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-red-800">
                ❌ Missing Skills ({matchResult.missingSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {matchResult.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {matchResult.strengths && matchResult.strengths.length > 0 && (
            <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-blue-800">
                💪 Your Strengths for This Role
              </h3>
              <ul className="space-y-2">
                {matchResult.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 mr-2">▸</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {matchResult.recommendations && matchResult.recommendations.length > 0 && (
            <div className="bg-purple-50 rounded-lg border-2 border-purple-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-purple-800">
                💡 Recommendations to Improve Your Match
              </h3>
              <ul className="space-y-2">
                {matchResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-purple-600 mr-2">▸</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          {matchResult.summary && (
            <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-3">📝 Overall Assessment</h3>
              <p className="text-gray-700 leading-relaxed">{matchResult.summary}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setMatchResult(null);
                setSelectedResumeId('');
                setSelectedJobId('');
              }}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              🔄 Analyze Another Match
            </button>
            <button
              onClick={() => window.location.href = '/jobseeker/browse'}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              📋 Browse All Jobs
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!matchResult && !aiLoading && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">Ready to Find Your Match?</h3>
          <p className="text-gray-600 mb-4">
            Select a resume and a job posting above to see how well they match
          </p>
          <p className="text-sm text-gray-500">
            💡 Tip: Jobs with 75% or higher match can be saved for later
          </p>
        </div>
      )}
    </div>
  );
}