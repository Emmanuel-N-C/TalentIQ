import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../api/jobs';
import { useAI } from '../../hooks/useAI';
import toast from 'react-hot-toast';
import { Briefcase, Building2, FileText, Award, Code, Save, X, Sparkles, MapPin } from 'lucide-react';

export default function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { generateJobDescription, loading: aiLoading } = useAI();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',  // ADDED
    description: '',
    experienceLevel: 'Mid-Level',
    skillsRequired: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAIGenerate = async () => {
    if (!formData.title.trim() || !formData.company.trim()) {
      toast.error('Please enter job title and company first');
      return;
    }

    try {
      const result = await generateJobDescription(
        formData.title,
        formData.company,
        formData.experienceLevel
      );

      setFormData(prev => ({
        ...prev,
        description: result.description,
        skillsRequired: result.suggestedSkills.join(', '),
      }));

      toast.success('AI-generated job description ready!');
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to generate description. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await createJob(formData);
      toast.success('Job posted successfully!');
      navigate('/recruiter/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error(error.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-2 sm:gap-3">
            <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
            Post New Job
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">Create a new job listing to attract top talent</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Job Title */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6">
            <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-slate-300 flex items-center gap-2">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              Job Title
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 sm:p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm sm:text-base"
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          {/* Company */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6">
            <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              Company Name
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full p-3 sm:p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm sm:text-base"
              placeholder="e.g., TechCorp Inc."
              required
            />
          </div>

          {/* Location - NEW FIELD */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6">
            <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              Location
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-3 sm:p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm sm:text-base"
              placeholder="e.g.,  New York, NY"
              required
            />
          </div>

          {/* Experience Level */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6">
            <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              Experience Level
              <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full p-3 sm:p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm sm:text-base appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                }}
                required
              >
                <option value="Entry-Level">Entry Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>

          {/* AI Generator Button */}
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-purple-300 mb-1 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  AI Job Description Generator
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Let AI write a professional job description based on the title, company, and experience level
                </p>
              </div>
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiLoading || !formData.title || !formData.company}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2 font-semibold transition-all text-sm sm:text-base"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                {aiLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* Skills Required */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <label className="block text-sm font-medium mb-3 text-slate-300 flex items-center gap-2">
              <Code className="w-5 h-5 text-green-400" />
              Skills Required
            </label>
            <input
              type="text"
              name="skillsRequired"
              value={formData.skillsRequired}
              onChange={handleChange}
              className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="e.g., React, Node.js, TypeScript, MongoDB"
            />
            <p className="text-sm text-slate-500 mt-2">Separate skills with commas (AI will suggest skills automatically)</p>
          </div>

          {/* Description */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <label className="block text-sm font-medium mb-3 text-slate-300 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Job Description
              <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="12"
              className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all whitespace-pre-line"
              placeholder="Provide a detailed job description including responsibilities, requirements, and benefits..."
              required
            />
            <p className="text-sm text-slate-500 mt-2">
              Include responsibilities, requirements, qualifications, and benefits
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? 'Posting Job...' : 'Post Job'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/recruiter/jobs')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-semibold flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}