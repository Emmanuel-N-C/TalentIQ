import { useState, useEffect } from 'react';
import { getUserResumes, deleteResume, getResumeText } from '../../api/resumes';
import { useAI } from '../../hooks/useAI';
import ResumeUpload from '../../components/resume/ResumeUpload';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function MyResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  
  // AI Analysis States
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [resumeToAnalyze, setResumeToAnalyze] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const { matchResumeToJob, loading: aiLoading } = useAI();

  // Fetch resumes on mount
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await getUserResumes();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await deleteResume(resumeId);
      toast.success('Resume deleted successfully');
      fetchResumes(); // Refresh list
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handleViewText = async (resume) => {
    try {
      const data = await getResumeText(resume.id);
      setResumeText(data.extractedText);
      setSelectedResume(resume);
    } catch (error) {
      console.error('Error fetching resume text:', error);
      toast.error('Failed to load resume text');
    }
  };

  // NEW: Handle Analyze Click
  const handleAnalyzeClick = async (resume) => {
    setResumeToAnalyze(resume);
    setShowAnalyzeModal(true);
    setAnalysisResult(null);
    setJobDescription('');
  };

  // NEW: Perform AI Analysis
  const handlePerformAnalysis = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description');
      return;
    }

    try {
      // Get resume text first
      const data = await getResumeText(resumeToAnalyze.id);
      const resumeTextData = data.extractedText;

      // Perform AI analysis
      const result = await matchResumeToJob(resumeTextData, jobDescription);
      setAnalysisResult(result);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Failed to analyze resume');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          {showUpload ? 'View Resumes' : '➕ Upload New Resume'}
        </button>
      </div>

      {showUpload ? (
        <ResumeUpload
          onUploadSuccess={() => {
            setShowUpload(false);
            fetchResumes();
          }}
        />
      ) : (
        <>
          {resumes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-semibold mb-2">No resumes yet</h2>
              <p className="text-gray-600 mb-6">
                Upload your first resume to get started
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
              >
                Upload Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">📄</div>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete resume"
                    >
                      🗑️
                    </button>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 truncate" title={resume.filename}>
                    {resume.filename}
                  </h3>

                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p>📊 {formatFileSize(resume.fileSize)}</p>
                    <p>📅 {format(new Date(resume.uploadedAt), 'MMM dd, yyyy')}</p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleViewText(resume)}
                      className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
                    >
                      👁️ View Text
                    </button>
                    <button
                      onClick={() => handleAnalyzeClick(resume)}
                      className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition"
                    >
                      🤖 Analyze for Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Resume Text Modal */}
      {selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedResume.filename}</h2>
              <button
                onClick={() => setSelectedResume(null)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">
                {resumeText}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {showAnalyzeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold">
                🤖 Analyze: {resumeToAnalyze?.filename}
              </h2>
              <button
                onClick={() => setShowAnalyzeModal(false)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {!analysisResult ? (
                <>
                  <label className="block text-sm font-medium mb-2">
                    Paste Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full h-64 p-3 border rounded-lg mb-4"
                    placeholder="Paste the job description you want to apply for..."
                  />
                  <button
                    onClick={handlePerformAnalysis}
                    disabled={aiLoading}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {aiLoading ? 'Analyzing...' : '🚀 Analyze Match'}
                  </button>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Match Score */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                    <h3 className="text-2xl font-bold mb-4">Match Score</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-6xl font-bold text-primary-600">
                        {analysisResult.matchScore}%
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-primary-600 h-4 rounded-full transition-all"
                            style={{ width: `${analysisResult.matchScore}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {analysisResult.matchScore >= 80
                            ? '🎉 Excellent match! Apply with confidence'
                            : analysisResult.matchScore >= 60
                            ? '👍 Good match, consider tailoring your resume'
                            : '⚠️ Low match, significant improvements needed'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Matching Skills */}
                  <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6">
                    <h3 className="text-xl font-bold mb-3 text-green-800">
                      ✅ Matching Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.matchingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
                    <h3 className="text-xl font-bold mb-3 text-red-800">
                      ❌ Missing Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
                    <h3 className="text-xl font-bold mb-3 text-blue-800">
                      💪 Your Strengths for This Role
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      {analysisResult.strengths.map((strength, idx) => (
                        <li key={idx} className="text-gray-700">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-purple-50 rounded-lg border-2 border-purple-200 p-6">
                    <h3 className="text-xl font-bold mb-3 text-purple-800">
                      💡 Recommendations
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      {analysisResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-gray-700">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6">
                    <h3 className="text-xl font-bold mb-3">📝 Summary</h3>
                    <p className="text-gray-700">{analysisResult.summary}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setAnalysisResult(null);
                        setJobDescription('');
                      }}
                      className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
                    >
                      🔄 Analyze Another Job
                    </button>
                    <button
                      onClick={() => setShowAnalyzeModal(false)}
                      className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
                    >
                      ✓ Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}