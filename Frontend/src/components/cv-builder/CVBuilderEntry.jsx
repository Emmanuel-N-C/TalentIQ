import React, { useState } from 'react';
import { FileText, Sparkles, Upload, ArrowRight } from 'lucide-react';
import TemplateSelector from './TemplateSelector';
import CVEditor from './CVEditor';
import { createEmptyCVData } from '../../utils/cvDataStructure';

/**
 * CV Builder Entry Component
 * Shows 3 workflow options: Manual, AI-Generated, Import Existing
 */
export default function CVBuilderEntry() {
  const [step, setStep] = useState('entry'); // 'entry', 'template-selection', 'editor'
  const [workflowType, setWorkflowType] = useState(null); // 'manual', 'ai', 'import'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [cvData, setCvData] = useState(null);

  const handleWorkflowSelect = (type) => {
    setWorkflowType(type);
    setStep('template-selection');
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleTemplateContinue = () => {
    // Initialize CV data with selected template
    const initialData = createEmptyCVData(selectedTemplate);
    initialData.sourceType = workflowType;
    setCvData(initialData);
    setStep('editor');
  };

  const handleBack = () => {
    if (step === 'editor') {
      setStep('template-selection');
    } else if (step === 'template-selection') {
      setStep('entry');
      setWorkflowType(null);
      setSelectedTemplate(null);
    }
  };

  // Entry Screen - Choose Workflow
  if (step === 'entry') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
              Create Your Professional CV
            </h1>
            <p className="text-xl text-slate-400">
              Choose how you want to create your CV
            </p>
          </div>

          {/* Workflow Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Manual Creation */}
            <WorkflowCard
              icon={<FileText className="w-16 h-16" />}
              title="Manual Creation"
              description="Start from scratch and fill in your details section by section"
              features={[
                'Full control over content',
                'Step-by-step guidance',
                'Add custom sections'
              ]}
              buttonText="Start Manually"
              onClick={() => handleWorkflowSelect('manual')}
              color="blue"
            />

            {/* AI-Powered Generation */}
            <WorkflowCard
              icon={<Sparkles className="w-16 h-16" />}
              title="AI-Powered"
              description="Let AI create a professional CV based on your basic information"
              features={[
                'Quick setup',
                'AI-generated content',
                'Professional formatting'
              ]}
              buttonText="Generate with AI"
              onClick={() => handleWorkflowSelect('ai')}
              color="purple"
              
            />

            {/* Import Existing */}
            <WorkflowCard
              icon={<Upload className="w-16 h-16" />}
              title="Import Existing"
              description="Use your uploaded resume and transform it into a professional CV"
              features={[
                'Use existing data',
                'Quick conversion',
                'Choose new template'
              ]}
              buttonText="Import Resume"
              onClick={() => handleWorkflowSelect('import')}
              color="green"
            />
          </div>

          {/* Helper Text */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm">
              Don&apos;t worry! You can edit everything before downloading
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Template Selection Screen
  if (step === 'template-selection') {
    return (
      <div>
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="fixed top-4 left-4 z-50 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ← Back
        </button>
        
        <TemplateSelector
          selectedTemplateId={selectedTemplate}
          onSelect={handleTemplateSelect}
          onContinue={handleTemplateContinue}
        />
      </div>
    );
  }

  // Editor Screen
  if (step === 'editor') {
    return (
      <div>
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="fixed top-4 left-4 z-50 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ← Change Template
        </button>

        <CVEditor
          cvData={cvData}
          onDataChange={setCvData}
          workflowType={workflowType}
          templateId={selectedTemplate}
        />
      </div>
    );
  }

  return null;
}

/**
 * Workflow Card Component
 */
function WorkflowCard({ icon, title, description, features, buttonText, onClick, color, recommended = false }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
  };

  const iconColorClasses = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-green-400'
  };

  return (
    <div className="relative group">
      {/* Recommended Badge */}
      {recommended && (
        <div className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          ✨ Recommended
        </div>
      )}

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 h-full flex flex-col transition-all group-hover:border-slate-600 group-hover:shadow-xl">
        {/* Icon */}
        <div className={`mb-6 ${iconColorClasses[color]}`}>
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-3 text-white">
          {title}
        </h3>

        {/* Description */}
        <p className="text-slate-400 mb-6 flex-grow">
          {description}
        </p>

        {/* Features */}
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm text-slate-300">
              <span className={`mr-2 ${iconColorClasses[color]}`}>✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Button */}
        <button
          onClick={onClick}
          className={`w-full bg-gradient-to-r ${colorClasses[color]} text-white px-6 py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg`}
        >
          {buttonText}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

