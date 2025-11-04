// Frontend/src/components/ai/ResumeAnalyzer.jsx

import { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import toast from 'react-hot-toast';

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const { analyzeResume, loading } = useAI();

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error('Please paste your resume text');
      return;
    }

    try {
      const result = await analyzeResume(resumeText);
      setAnalysis(result);
      toast.success('Resume analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze resume');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">AI Resume Analyzer</h2>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-sm font-medium mb-2">
          Paste Your Resume Text
        </label>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="w-full h-64 p-3 border rounded-lg"
          placeholder="Paste your resume text here..."
        />
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : '🤖 Analyze Resume'}
        </button>
      </div>

      {/* Results Section */}
      {analysis && (
        <div className="space-y-6">
          {/* ATS Score */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4">ATS Score</h3>
            <div className="flex items-center gap-4">
              <div className="text-6xl font-bold text-primary-600">
                {analysis.atsScore}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-primary-600 h-4 rounded-full transition-all"
                    style={{ width: `${analysis.atsScore}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {analysis.atsScore >= 80 ? '🎉 Excellent! Your resume is ATS-friendly' :
                   analysis.atsScore >= 60 ? '👍 Good, but could be improved' :
                   '⚠️ Needs improvement for ATS systems'}
                </p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-3">Skills Detected</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-3 text-green-700">✓ Strengths</h3>
            <ul className="list-disc list-inside space-y-2">
              {analysis.strengths.map((strength, idx) => (
                <li key={idx} className="text-gray-700">{strength}</li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-3 text-orange-700">⚠ Areas for Improvement</h3>
            <ul className="list-disc list-inside space-y-2">
              {analysis.improvements.map((improvement, idx) => (
                <li key={idx} className="text-gray-700">{improvement}</li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-3 text-blue-700">💡 Recommendations</h3>
            <ul className="list-disc list-inside space-y-2">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-3">📝 Summary</h3>
            <p className="text-gray-700">{analysis.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}