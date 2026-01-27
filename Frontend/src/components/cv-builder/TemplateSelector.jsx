import React, { useState } from 'react';
import { getAllTemplates, getTemplatesByCategory, TEMPLATE_CATEGORIES } from './templates/templateRegistry';
import { CheckCircle, Layout } from 'lucide-react';

/**
 * Template Selector Component
 * Displays template gallery for user to choose from
 */
export default function TemplateSelector({ selectedTemplateId, onSelect, onContinue, suggestion = null }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const templates = getTemplatesByCategory(activeCategory);

  const handleTemplateSelect = (templateId) => {
    onSelect(templateId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Layout className="w-10 h-10 text-blue-400" />
            Choose Your Template
          </h1>
          <p className="text-slate-400">
            Select a professional CV template. You can customize it after selection.
          </p>
        </div>

        {/* AI Suggestion (if provided) */}
        {suggestion && (
          <div className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-purple-500 rounded-full p-2">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-300 mb-1">AI Recommendation</h3>
                <p className="text-slate-300 text-sm">{suggestion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {TEMPLATE_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8">
          {templates.map(template => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                selectedTemplateId === template.id
                  ? 'ring-4 ring-blue-500 shadow-2xl scale-105'
                  : 'hover:scale-105 hover:shadow-xl'
              }`}
            >
              {/* Template Thumbnail */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="aspect-[210/297] bg-slate-900 relative">
                  {/* Placeholder or actual thumbnail */}
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback Placeholder */}
                  <div className="absolute inset-0 hidden items-center justify-center bg-slate-800 text-slate-500">
                    <div className="text-center p-8">
                      <Layout className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <div className="text-sm">Template Preview</div>
                      <div className="text-xs mt-1">{template.name}</div>
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {selectedTemplateId === template.id && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full p-3 shadow-lg">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-5 bg-slate-800">
                  <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                  <p className="text-sm text-slate-400 mb-3">{template.description}</p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {template.features.map(feature => (
                      <span
                        key={feature}
                        className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Recommended For */}
                  {template.recommendedFor && (
                    <div className="text-xs text-slate-500">
                      <strong>Best for:</strong> {template.recommendedFor.join(', ')}
                    </div>
                  )}

                  {/* Select Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(template.id);
                    }}
                    className={`w-full mt-4 py-2 rounded-lg font-medium transition-all ${
                      selectedTemplateId === template.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {selectedTemplateId === template.id ? 'Selected' : 'Select Template'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button (if template selected) */}
        {selectedTemplateId && onContinue && (
          <div className="flex justify-center">
            <button
              onClick={onContinue}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 font-bold text-lg shadow-lg transition-all"
            >
              Continue with Selected Template →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

