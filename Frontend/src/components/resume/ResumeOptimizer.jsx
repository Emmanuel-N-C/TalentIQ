import { useState, useEffect } from 'react';
import { getUserResumes, getResumeText } from '../../api/resumes';
import { useAI } from '../../hooks/useAI';
import toast from 'react-hot-toast';

export default function ResumeOptimizer() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
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
          Get professional feedback to improve your CV overall (no job description needed)
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
              className="text-primary-600 hover:underline"
            >
              Upload a resume first →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <button
                key={resume.id}
                onClick={() => setSelectedResume(resume)}
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
        )}

        {resumes.length > 0 && (
          <button
            onClick={handleOptimize}
            disabled={!selectedResume || aiLoading}
            className="mt-6 bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading ? 'Analyzing...' : '🚀 Optimize My Resume'}
          </button>
        )}
      </div>

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
                    className="bg-primary-600 h-4 rounded-full transition-all"
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
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6">
            <h3 className="text-xl font-bold mb-3 text-green-800">
              ✅ Strengths
            </h3>
            <ul className="list-disc list-inside space-y-2">
              {optimization.strengths.map((strength, idx) => (
                <li key={idx} className="text-gray-700">
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-orange-50 rounded-lg border-2 border-orange-200 p-6">
            <h3 className="text-xl font-bold mb-3 text-orange-800">
              ⚠️ Weaknesses
            </h3>
            <ul className="list-disc list-inside space-y-2">
              {optimization.weaknesses.map((weakness, idx) => (
                <li key={idx} className="text-gray-700">
                  {weakness}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
            <h3 className="text-xl font-bold mb-3 text-blue-800">
              💡 Recommendations
            </h3>
            <ul className="list-disc list-inside space-y-2">
              {optimization.recommendations.map((rec, idx) => (
                <li key={idx} className="text-gray-700">
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Sections to Add */}
          {optimization.sectionsToAdd && optimization.sectionsToAdd.length > 0 && (
            <div className="bg-purple-50 rounded-lg border-2 border-purple-200 p-6">
              <h3 className="text-xl font-bold mb-3 text-purple-800">
                ➕ Sections to Add
              </h3>
              <ul className="list-disc list-inside space-y-2">
                {optimization.sectionsToAdd.map((section, idx) => (
                  <li key={idx} className="text-gray-700">
                    {section}
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
              <ul className="list-disc list-inside space-y-2">
                {optimization.sectionsToRemove.map((section, idx) => (
                  <li key={idx} className="text-gray-700">
                    {section}
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
              <ul className="list-disc list-inside space-y-2">
                {optimization.formattingTips.map((tip, idx) => (
                  <li key={idx} className="text-gray-700">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-3">📝 Summary</h3>
            <p className="text-gray-700 leading-relaxed">{optimization.summary}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setOptimization(null);
                setSelectedResume(null);
              }}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              🔄 Analyze Another Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}