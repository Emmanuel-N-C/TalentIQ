import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

export default function TemplateGallery() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const mode = searchParams.get('mode') || 'manual';

  const templates = [
    {
      id: 'ats-minimal',
      name: 'ATS-Safe Minimal',
      badge: 'ATS-Safe',
      badgeColor: 'bg-green-800 text-green-200',
      image: 'https://via.placeholder.com/300x400?text=ATS+Minimal'
    },
    {
      id: 'modern-professional',
      name: 'Modern Professional',
      badge: 'Popular',
      badgeColor: 'bg-blue-800 text-blue-200',
      image: 'https://via.placeholder.com/300x400?text=Modern+Pro'
    },
    {
      id: 'creative-bold',
      name: 'Creative Bold',
      badge: 'Creative',
      badgeColor: 'bg-purple-800 text-purple-200',
      image: 'https://via.placeholder.com/300x400?text=Creative+Bold'
    },
    {
      id: 'executive-classic',
      name: 'Executive Classic',
      badge: 'Executive',
      badgeColor: 'bg-amber-800 text-amber-200',
      image: 'https://via.placeholder.com/300x400?text=Executive'
    },
    {
      id: 'tech-focused',
      name: 'Tech-Focused',
      badge: 'Tech',
      badgeColor: 'bg-cyan-800 text-cyan-200',
      image: 'https://via.placeholder.com/300x400?text=Tech+Focus'
    },
    {
      id: 'clean-simple',
      name: 'Clean & Simple',
      badge: 'ATS-Safe',
      badgeColor: 'bg-green-800 text-green-200',
      image: 'https://via.placeholder.com/300x400?text=Clean+Simple'
    }
  ];

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template.id);
    console.log('Selected template:', template.id);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      console.log(`Continuing with template: ${selectedTemplate}, mode: ${mode}`);
      // Navigate to actual resume builder (implement later)
      // For now, navigate back to resumes page as placeholder
      navigate('/jobseeker/resumes');
    }
  };

  const handleBack = () => {
    navigate('/jobseeker/resumes/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to options
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Choose a Template Style
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Select how you want your resume to look – you can change it later
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className={`
                relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300
                ${selectedTemplate === template.id 
                  ? 'ring-4 ring-indigo-500 scale-105 shadow-xl shadow-indigo-500/30' 
                  : 'hover:ring-2 hover:ring-gray-600 hover:scale-102'
                }
              `}
            >
              {/* Template Preview */}
              <div className="bg-gray-900 h-64 flex items-center justify-center relative">
                <img 
                  src={template.image} 
                  alt={template.name}
                  className="w-full h-full object-cover opacity-80"
                />
                
                {/* Selected Checkmark */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="bg-gray-800/50 p-4">
                <h3 className="text-white font-semibold mb-2">{template.name}</h3>
                <span className={`${template.badgeColor} px-2 py-1 rounded text-xs font-medium`}>
                  {template.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center sticky bottom-0 bg-slate-900/90 backdrop-blur-sm border-t border-gray-800 p-6 -mx-4 sm:-mx-6">
          <button
            onClick={handleBack}
            className="w-full sm:w-auto px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Back
          </button>
          
          <button
            onClick={handleContinue}
            disabled={!selectedTemplate}
            className={`
              w-full sm:w-auto px-8 py-3 rounded-lg font-medium transition-all
              ${selectedTemplate
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Continue with this Template
          </button>
        </div>
      </div>
    </div>
  );
}