import { useState, useEffect } from 'react';
import { getUserResumes, getResumeText } from '../../api/resumes';
import { useAI } from '../../hooks/useAI';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Sparkles, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Download,
  Save,
  RefreshCw,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Award,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';

export default function CreateResumeEntry() {
  const navigate = useNavigate();
  const { analyzeMatch, tailorResume, loading: aiLoading } = useAI();

  // State
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Analysis results
  const [matchAnalysis, setMatchAnalysis] = useState(null);
  
  // Tailored resume
  const [tailoredText, setTailoredText] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  
  // UI state
  const [step, setStep] = useState('input'); // 'input', 'analysis', 'tailored'

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
    setMatchAnalysis(null);
    setTailoredText('');
    setShowComparison(false);
    setStep('input');
    
    try {
      const data = await getResumeText(resume.id);
      setResumeText(data.extractedText);
    } catch (error) {
      console.error('Error loading resume text:', error);
      toast.error('Failed to load resume text');
    }
  };

  const handleAnalyzeMatch = async () => {
    if (!selectedResume) {
      toast.error('Please select a resume');
      return;
    }
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    try {
      const result = await analyzeMatch(resumeText, jobDescription);
      setMatchAnalysis(result);
      setStep('analysis');
      toast.success('Match analysis completed!');
    } catch (error) {
      console.error('Error analyzing match:', error);
      toast.error('Failed to analyze match');
    }
  };

  const handleTailorResume = async () => {
    try {
      const result = await tailorResume(resumeText, jobDescription, matchAnalysis);
      setTailoredText(result.tailoredResume);
      setShowComparison(true);
      setStep('tailored');
      toast.success('Resume tailored successfully! ✨');
    } catch (error) {
      console.error('Error tailoring resume:', error);
      toast.error('Failed to tailor resume');
    }
  };

  const handleSaveVersion = async () => {
    // TODO: Call backend API to save as new resume version
    // For now, just show success message
    toast.success('Feature coming soon: Save as new version');
    // Future: POST /api/resumes/{id}/versions
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const margin = 15;
      const lineHeight = 7;
      const pageWidth = doc.internal.pageSize.getWidth() - (margin * 2);
      
      // Split text into lines
      const lines = doc.splitTextToSize(tailoredText, pageWidth);
      
      let y = margin;
      lines.forEach((line) => {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
      
      doc.save(`${selectedResume?.filename || 'resume'}_tailored.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleReset = () => {
    setMatchAnalysis(null);
    setTailoredText('');
    setShowComparison(false);
    setStep('input');
    setJobDescription('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-10 h-10 text-indigo-400" />
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Beta Resume Optimizer
            </h1>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-medium border border-indigo-500/30">
              BETA
            </span>
          </div>
          <p className="text-slate-400">
            Analyze how your resume matches a job, then let AI tailor it to maximize your chances
          </p>
        </div>

        {/* Step 1: Resume Selection & Job Description */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" />
            Step 1: Select Resume & Job Description
          </h2>
          
          {/* Resume Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-slate-300">
              Select Your Resume
            </label>
            {resumes.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-600 rounded-lg bg-slate-900/30">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No resumes uploaded yet</p>
                <Link
                  to="/jobseeker/resumes"
                  className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Upload a resume first →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {resumes.map((resume) => (
                  <button
                    key={resume.id}
                    onClick={() => handleSelectResume(resume)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedResume?.id === resume.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                    }`}
                  >
                    <FileText className="w-8 h-8 text-indigo-400 mb-2" />
                    <div className="font-medium truncate text-white">{resume.filename}</div>
                    <div className="text-sm text-slate-400">
                      {new Date(resume.uploadedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Job Description Input */}
          {selectedResume && (
            <div>
              <label className="block text-sm font-medium mb-3 text-slate-300">
                Paste Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here... Include requirements, responsibilities, qualifications, etc."
                rows={10}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                {jobDescription.length} characters • The more complete the job description, the better the analysis
              </p>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyzeMatch}
                disabled={!jobDescription.trim() || aiLoading}
                className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {aiLoading && step === 'input' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Match & Get Suggestions
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Match Analysis Results */}
        {matchAnalysis && step !== 'input' && (
          <div className="space-y-6 mb-6">
            {/* Match Score */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-indigo-400" />
                Match Score
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-6xl font-bold text-indigo-400">
                  {matchAnalysis.matchScore}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-slate-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        matchAnalysis.matchScore >= 80
                          ? 'bg-green-500'
                          : matchAnalysis.matchScore >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${matchAnalysis.matchScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                    {matchAnalysis.matchScore >= 80 ? (
                      <>
                        <Award className="w-4 h-4 text-green-400" />
                        Excellent match for this role!
                      </>
                    ) : matchAnalysis.matchScore >= 60 ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-yellow-400" />
                        Good match, but can be improved
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        Significant gaps for this role
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Matched Keywords */}
            {matchAnalysis.matchedKeywords && matchAnalysis.matchedKeywords.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  Matched Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {matchAnalysis.matchedKeywords.map((keyword, idx) => (
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
            {matchAnalysis.missingKeywords && matchAnalysis.missingKeywords.length > 0 && (
              <div className="bg-orange-500/10 rounded-xl border border-orange-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-orange-400 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {matchAnalysis.missingKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-lg text-sm font-medium border border-orange-500/40"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-400">
                  Consider incorporating these keywords if you have relevant experience
                </p>
              </div>
            )}

            {/* Strengths */}
            {matchAnalysis.strengths && matchAnalysis.strengths.length > 0 && (
              <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-green-400 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Strengths for This Role
                </h3>
                <ul className="space-y-2">
                  {matchAnalysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-slate-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {matchAnalysis.recommendations && matchAnalysis.recommendations.length > 0 && (
              <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-6">
                <h3 className="text-xl font-bold mb-3 text-blue-400 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6" />
                  Recommendations to Improve Match
                </h3>
                <ul className="space-y-2">
                  {matchAnalysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <Lightbulb className="w-4 h-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-slate-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            {matchAnalysis.summary && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">Summary</h3>
                <p className="text-slate-300 leading-relaxed">{matchAnalysis.summary}</p>
              </div>
            )}

            {/* Tailor Resume Button */}
            {step === 'analysis' && (
              <div className="flex gap-4">
                <button
                  onClick={handleTailorResume}
                  disabled={aiLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Tailoring Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Tailor / Optimize Resume with AI
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-4 border-2 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Side-by-Side Comparison */}
        {showComparison && tailoredText && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ArrowRight className="w-7 h-7 text-purple-400" />
                Original vs Tailored Resume
              </h3>
              <p className="text-slate-400 mb-6">
                Review the AI-optimized version. Edit as needed, then save or download.
              </p>

              {/* Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Original */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <h4 className="font-semibold text-slate-300">Original Resume</h4>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 h-96 overflow-y-auto">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                      {resumeText}
                    </pre>
                  </div>
                </div>

                {/* Tailored (Editable) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h4 className="font-semibold text-purple-300">Tailored Resume (Editable)</h4>
                  </div>
                  <textarea
                    value={tailoredText}
                    onChange={(e) => setTailoredText(e.target.value)}
                    className="w-full bg-slate-900/50 border border-purple-500/50 rounded-lg p-4 h-96 text-sm text-slate-300 font-mono resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    You can edit the text above before saving or downloading
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleSaveVersion}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save as New Version
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border-2 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}