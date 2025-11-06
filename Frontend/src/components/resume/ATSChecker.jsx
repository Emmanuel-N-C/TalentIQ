import { useState, useEffect } from 'react';
import { getUserResumes, getResumeText, getResumeFileBlob } from '../../api/resumes';
import { useAI } from '../../hooks/useAI';
import ResumeTextViewer from './ResumeTextViewer';
import toast from 'react-hot-toast';

export default function ATSChecker() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState('text'); // 'text' or 'file'
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { checkATS, loading: aiLoading } = useAI();

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

  const handleSelectResume = async (resume) => {
    setSelectedResume(resume);
    setAtsResult(null);
    setShowPreview(false);
    
    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    // Load resume text for preview
    try {
      const data = await getResumeText(resume.id);
      setResumeText(data.extractedText);
    } catch (error) {
      console.error('Error loading resume text:', error);
    }
  };

  const handleTogglePreview = async () => {
    if (showPreview) {
      // Close preview
      setShowPreview(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } else {
      // Open preview - load file blob if in file mode
      setShowPreview(true);
      if (previewMode === 'file' && !previewUrl) {
        await loadFilePreview();
      }
    }
  };

  const loadFilePreview = async () => {
    if (!selectedResume) return;
    
    setLoadingPreview(true);
    try {
      const blobUrl = await getResumeFileBlob(selectedResume.id);
      setPreviewUrl(blobUrl);
    } catch (error) {
      console.error('Error loading file preview:', error);
      toast.error('Failed to load file preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePreviewModeChange = async (mode) => {
    setPreviewMode(mode);
    if (mode === 'file' && showPreview && !previewUrl) {
      await loadFilePreview();
    }
  };

  const handleCheck = async () => {
    if (!selectedResume) {
      toast.error('Please select a resume');
      return;
    }
    if (!jobDescription.trim()) {
      toast.error('Please paste the job description');
      return;
    }

    try {
      const data = await getResumeText(selectedResume.id);
      const resumeText = data.extractedText;

      const result = await checkATS(resumeText, jobDescription);
      setAtsResult(result);
      toast.success('ATS check complete! ✅');
    } catch (error) {
      console.error('Error checking ATS:', error);
      toast.error('Failed to check ATS compatibility');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🎯 ATS Compatibility Checker</h1>
        <p className="text-gray-600">
          Check how well your resume passes ATS filters for a specific job
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-6">
          {/* Resume Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              1. Select Your Resume
            </label>
            {resumes.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600 mb-4">No resumes uploaded yet</p>
                <a
                  href="/jobseeker/resumes"
                  className="text-primary-600 hover:underline font-medium"
                >
                  Upload a resume first →
                </a>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {resumes.map((resume) => (
                    <button
                      key={resume.id}
                      onClick={() => handleSelectResume(resume)}
                      className={`p-4 border-2 rounded-lg text-left transition ${
                        selectedResume?.id === resume.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">📄</div>
                      <div className="font-medium truncate">{resume.filename}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(resume.uploadedAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedResume && (
                  <button
                    onClick={handleTogglePreview}
                    className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {showPreview ? '✖ Hide Resume Preview' : '👁 Preview Resume'}
                  </button>
                )}

                {/* Preview Mode Toggle */}
                {selectedResume && showPreview && (
                  <div className="mt-4 flex gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700">Preview Mode:</span>
                    <button
                      onClick={() => handlePreviewModeChange('text')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        previewMode === 'text'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      📝 Extracted Text
                    </button>
                    <button
                      onClick={() => handlePreviewModeChange('file')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        previewMode === 'file'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      📄 Original File
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Resume Preview */}
          {showPreview && selectedResume && (
            <div>
              {previewMode === 'text' && resumeText ? (
                <ResumeTextViewer
                  resumeText={resumeText}
                  filename={selectedResume.filename}
                />
              ) : previewMode === 'file' ? (
                <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📄</span>
                      <span className="font-medium text-gray-700">{selectedResume.filename}</span>
                    </div>
                    <span className="text-xs text-gray-500">File Preview</span>
                  </div>
                  <div className="h-[600px] bg-gray-50">
                    {loadingPreview ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                      </div>
                    ) : selectedResume.filename.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={previewUrl ? `${previewUrl}#toolbar=0&navpanes=0&view=FitH` : ''}
                        className="w-full h-full"
                        title="Resume Preview"
                        style={{ border: 'none' }}
                      />
                    ) : selectedResume.filename.toLowerCase().match(/\.(docx?|doc)$/) ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-6xl mb-4">📄</div>
                        <p className="text-gray-700 mb-4">Word documents cannot be previewed directly in browser</p>
                        <a
                          href={previewUrl}
                          download={selectedResume.filename}
                          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
                        >
                          Download to View
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-6xl mb-4">📄</div>
                          <p className="text-gray-700">Preview not available for this file type</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Job Description */}
          {resumes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-3">
                2. Paste Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                placeholder="Paste the complete job description here including requirements, responsibilities, and qualifications..."
              />
            </div>
          )}

          {resumes.length > 0 && (
            <button
              onClick={handleCheck}
              disabled={!selectedResume || !jobDescription.trim() || aiLoading}
              className="w-full bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {aiLoading ? '🔄 Analyzing ATS Compatibility...' : '🚀 Check ATS Score'}
            </button>
          )}
        </div>
      </div>

      {/* Results - keeping all your existing results code */}
      {atsResult && (
        <div className="space-y-6">
          {/* ATS Score */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4">ATS Compatibility Score</h3>
            <div className="flex items-center gap-4">
              <div className="text-6xl font-bold text-primary-600">
                {atsResult.atsScore}%
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      atsResult.atsScore >= 80
                        ? 'bg-green-600'
                        : atsResult.atsScore >= 65
                        ? 'bg-blue-600'
                        : atsResult.atsScore >= 50
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${atsResult.atsScore}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {atsResult.atsScore >= 80
                    ? '🎉 Excellent! High chance of passing ATS'
                    : atsResult.atsScore >= 65
                    ? '👍 Good score, minor improvements recommended'
                    : atsResult.atsScore >= 50
                    ? '⚠️ Acceptable, but needs keyword optimization'
                    : '❌ Low score, significant improvements needed'}
                </p>
              </div>
            </div>

            {/* Keyword Match Rate */}
            {atsResult.keywordMatchRate !== undefined && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Keyword Match Rate
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {atsResult.keywordMatchRate}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${atsResult.keywordMatchRate}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Alignment Scores */}
          {atsResult.alignment && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Alignment Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {atsResult.alignment.technical}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Technical</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {atsResult.alignment.experience}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Experience</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">
                    {atsResult.alignment.education}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Education</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">
                    {atsResult.alignment.overall}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">Overall</div>
                </div>
              </div>
            </div>
          )}

          {/* Matched Keywords */}
          {atsResult.matchedKeywords && atsResult.matchedKeywords.length > 0 && (
            <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-green-800">
                ✅ Matched Keywords ({atsResult.matchedKeywords.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {atsResult.matchedKeywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {atsResult.missingKeywords && atsResult.missingKeywords.length > 0 && (
            <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-red-800">
                ❌ Missing Keywords ({atsResult.missingKeywords.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {atsResult.missingKeywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      atsResult.criticalMissing && atsResult.criticalMissing.includes(keyword)
                        ? 'bg-red-300 text-red-900 border-2 border-red-500 ring-2 ring-red-400'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {keyword}
                    {atsResult.criticalMissing && atsResult.criticalMissing.includes(keyword) && ' ⚠️'}
                  </span>
                ))}
              </div>
              {atsResult.criticalMissing && atsResult.criticalMissing.length > 0 && (
                <p className="text-sm text-red-700 mt-3 font-medium">
                  ⚠️ Keywords marked with warning are critical for this role
                </p>
              )}
            </div>
          )}

          {/* Formatting Issues */}
          {atsResult.formattingIssues && atsResult.formattingIssues.length > 0 && (
            <div className="bg-orange-50 rounded-lg border-2 border-orange-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-orange-800">
                ⚠️ Formatting Issues
              </h3>
              <ul className="space-y-2">
                {atsResult.formattingIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-orange-600 mr-2">▸</span>
                    <span className="text-gray-700">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {atsResult.recommendations && atsResult.recommendations.length > 0 && (
            <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-blue-800">
                💡 Recommendations
              </h3>
              <ul className="space-y-3">
                {atsResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">💡</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          {atsResult.summary && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3">📝 Summary</h3>
              <p className="text-gray-700 leading-relaxed">{atsResult.summary}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setAtsResult(null);
                setJobDescription('');
              }}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
            >
              🔄 Check Another Job
            </button>
            <button
              onClick={() => {
                setAtsResult(null);
                setSelectedResume(null);
                setJobDescription('');
                setResumeText('');
                setShowPreview(false);
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }
              }}
              className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
            >
              ✓ Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}