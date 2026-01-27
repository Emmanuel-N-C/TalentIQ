import React from 'react';
import { getTemplateById } from './templateRegistry';

/**
 * CV Renderer - Routes to the correct template component based on templateId
 * @param {Object} data - CV data structure
 * @param {string} templateId - Template identifier ('ats-friendly', 'eu-swiss', etc.)
 */
export default function CVRenderer({ data, templateId }) {
  const template = getTemplateById(templateId || data.templateId);
  
  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-600">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Template Not Found</h2>
          <p>The template &quot;{templateId || data.templateId}&quot; does not exist.</p>
        </div>
      </div>
    );
  }

  const TemplateComponent = template.component;
  
  return <TemplateComponent data={data} />;
}

