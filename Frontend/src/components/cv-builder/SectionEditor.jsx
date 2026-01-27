import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { addItemToSection, removeItemFromSection, updateItemInSection } from '../../utils/cvDataStructure';

/**
 * Section Editor Component
 * Renders appropriate editor based on section type
 */
export default function SectionEditor({ section, onSectionChange }) {
  const handleTitleChange = (title) => {
    onSectionChange({ title });
  };

  const handleAddItem = () => {
    const updated = addItemToSection(section);
    onSectionChange({ data: updated.data });
  };

  const handleRemoveItem = (itemId) => {
    const updated = removeItemFromSection(section, itemId);
    onSectionChange({ data: updated.data });
  };

  const handleItemChange = (itemId, updates) => {
    const updated = updateItemInSection(section, itemId, updates);
    onSectionChange({ data: updated.data });
  };

  // Render editor based on section type
  switch (section.type) {
    case 'experience':
      return <ExperienceEditor section={section} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} onItemChange={handleItemChange} onTitleChange={handleTitleChange} />;
    case 'education':
      return <EducationEditor section={section} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} onItemChange={handleItemChange} onTitleChange={handleTitleChange} />;
    case 'skills':
      return <SkillsEditor section={section} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} onItemChange={handleItemChange} onTitleChange={handleTitleChange} />;
    case 'projects':
      return <ProjectsEditor section={section} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} onItemChange={handleItemChange} onTitleChange={handleTitleChange} />;
    case 'certifications':
      return <CertificationsEditor section={section} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} onItemChange={handleItemChange} onTitleChange={handleTitleChange} />;
    case 'languages':
      return <LanguagesEditor section={section} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} onItemChange={handleItemChange} onTitleChange={handleTitleChange} />;
    default:
      return <GenericEditor section={section} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} onItemChange={handleItemChange} onTitleChange={handleTitleChange} />;
  }
}

