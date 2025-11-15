import { useState, useEffect } from 'react';
import { getUserResumes, getResumeText, getResumeFileBlob } from '../../api/resumes';
import { useAI } from '../../hooks/useAI';
import ResumeTextViewer from './ResumeTextViewer';
import toast from 'react-hot-toast';
import { Sparkles, FileText, Eye, TrendingUp, CheckCircle, AlertCircle, Lightbulb, Plus, Minus, Layout, RefreshCw, Download, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResumeOptimizer() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState('text');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { optimizeResume, loading: aiLoading } = useAI();

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
    setOptimization(null);
    setShowPreview(false);
    
    // Clear preview URL when switching resumes
    setPreviewUrl(null);
    
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
      setPreviewUrl(null);
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
      const s3Url = await getResumeFileBlob(selectedResume.id);
      setPreviewUrl(s3Url); // Now stores S3 URL directly
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

  const handleOptimize = async () => {
    if (!selectedResume) {
      toast.error('Please select a resume');
      return;
    }

    try {
      const data = await getResumeText(selectedResume.id);
      const resumeText = data.extractedText;

      const result = await optimizeResume(resumeText);
      setOptimization(result);
      toast.success('Resume analyzed successfully!');
    } catch (error) {
      console.error('Error optimizing resume:', error);
      toast.error('Failed to optimize resume');
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-400" />
            Resume Quality Optimizer
          </h1>
          <p className="text-slate-400">
            Get professional feedback to improve your CV (no job description needed)
          </p>
        </div>

        {/* Resume Selection */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
          <label className="block text-sm font-medium mb-3 text-slate-300">
            Select Your Resume
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
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                    }`}
                  >
                    <FileText className="w-8 h-8 text-purple-400 mb-2" />
                    <div className="font-medium truncate text-white">{resume.filename}</div>
                    <div className="text-sm text-slate-400">
                      {new Date(resume.uploadedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>

              {selectedResume && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleOptimize}
                    disabled={aiLoading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    {aiLoading ? 'Analyzing...' : 'Optimize My Resume'}
                  </button>
                  <button
                    onClick={handleTogglePreview}
                    className="px-6 py-3 border-2 border-purple-500 text-purple-400 rounded-lg hover:bg-purple-500/10 font-medium flex items-center gap-2 transition-all"
                  >
                    <Eye className="w-5 h-5" />
                    {showPreview ? 'Hide Preview' : 'Preview Resume'}
                  </button>
                </div>
              )}

              {/* Preview Mode Toggle */}
              {selectedResume && showPreview && (
                <div className="mt-4 flex gap-2 items-center">
                  <span className="text-sm font-medium text-slate-400">Preview Mode:</span>
                  <button
                    onClick={() => handlePreviewModeChange('text')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      previewMode === 'text'
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Extracted Text
                  </button>
                  <button
                    onClick={() => handlePreviewModeChange('file')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      previewMode === 'file'
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Original File
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Resume Preview */}
        {showPreview && selectedResume && (
          <div className="mb-6">
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
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
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
                        className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-5 h-5" />
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

        {/* Results - keeping all existing optimization result display logic */}
        {optimization && (
          <div className="space-y-6">
            {/* Quality Score */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-purple-400" />
                Overall Quality Score
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-6xl font-bold text-purple-400">
                  {optimization.qualityScore}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-slate-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        optimization.qualityScore >= 80
                          ? 'bg-green-500'
                          : optimization.qualityScore >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${optimization.qualityScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                    {optimization.qualityScore >= 80 ? (
                      <>
                        <Award className="w-4 h-4 text-green-400" />
                        Excellent resume quality!
                      </>
                    ) : optimization.qualityScore >= 60 ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-yellow-400" />
                        Good resume, room for improvement
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        Needs significant improvements
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Detected Skills */}
            {optimization.detectedSkills && optimization.detectedSkills.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                  Skills Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {optimization.detectedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {optimization.strengths && optimization.strengths.length > 0 && (
              <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-green-400 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {optimization.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-slate-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {optimization.weaknesses && optimization.weaknesses.length > 0 && (
              <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-orange-400 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  Weaknesses
                </h3>
                <ul className="space-y-2">
                  {optimization.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-400 mr-2">▸</span>
                      <span className="text-slate-300">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {optimization.recommendations && optimization.recommendations.length > 0 && (
              <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-blue-400 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6" />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {optimization.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <Lightbulb className="w-4 h-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-slate-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sections to Add */}
            {optimization.sectionsToAdd && optimization.sectionsToAdd.length > 0 && (
              <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-purple-400 flex items-center gap-2">
                  <Plus className="w-6 h-6" />
                  Sections to Add
                </h3>
                <ul className="space-y-2">
                  {optimization.sectionsToAdd.map((section, idx) => (
                    <li key={idx} className="flex items-start">
                      <Plus className="w-4 h-4 text-purple-400 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-slate-300">{section}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sections to Remove */}
            {optimization.sectionsToRemove && optimization.sectionsToRemove.length > 0 && (
              <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-red-400 flex items-center gap-2">
                  <Minus className="w-6 h-6" />
                  Sections to Remove/Simplify
                </h3>
                <ul className="space-y-2">
                  {optimization.sectionsToRemove.map((section, idx) => (
                    <li key={idx} className="flex items-start">
                      <Minus className="w-4 h-4 text-red-400 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-slate-300">{section}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formatting Tips */}
            {optimization.formattingTips && optimization.formattingTips.length > 0 && (
              <div className="bg-indigo-500/10 rounded-xl border border-indigo-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-indigo-400 flex items-center gap-2">
                  <Layout className="w-6 h-6" />
                  Formatting Tips
                </h3>
                <ul className="space-y-2">
                  {optimization.formattingTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-indigo-400 mr-2">▸</span>
                      <span className="text-slate-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            {optimization.summary && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-slate-400" />
                  Summary
                </h3>
                <p className="text-slate-300 leading-relaxed">{optimization.summary}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setOptimization(null);
                  setSelectedResume(null);
                  setResumeText('');
                  setShowPreview(false);
                  setPreviewUrl(null); // No need to revoke S3 URL
                }}
                className="flex-1 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}