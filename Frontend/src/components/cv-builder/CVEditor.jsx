import React, { useState } from 'react';
import ManualEditor from './ManualEditor';
import AIGeneratorForm from './AIGeneratorForm';
import ImportSelector from './ImportSelector';
import CVPreview from './CVPreview';
import { Save, Download, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * CV Editor Component
 * Main editor container with split view: Form on left, Preview on right
 */
export default function CVEditor({ cvData, onDataChange, workflowType, templateId }) {
  const [showPreview, setShowPreview] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = async () => {
    try {
      // TODO: Implement save to backend
      toast.success('CV saved successfully!');
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error('Failed to save CV');
    }
  };

  const handleDownload = async () => {
    try {
      // TODO: Implement PDF download
      toast.success('CV downloaded successfully!');
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast.error('Failed to download CV');
    }
  };

  // Render appropriate editor based on workflow type
  const renderEditor = () => {
    switch (workflowType) {
      case 'ai':
        return (
          <AIGeneratorForm
            cvData={cvData}
            onDataChange={onDataChange}
            templateId={templateId}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        );
      case 'import':
        return (
          <ImportSelector
            cvData={cvData}
            onDataChange={onDataChange}
            templateId={templateId}
          />
        );
      case 'manual':
      default:
        return (
          <ManualEditor
            cvData={cvData}
            onDataChange={onDataChange}
            templateId={templateId}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div>
              <h2 className="text-xl font-bold text-white">
                {cvData.title || 'Untitled CV'}
              </h2>
              <p className="text-sm text-slate-400">
                {workflowType === 'ai' && 'AI-Powered Creation'}
                {workflowType === 'import' && 'Import from Resume'}
                {workflowType === 'manual' && 'Manual Creation'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Toggle Preview */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="lg:hidden px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isGenerating}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 font-semibold shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left: Editor Form */}
        <div className={`${showPreview ? 'w-full lg:w-1/2' : 'w-full'} overflow-y-auto`}>
          <div className="p-6">
            {renderEditor()}
          </div>
        </div>

        {/* Right: Live Preview */}
        {showPreview && (
          <div className="hidden lg:block w-1/2 overflow-y-auto bg-slate-800 border-l border-slate-700">
            <div className="p-6">
              <CVPreview cvData={cvData} templateId={templateId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