// Experience Section Editor
function ExperienceEditor({ section, onAddItem, onRemoveItem, onItemChange, onTitleChange }) {
  return (
    <div className="space-y-6">
      {/* Section Title */}
      <input
        type="text"
        value={section.title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-semibold"
        placeholder="Section Title"
      />

      {section.data.items.map((item, index) => (
        <div key={item.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-slate-400">Experience #{index + 1}</h4>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={item.company}
              onChange={(e) => onItemChange(item.id, { company: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              placeholder="Company Name"
            />
            <input
              type="text"
              value={item.role}
              onChange={(e) => onItemChange(item.id, { role: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              placeholder="Job Title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={item.location}
              onChange={(e) => onItemChange(item.id, { location: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              placeholder="Location"
            />
            <input
              type="month"
              value={item.startDate}
              onChange={(e) => onItemChange(item.id, { startDate: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
            />
            <input
              type="month"
              value={item.endDate}
              onChange={(e) => onItemChange(item.id, { endDate: e.target.value })}
              disabled={item.current}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm disabled:opacity-50"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={item.current}
              onChange={(e) => onItemChange(item.id, { current: e.target.checked })}
              className="rounded"
            />
            Currently working here
          </label>

          <textarea
            value={item.description}
            onChange={(e) => onItemChange(item.id, { description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm resize-none"
            rows="2"
            placeholder="Brief description..."
          />

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Achievements (one per line)</label>
            <textarea
              value={item.achievements?.join('\n') || ''}
              onChange={(e) => onItemChange(item.id, { achievements: e.target.value.split('\n').filter(a => a.trim()) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm resize-none"
              rows="3"
              placeholder="• Increased sales by 40%&#10;• Led team of 5 developers"
            />
          </div>
        </div>
      ))}

      <button
        onClick={onAddItem}
        className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Experience
      </button>
    </div>
  );
}

// Education Section Editor
function EducationEditor({ section, onAddItem, onRemoveItem, onItemChange, onTitleChange }) {
  return (
    <div className="space-y-6">
      <input
        type="text"
        value={section.title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-semibold"
        placeholder="Section Title"
      />

      {section.data.items.map((item, index) => (
        <div key={item.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-slate-400">Education #{index + 1}</h4>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>

          <input
            type="text"
            value={item.school}
            onChange={(e) => onItemChange(item.id, { school: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
            placeholder="School/University Name"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={item.degree}
              onChange={(e) => onItemChange(item.id, { degree: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              placeholder="Degree (e.g., Bachelor of Science)"
            />
            <input
              type="text"
              value={item.field}
              onChange={(e) => onItemChange(item.id, { field: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              placeholder="Field of Study"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={item.location}
              onChange={(e) => onItemChange(item.id, { location: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              placeholder="Location"
            />
            <input
              type="month"
              value={item.startDate}
              onChange={(e) => onItemChange(item.id, { startDate: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
            />
            <input
              type="month"
              value={item.endDate}
              onChange={(e) => onItemChange(item.id, { endDate: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
            />
          </div>

          <input
            type="text"
            value={item.gpa}
            onChange={(e) => onItemChange(item.id, { gpa: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
            placeholder="GPA (optional)"
          />
        </div>
      ))}

      <button
        onClick={onAddItem}
        className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Education
      </button>
    </div>
  );
}

// Skills Section Editor
function SkillsEditor({ section, onAddItem, onRemoveItem, onItemChange, onTitleChange }) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={section.title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-semibold"
        placeholder="Section Title"
      />

      <div className="space-y-2">
        {section.data.items.map((item) => (
          <div key={item.id} className="flex gap-2">
            <input
              type="text"
              value={item.name}
              onChange={(e) => onItemChange(item.id, { name: e.target.value })}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              placeholder="Skill name"
            />
            <input
              type="text"
              value={item.level}
              onChange={(e) => onItemChange(item.id, { level: e.target.value })}
              className="w-32 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              placeholder="Level"
            />
            <button
              onClick={() => onRemoveItem(item.id)}
              className="p-2 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onAddItem}
        className="w-full py-2 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" />
        Add Skill
      </button>
    </div>
  );
}

// Projects Section Editor
function ProjectsEditor({ section, onAddItem, onRemoveItem, onItemChange, onTitleChange }) {
  return (
    <div className="space-y-6">
      <input
        type="text"
        value={section.title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-semibold"
        placeholder="Section Title"
      />

      {section.data.items.map((item, index) => (
        <div key={item.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-slate-400">Project #{index + 1}</h4>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>

          <input
            type="text"
            value={item.name}
            onChange={(e) => onItemChange(item.id, { name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
            placeholder="Project Name"
          />

          <textarea
            value={item.description}
            onChange={(e) => onItemChange(item.id, { description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm resize-none"
            rows="3"
            placeholder="Project description..."
          />

          <input
            type="text"
            value={item.technologies?.join(', ') || ''}
            onChange={(e) => onItemChange(item.id, { technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
            placeholder="Technologies (comma separated)"
          />

          <input
            type="url"
            value={item.link}
            onChange={(e) => onItemChange(item.id, { link: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
            placeholder="Project link (optional)"
          />
        </div>
      ))}

      <button
        onClick={onAddItem}
        className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Project
      </button>
    </div>
  );
}

// Certifications Section Editor
function CertificationsEditor({ section, onAddItem, onRemoveItem, onItemChange, onTitleChange }) {
  return (
    <div className="space-y-6">
      <input
        type="text"
        value={section.title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-semibold"
        placeholder="Section Title"
      />

      {section.data.items.map((item, index) => (
        <div key={item.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-slate-400">Certification #{index + 1}</h4>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>

          <input
            type="text"
            value={item.name}
            onChange={(e) => onItemChange(item.id, { name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
            placeholder="Certification Name"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={item.issuer}
              onChange={(e) => onItemChange(item.id, { issuer: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              placeholder="Issuing Organization"
            />
            <input
              type="month"
              value={item.date}
              onChange={(e) => onItemChange(item.id, { date: e.target.value })}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
            />
          </div>

          <input
            type="text"
            value={item.credentialId}
            onChange={(e) => onItemChange(item.id, { credentialId: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
            placeholder="Credential ID (optional)"
          />
        </div>
      ))}

      <button
        onClick={onAddItem}
        className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Certification
      </button>
    </div>
  );
}

// Languages Section Editor
function LanguagesEditor({ section, onAddItem, onRemoveItem, onItemChange, onTitleChange }) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={section.title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-semibold"
        placeholder="Section Title"
      />

      <div className="space-y-2">
        {section.data.items.map((item) => (
          <div key={item.id} className="flex gap-2">
            <input
              type="text"
              value={item.language}
              onChange={(e) => onItemChange(item.id, { language: e.target.value })}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              placeholder="Language"
            />
            <input
              type="text"
              value={item.proficiency}
              onChange={(e) => onItemChange(item.id, { proficiency: e.target.value })}
              className="w-40 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
              placeholder="Proficiency"
            />
            <button
              onClick={() => onRemoveItem(item.id)}
              className="p-2 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onAddItem}
        className="w-full py-2 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" />
        Add Language
      </button>
    </div>
  );
}

// Generic Editor for unknown section types
function GenericEditor({ section, onAddItem, onRemoveItem, onItemChange, onTitleChange }) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={section.title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-semibold"
        placeholder="Section Title"
      />
      <p className="text-slate-400 text-sm">
        Generic section editor. Add custom content here.
      </p>
    </div>
  );
}

