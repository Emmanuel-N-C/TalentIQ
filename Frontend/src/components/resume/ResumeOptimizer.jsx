import { useState, useEffect } from 'react';
import { getUserResumes, getResumeText, getResumeFileBlob } from '../../api/resumes';
import { useAI } from '../../hooks/useAI';
import ResumeTextViewer from './ResumeTextViewer';
import toast from 'react-hot-toast';

export default function ResumeOptimizer() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState('text'); // 'text' or 'file'
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
      toast.success('Resume analyzed successfully! ✅');
    } catch (error) {
      console.error('Error optimizing resume:', error);
      toast.error('Failed to optimize resume');
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
        <h1 className="text-3xl font-bold mb-2">📝 Resume Quality Optimizer</h1>
        <p className="text-gray-600">
          Get professional feedback to improve your CV (no job description needed)
        </p>
      </div>

      {/* Resume Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-sm font-medium mb-3">
          Select Your Resume
        </label>
        {resumes.length === 0 ? (
          <div className="text-center py-8">
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
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleOptimize}
                  disabled={aiLoading}
                  className="flex-1 bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {aiLoading ? '🔄 Analyzing...' : '🚀 Optimize My Resume'}
                </button>
                <button
                  onClick={handleTogglePreview}
                  className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium"
                >
                  {showPreview ? '✖ Hide Preview' : '👁 Preview Resume'}
                </button>
              </div>
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
        <div className="mb-6">
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

      {/* Results */}
      {optimization && (
        <div className="space-y-6">
          {/* Quality Score */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4">Overall Quality Score</h3>
            <div className="flex items-center gap-4">
              <div className="text-6xl font-bold text-primary-600">
                {optimization.qualityScore}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      optimization.qualityScore >= 80
                        ? 'bg-green-600'
                        : optimization.qualityScore >= 60
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${optimization.qualityScore}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {optimization.qualityScore >= 80
                    ? '🎉 Excellent resume quality!'
                    : optimization.qualityScore >= 60
                    ? '👍 Good resume, room for improvement'
                    : '⚠️ Needs significant improvements'}
                </p>
              </div>
            </div>
          </div>

          {/* Detected Skills */}
          {optimization.detectedSkills && optimization.detectedSkills.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3">🔧 Skills Detected</h3>
              <div className="flex flex-wrap gap-2">
                {optimization.detectedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {optimization.strengths && optimization.strengths.length > 0 && (
            <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-green-800">
                ✅ Strengths
              </h3>
              <ul className="space-y-2">
                {optimization.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {optimization.weaknesses && optimization.weaknesses.length > 0 && (
            <div className="bg-orange-50 rounded-lg border-2 border-orange-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-orange-800">
                ⚠️ Weaknesses
              </h3>
              <ul className="space-y-2">
                {optimization.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-orange-600 mr-2">▸</span>
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {optimization.recommendations && optimization.recommendations.length > 0 && (
            <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-blue-800">
                💡 Recommendations
              </h3>
              <ul className="space-y-2">
                {optimization.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 mr-2">💡</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sections to Add */}
          {optimization.sectionsToAdd && optimization.sectionsToAdd.length > 0 && (
            <div className="bg-purple-50 rounded-lg border-2 border-purple-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-purple-800">
                ➕ Sections to Add
              </h3>
              <ul className="space-y-2">
                {optimization.sectionsToAdd.map((section, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-purple-600 mr-2">+</span>
                    <span className="text-gray-700">{section}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sections to Remove */}
          {optimization.sectionsToRemove && optimization.sectionsToRemove.length > 0 && (
            <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-red-800">
                ➖ Sections to Remove/Simplify
              </h3>
              <ul className="space-y-2">
                {optimization.sectionsToRemove.map((section, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-red-600 mr-2">−</span>
                    <span className="text-gray-700">{section}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Formatting Tips */}
          {optimization.formattingTips && optimization.formattingTips.length > 0 && (
            <div className="bg-indigo-50 rounded-lg border-2 border-indigo-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-indigo-800">
                📐 Formatting Tips
              </h3>
              <ul className="space-y-2">
                {optimization.formattingTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-indigo-600 mr-2">▸</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          {optimization.summary && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3">📝 Summary</h3>
              <p className="text-gray-700 leading-relaxed">{optimization.summary}</p>
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
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }
              }}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
            >
              🔄 Analyze Another Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}