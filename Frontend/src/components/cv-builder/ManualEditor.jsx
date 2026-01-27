import React, { useState } from 'react';
import { Plus, GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { createNewSection, SECTION_TYPES, reorderSections } from '../../utils/cvDataStructure';
import SectionEditor from './SectionEditor';

/**
 * Manual Editor Component
 * Full manual control for creating CV from scratch
 */
export default function ManualEditor({ cvData, onDataChange, templateId }) {
  const [expandedSections, setExpandedSections] = useState(new Set(['personal-info']));

  const handlePersonalInfoChange = (field, value) => {
    onDataChange({
      ...cvData,
      personalInfo: {
        ...cvData.personalInfo,
        [field]: value
      }
    });
  };

  const handleSummaryChange = (value) => {
    onDataChange({
      ...cvData,
      summary: value
    });
  };

  const handleSectionChange = (sectionId, updates) => {
    onDataChange({
      ...cvData,
      sections: cvData.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    });
  };

  const handleAddSection = (type) => {
    const newSection = createNewSection(type, cvData.sections.length + 1);
    onDataChange({
      ...cvData,
      sections: [...cvData.sections, newSection]
    });
    setExpandedSections(new Set([...expandedSections, newSection.id]));
  };

  const handleDeleteSection = (sectionId) => {
    onDataChange({
      ...cvData,
      sections: cvData.sections.filter(s => s.id !== sectionId)
    });
  };

  const toggleSectionVisibility = (sectionId) => {
    handleSectionChange(sectionId, {
      visible: !cvData.sections.find(s => s.id === sectionId)?.visible
    });
  };

  const toggleSectionExpanded = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Check if template requires specific fields
  const isEUSwiss = templateId === 'eu-swiss';

  return (
    <div className="manual-editor space-y-6">
      {/* Personal Information */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSectionExpanded('personal-info')}
          className="w-full px-6 py-4 flex items-center justify-between bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
        >
          <h3 className="text-lg font-bold text-white">Personal Information</h3>
          <span className="text-slate-400">{expandedSections.has('personal-info') ? '−' : '+'}</span>
        </button>

        {expandedSections.has('personal-info') && (
          <div className="p-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={cvData.personalInfo.fullName}
                onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={cvData.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={cvData.personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={cvData.personalInfo.location}
                onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, Country"
              />
            </div>

            {/* LinkedIn, GitHub, Website */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={cvData.personalInfo.linkedin}
                  onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  GitHub
                </label>
                <input
                  type="url"
                  value={cvData.personalInfo.github}
                  onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={cvData.personalInfo.website}
                  onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="yourwebsite.com"
                />
              </div>
            </div>

            {/* EU/Swiss Specific Fields */}
            {isEUSwiss && (
              <>
                <div className="border-t border-slate-600 pt-4 mt-4">
                  <p className="text-sm text-slate-400 mb-4">EU/Swiss Template Requirements:</p>
                  
                  {/* Photo URL */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Photo URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={cvData.personalInfo.photoUrl}
                      onChange={(e) => handlePersonalInfoChange('photoUrl', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="URL to your photo"
                    />
                    <p className="text-xs text-slate-500 mt-1">Upload your photo and paste the URL here</p>
                  </div>

                  {/* Nationality & Residence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nationality <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={cvData.personalInfo.nationality}
                        onChange={(e) => handlePersonalInfoChange('nationality', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Swiss, German, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Residence Status
                      </label>
                      <input
                        type="text"
                        value={cvData.personalInfo.residenceStatus}
                        onChange={(e) => handlePersonalInfoChange('residenceStatus', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Permit B, C, etc."
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={cvData.personalInfo.dateOfBirth}
                      onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Summary/Profile */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSectionExpanded('summary')}
          className="w-full px-6 py-4 flex items-center justify-between bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
        >
          <h3 className="text-lg font-bold text-white">Professional Summary</h3>
          <span className="text-slate-400">{expandedSections.has('summary') ? '−' : '+'}</span>
        </button>

        {expandedSections.has('summary') && (
          <div className="p-6">
            <textarea
              value={cvData.summary}
              onChange={(e) => handleSummaryChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="5"
              placeholder="Write a brief professional summary highlighting your key strengths and experience..."
            />
          </div>
        )}
      </div>

      {/* Dynamic Sections */}
      {cvData.sections
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <div key={section.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-slate-800/80">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-slate-500 cursor-move" />
                <button
                  onClick={() => toggleSectionExpanded(section.id)}
                  className="text-lg font-bold text-white hover:text-blue-400 transition-colors"
                >
                  {section.title}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSectionVisibility(section.id)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title={section.visible ? 'Hide section' : 'Show section'}
                >
                  {section.visible ? (
                    <Eye className="w-5 h-5 text-green-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-slate-500" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteSection(section.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete section"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
                <span className="text-slate-400">
                  {expandedSections.has(section.id) ? '−' : '+'}
                </span>
              </div>
            </div>

            {expandedSections.has(section.id) && (
              <div className="p-6">
                <SectionEditor
                  section={section}
                  onSectionChange={(updates) => handleSectionChange(section.id, updates)}
                />
              </div>
            )}
          </div>
        ))}

      {/* Add Section Button */}
      <div className="bg-slate-800/30 border-2 border-dashed border-slate-600 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4">Add New Section</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(SECTION_TYPES).map(([key, type]) => (
            <button
              key={type}
              onClick={() => handleAddSection(type)}
              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

