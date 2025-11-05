import { useState, useEffect } from 'react';
import { useAI } from '../../hooks/useAI';
import toast from 'react-hot-toast';

export default function JobForm({ initialData = null, onSubmit, submitButtonText = 'Create Job' }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    skillsRequired: '',
    experienceLevel: 'Entry-Level',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { generateJobDescription, loading: aiLoading } = useAI();

  // Pre-populate form if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        company: initialData.company || '',
        description: initialData.description || '',
        skillsRequired: initialData.skillsRequired || '',
        experienceLevel: initialData.experienceLevel || 'Entry-Level',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Job title must be at least 3 characters';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.experienceLevel) {
      newErrors.experienceLevel = 'Experience level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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

      toast.success('✨ AI-generated job description ready!');
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to generate description');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Senior Software Engineer"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.company ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., TechCorp Inc."
        />
        {errors.company && (
          <p className="text-red-500 text-sm mt-1">{errors.company}</p>
        )}
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Experience Level <span className="text-red-500">*</span>
        </label>
        <select
          name="experienceLevel"
          value={formData.experienceLevel}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.experienceLevel ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="Entry-Level">Entry-Level</option>
          <option value="Mid-Level">Mid-Level</option>
          <option value="Senior">Senior</option>
          <option value="Lead">Lead</option>
          <option value="Executive">Executive</option>
        </select>
        {errors.experienceLevel && (
          <p className="text-red-500 text-sm mt-1">{errors.experienceLevel}</p>
        )}
      </div>

      {/* AI Generate Button */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              ✨ AI Job Description Generator
            </h3>
            <p className="text-sm text-blue-700">
              Let AI write a professional job description based on the title and company
            </p>
          </div>
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={aiLoading || !formData.title || !formData.company}
            className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {aiLoading ? '✨ Generating...' : '🤖 Generate'}
          </button>
        </div>
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={12}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe the role, responsibilities, and requirements..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          {formData.description.length} characters (minimum 50)
        </p>
      </div>

      {/* Skills Required */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills Required
        </label>
        <input
          type="text"
          name="skillsRequired"
          value={formData.skillsRequired}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., React, Node.js, TypeScript, AWS"
        />
        <p className="text-sm text-gray-500 mt-1">
          Comma-separated list of skills
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </button>
      </div>
    </form>
  );
}