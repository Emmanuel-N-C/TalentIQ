import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import toast from 'react-hot-toast';

/**
 * AI Generator Form Component
 * Collects minimal user input and generates CV with AI
 */
export default function AIGeneratorForm({ cvData, onDataChange, templateId, isGenerating, setIsGenerating }) {
  const [formData, setFormData] = useState({
    targetRole: '',
    experienceSummary: '',
    skillsList: '',
    educationSummary: ''
  });
  const [hasGenerated, setHasGenerated] = useState(false);

  const { loading: aiLoading } = useAI();

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleGenerate = async () => {
    // Validate minimum input
    if (!formData.targetRole.trim()) {
      toast.error('Please enter your target role');
      return;
    }

    setIsGenerating(true);
    
    try {
      // TODO: Call AI API to generate CV content
      // For now, we'll use the input data directly
      
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update CV data with generated content
      const updatedData = {
        ...cvData,
        personalInfo: {
          ...cvData.personalInfo,
          // Keep existing personal info
        },
        summary: formData.experienceSummary || `Experienced ${formData.targetRole} with proven track record in delivering high-quality results. Passionate about continuous learning and professional development.`,
        sections: cvData.sections.map(section => {
          if (section.type === 'experience' && formData.experienceSummary) {
            // Parse experience from summary
            return {
              ...section,
              data: {
                items: [{
                  id: crypto.randomUUID(),
                  company: 'Your Company',
                  role: formData.targetRole,
                  location: '',
                  startDate: '',
                  endDate: '',
                  current: true,
                  description: formData.experienceSummary,
                  achievements: []
                }]
              }
            };
          }
          if (section.type === 'skills' && formData.skillsList) {
            // Parse skills
            const skills = formData.skillsList.split(',').map(s => s.trim()).filter(s => s);
            return {
              ...section,
              data: {
                items: skills.map(skill => ({
                  id: crypto.randomUUID(),
                  name: skill,
                  level: ''
                }))
              }
            };
          }
          if (section.type === 'education' && formData.educationSummary) {
            return {
              ...section,
              data: {
                items: [{
                  id: crypto.randomUUID(),
                  school: 'Your University',
                  degree: formData.educationSummary,
                  field: '',
                  location: '',
                  startDate: '',
                  endDate: '',
                  gpa: '',
                  achievements: []
                }]
              }
            };
          }
          return section;
        })
      };

      onDataChange(updatedData);
      setHasGenerated(true);
      toast.success('CV generated successfully! You can now edit and refine it.');
    } catch (error) {
      console.error('Error generating CV:', error);
      toast.error('Failed to generate CV');
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasGenerated) {
    return (
      <div className="space-y-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <Sparkles className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">
            Your CV has been generated!
          </h3>
          <p className="text-slate-400 mb-4">
            Review the preview on the right and make any edits you&apos;d like.
            Your changes are saved automatically.
          </p>
          <button
            onClick={() => {
              setHasGenerated(false);
              setFormData({
                targetRole: '',
                experienceSummary: '',
                skillsList: '',
                educationSummary: ''
              });
            }}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Generate Another
          </button>
        </div>

        {/* Show manual editor fields after generation */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
          <h4 className="text-white font-semibold mb-3">Want to make changes?</h4>
          <p className="text-slate-400 text-sm mb-4">
            Switch to manual editing mode to have full control over each section.
          </p>
          <p className="text-slate-500 text-xs">
            (This feature will be available in the next update)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-purple-500 rounded-full p-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              AI-Powered CV Generation
            </h3>
            <p className="text-slate-400 text-sm">
              Provide some basic information and let AI create a professional CV for you.
              You can edit everything after generation.
            </p>
          </div>
        </div>
      </div>

      {/* AI Form */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 space-y-5">
        {/* Target Role */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Target Job Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.targetRole}
            onChange={(e) => handleInputChange('targetRole', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Senior Software Engineer, Marketing Manager..."
          />
          <p className="text-xs text-slate-500 mt-1">What position are you applying for?</p>
        </div>

        {/* Experience Summary */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Brief Experience Summary
          </label>
          <textarea
            value={formData.experienceSummary}
            onChange={(e) => handleInputChange('experienceSummary', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows="4"
            placeholder="Briefly describe your work experience, key responsibilities, and achievements..."
          />
          <p className="text-xs text-slate-500 mt-1">AI will expand this into professional experience entries</p>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Key Skills
          </label>
          <textarea
            value={formData.skillsList}
            onChange={(e) => handleInputChange('skillsList', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows="3"
            placeholder="List your key skills separated by commas: Python, React, Project Management, etc."
          />
          <p className="text-xs text-slate-500 mt-1">Separate skills with commas</p>
        </div>

        {/* Education */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Education
          </label>
          <input
            type="text"
            value={formData.educationSummary}
            onChange={(e) => handleInputChange('educationSummary', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Bachelor's in Computer Science, Master's in Business..."
          />
          <p className="text-xs text-slate-500 mt-1">Your highest or most relevant degree</p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !formData.targetRole.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-3 shadow-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Generating your CV...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Generate My CV with AI
            </>
          )}
        </button>

        {/* Info */}
        <div className="text-center text-sm text-slate-500">
          <p>Don&apos;t worry! You&apos;ll be able to edit everything after generation.</p>
        </div>
      </div>
    </div>
  );
}

