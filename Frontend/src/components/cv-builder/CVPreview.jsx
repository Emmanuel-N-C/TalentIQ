import React from 'react';
import CVRenderer from './templates/CVRenderer';

/**
 * CV Preview Component
 * Displays live preview of the CV as user edits
 */
export default function CVPreview({ cvData, templateId }) {
  return (
    <div className="cv-preview-container">
      {/* Preview Label */}
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-white mb-1">Live Preview</h3>
        <p className="text-sm text-slate-400">Updates as you type</p>
      </div>

      {/* CV Preview - Scaled down for screen viewing */}
      <div className="bg-gray-200 p-6 rounded-lg shadow-2xl" style={{ 
        transformOrigin: 'top center'
      }}>
        <div style={{ 
          transform: 'scale(0.7)', 
          transformOrigin: 'top center',
          marginBottom: '-30%' // Adjust for scale
        }}>
          <CVRenderer data={cvData} templateId={templateId} />
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-6 text-center text-sm text-slate-500">
        <p>This is a preview. The downloaded PDF will be full quality.</p>
      </div>
    </div>
  );
}

