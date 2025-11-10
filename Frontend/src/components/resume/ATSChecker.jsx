import { useState, useEffect } from 'react';
import { getUserResumes, getResumeText, getResumeFileBlob } from '../../api/resumes';
import { useAI } from '../../hooks/useAI';
import ResumeTextViewer from './ResumeTextViewer';
import toast from 'react-hot-toast';
import { Target, FileText, Eye, X, Sparkles, TrendingUp, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ATSChecker() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [atsResult, setAtsResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState('text');
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
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    try {
      const data = await getResumeText(resume.id);
      setResumeText(data.extractedText);
    } catch (error) {
      console.error('Error loading resume text:', error);
    }
  };

  const handleTogglePreview = async () => {
    if (showPreview) {
      setShowPreview(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } else {
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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Target className="w-10 h-10 text-green-400" />
            ATS Compatibility Checker
          </h1>
          <p className="text-slate-400">
            Check how well your resume passes ATS filters for a specific job
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
          <div className="space-y-6">
            {/* Resume Selection */}
            <div>
              <label className="block text-sm font-medium mb-3 text-slate-300">
                1. Select Your Resume
              </label>
              {resumes.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-600 rounded-lg bg-slate-900/30">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No resumes uploaded yet</p>
                  <Link
                    to="/jobseeker/resumes"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Upload a resume first →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {resumes.map((resume) => (
                      <button
                        key={resume.id}
                        onClick={() => handleSelectResume(resume)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          selectedResume?.id === resume.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                        }`}
                      >
                        <FileText className="w-8 h-8 text-blue-400 mb-2" />
                        <div className="font-medium truncate text-white">{resume.filename}</div>
                        <div className="text-sm text-slate-400">
                          {new Date(resume.uploadedAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedResume && (
                    <button
                      onClick={handleTogglePreview}
                      className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      {showPreview ? 'Hide Resume Preview' : 'Preview Resume'}
                    </button>
                  )}

                  {/* Preview Mode Toggle */}
                  {selectedResume && showPreview && (
                    <div className="mt-4 flex gap-2 items-center">
                      <span className="text-sm font-medium text-slate-400">Preview Mode:</span>
                      <button
                        onClick={() => handlePreviewModeChange('text')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          previewMode === 'text'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        📝 Extracted Text
                      </button>
                      <button
                        onClick={() => handlePreviewModeChange('file')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          previewMode === 'file'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                  <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                    <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <span className="font-medium text-slate-300">{selectedResume.filename}</span>
                      </div>
                      <span className="text-xs text-slate-500">File Preview</span>
                    </div>
                    <div className="h-[600px] bg-slate-950">
                      {loadingPreview ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                          <FileText className="w-16 h-16 text-slate-600 mb-4" />
                          <p className="text-slate-400 mb-4">Word documents cannot be previewed directly in browser</p>
                          <a
                            href={previewUrl}
                            download={selectedResume.filename}
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Download to View
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">Preview not available for this file type</p>
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
                <label className="block text-sm font-medium mb-3 text-slate-300">
                  2. Paste Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full h-64 p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Paste the complete job description here including requirements, responsibilities, and qualifications..."
                />
              </div>
            )}

            {resumes.length > 0 && (
              <button
                onClick={handleCheck}
                disabled={!selectedResume || !jobDescription.trim() || aiLoading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-6 h-6" />
                {aiLoading ? 'Analyzing ATS Compatibility...' : 'Check ATS Score'}
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {atsResult && (
          <div className="space-y-6">
            {/* ATS Score */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-green-400" />
                ATS Compatibility Score
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-6xl font-bold text-green-400">
                  {atsResult.atsScore}%
                </div>
                <div className="flex-1">
                  <div className="w-full bg-slate-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        atsResult.atsScore >= 80
                          ? 'bg-green-500'
                          : atsResult.atsScore >= 65
                          ? 'bg-blue-500'
                          : atsResult.atsScore >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${atsResult.atsScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
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
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="text-sm font-medium text-slate-400 mb-2">
                    Keyword Match Rate
                  </div>
                  <div className="text-3xl font-bold text-blue-400">
                    {atsResult.keywordMatchRate}%
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${atsResult.keywordMatchRate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Alignment Scores */}
            {atsResult.alignment && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Alignment Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="text-3xl font-bold text-blue-400">
                      {atsResult.alignment.technical}%
                    </div>
                    <div className="text-sm text-slate-400 mt-1 font-medium">Technical</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="text-3xl font-bold text-green-400">
                      {atsResult.alignment.experience}%
                    </div>
                    <div className="text-sm text-slate-400 mt-1 font-medium">Experience</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="text-3xl font-bold text-purple-400">
                      {atsResult.alignment.education}%
                    </div>
                    <div className="text-sm text-slate-400 mt-1 font-medium">Education</div>
                  </div>
                  <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="text-3xl font-bold text-orange-400">
                      {atsResult.alignment.overall}%
                    </div>
                    <div className="text-sm text-slate-400 mt-1 font-medium">Overall</div>
                  </div>
                </div>
              </div>
            )}

            {/* Matched Keywords */}
            {atsResult.matchedKeywords && atsResult.matchedKeywords.length > 0 && (
              <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-green-400 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Matched Keywords ({atsResult.matchedKeywords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {atsResult.matchedKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium border border-green-500/30"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {atsResult.missingKeywords && atsResult.missingKeywords.length > 0 && (
              <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-red-400 flex items-center gap-2">
                  <XCircle className="w-6 h-6" />
                  Missing Keywords ({atsResult.missingKeywords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {atsResult.missingKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        atsResult.criticalMissing && atsResult.criticalMissing.includes(keyword)
                          ? 'bg-red-500/30 text-red-300 border-2 border-red-500 ring-2 ring-red-500/50'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {keyword}
                      {atsResult.criticalMissing && atsResult.criticalMissing.includes(keyword) && ' ⚠️'}
                    </span>
                  ))}
                </div>
                {atsResult.criticalMissing && atsResult.criticalMissing.length > 0 && (
                  <p className="text-sm text-red-400 mt-3 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Keywords marked with warning are critical for this role
                  </p>
                )}
              </div>
            )}

            {/* Formatting Issues */}
            {atsResult.formattingIssues && atsResult.formattingIssues.length > 0 && (
              <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-orange-400 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Formatting Issues
                </h3>
                <ul className="space-y-2">
                  {atsResult.formattingIssues.map((issue, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-400 mr-2">▸</span>
                      <span className="text-slate-300">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {atsResult.recommendations && atsResult.recommendations.length > 0 && (
              <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-blue-400 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Recommendations
                </h3>
                <ul className="space-y-3">
                  {atsResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-400 mr-2 mt-1">💡</span>
                      <span className="text-slate-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            {atsResult.summary && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">📝 Summary</h3>
                <p className="text-slate-300 leading-relaxed">{atsResult.summary}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setAtsResult(null);
                  setJobDescription('');
                }}
                className="flex-1 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 font-medium transition-colors"
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
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium transition-colors"
              >
                ✓ Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}