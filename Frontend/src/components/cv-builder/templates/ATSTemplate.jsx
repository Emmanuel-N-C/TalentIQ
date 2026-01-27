import React from 'react';
import { formatCVDate } from '../../../utils/cvDataStructure';

export default function ATSTemplate({ data }) {
  const { personalInfo, summary, sections } = data;

  // Helper to render sections dynamically
  const renderSection = (section) => {
    if (!section.visible) return null;

    switch (section.type) {
      case 'experience':
        return <ExperienceSection key={section.id} section={section} />;
      case 'education':
        return <EducationSection key={section.id} section={section} />;
      case 'skills':
        return <SkillsSection key={section.id} section={section} />;
      case 'projects':
        return <ProjectsSection key={section.id} section={section} />;
      case 'certifications':
        return <CertificationsSection key={section.id} section={section} />;
      case 'languages':
        return <LanguagesSection key={section.id} section={section} />;
      case 'volunteer':
        return <VolunteerSection key={section.id} section={section} />;
      case 'publications':
        return <PublicationsSection key={section.id} section={section} />;
      case 'awards':
        return <AwardsSection key={section.id} section={section} />;
      default:
        return <CustomSection key={section.id} section={section} />;
    }
  };

  return (
    <div className="cv-ats-template bg-white shadow-lg mx-auto" style={{ 
      width: '8.5in', 
      minHeight: '11in',
      padding: '0.75in',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.4',
      color: '#000000'
    }}>
      
      {/* Header - Name & Contact */}
      <header className="text-center border-b-2 border-gray-800 pb-3 mb-4">
        <h1 className="font-bold tracking-wide mb-2" style={{ fontSize: '26pt', letterSpacing: '0.5px' }}>
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        <div className="flex justify-center flex-wrap gap-3" style={{ fontSize: '10pt', color: '#333' }}>
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.email && <span>•</span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>•</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.linkedin && <span>•</span>}
          {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo.github && <span>•</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
        </div>
      </header>

      {/* Summary Section */}
      {summary && (
        <section className="mb-4">
          <h2 className="font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1" style={{ fontSize: '13pt' }}>
            Professional Summary
          </h2>
          <p className="text-justify leading-relaxed" style={{ fontSize: '11pt' }}>
            {summary}
          </p>
        </section>
      )}

      {/* Dynamic Sections */}
      {sections
        .filter(s => s.visible)
        .sort((a, b) => a.order - b.order)
        .map(section => renderSection(section))
      }
    </div>
  );
}

// Experience Section Component
function ExperienceSection({ section }) {
  return (
    <section className="mb-4">
      <h2 className="font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1" style={{ fontSize: '13pt' }}>
        {section.title}
      </h2>
      {section.data.items.map(exp => (
        <div key={exp.id} className="mb-3">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold" style={{ fontSize: '12pt' }}>
              {exp.company || 'Company Name'}
            </h3>
            <span style={{ fontSize: '10pt', color: '#555' }}>
              {formatCVDate(exp.startDate)} - {exp.current ? 'Present' : formatCVDate(exp.endDate)}
            </span>
          </div>
          <div className="italic" style={{ fontSize: '11pt', color: '#444' }}>
            {exp.role || 'Job Title'} {exp.location && `| ${exp.location}`}
          </div>
          {exp.description && (
            <p className="mt-1" style={{ fontSize: '11pt' }}>{exp.description}</p>
          )}
          {exp.achievements && exp.achievements.length > 0 && (
            <ul className="mt-1 space-y-1">
              {exp.achievements.map((achievement, idx) => (
                <li key={idx} className="flex" style={{ fontSize: '11pt' }}>
                  <span className="mr-2">•</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}

// Education Section Component
function EducationSection({ section }) {
  return (
    <section className="mb-4">
      <h2 className="font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1" style={{ fontSize: '13pt' }}>
        {section.title}
      </h2>
      {section.data.items.map(edu => (
        <div key={edu.id} className="mb-3">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold" style={{ fontSize: '12pt' }}>
              {edu.school || 'Institution Name'}
            </h3>
            <span style={{ fontSize: '10pt', color: '#555' }}>
              {formatCVDate(edu.startDate)} - {formatCVDate(edu.endDate)}
            </span>
          </div>
          <div className="italic" style={{ fontSize: '11pt' }}>
            {edu.degree} {edu.field && `in ${edu.field}`}
          </div>
          {edu.location && <div style={{ fontSize: '10pt', color: '#555' }}>{edu.location}</div>}
          {edu.gpa && <div style={{ fontSize: '11pt' }}>GPA: {edu.gpa}</div>}
          {edu.achievements && edu.achievements.length > 0 && (
            <ul className="mt-1 space-y-1">
              {edu.achievements.map((achievement, idx) => (
                <li key={idx} className="flex" style={{ fontSize: '11pt' }}>
                  <span className="mr-2">•</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}

// Skills Section Component
function SkillsSection({ section }) {
  return (
    <section className="mb-4">
      <h2 className="font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1" style={{ fontSize: '13pt' }}>
        {section.title}
      </h2>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {section.data.items.map(skill => (
          <span key={skill.id} style={{ fontSize: '11pt' }}>
            {skill.name}{skill.level && ` (${skill.level})`}
            {section.data.items[section.data.items.length - 1].id !== skill.id && ','}
          </span>
        ))}
      </div>
    </section>
  );
}

// Projects Section Component
function ProjectsSection({ section }) {
  return (
    <section className="mb-4">
      <h2 className="font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1" style={{ fontSize: '13pt' }}>
        {section.title}
      </h2>
      {section.data.items.map(project => (
        <div key={project.id} className="mb-3">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold" style={{ fontSize: '12pt' }}>
              {project.name || 'Project Name'}
            </h3>
            {(project.startDate || project.endDate) && (
              <span style={{ fontSize: '10pt', color: '#555' }}>
                {formatCVDate(project.startDate)} {project.endDate && `- ${formatCVDate(project.endDate)}`}
              </span>
            )}
          </div>
          {project.description && (
            <p style={{ fontSize: '11pt' }}>{project.description}</p>
          )}
          {project.technologies && project.technologies.length > 0 && (
            <div style={{ fontSize: '10pt', color: '#555', marginTop: '4px' }}>
              <strong>Technologies:</strong> {project.technologies.join(', ')}
            </div>
          )}
          {project.link && (
            <div style={{ fontSize: '10pt', color: '#0066cc' }}>{project.link}</div>
          )}
        </div>
      ))}
    </section>
  );
}

// Certifications Section Component
function CertificationsSection({ section }) {
  return (
    <section className="mb-4">
      <h2 className="font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1" style={{ fontSize: '13pt' }}>
        {section.title}
      </h2>
      {section.data.items.map(cert => (
        <div key={cert.id} className="mb-2">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold" style={{ fontSize: '11pt' }}>
              {cert.name || 'Certification Name'}
            </h3>
            <span style={{ fontSize: '10pt', color: '#555' }}>
              {formatCVDate(cert.date)}
            </span>
          </div>
          <div style={{ fontSize: '11pt', color: '#444' }}>
            {cert.issuer}
          </div>
          {cert.credentialId && (
            <div style={{ fontSize: '10pt', color: '#555' }}>
              Credential ID: {cert.credentialId}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

// Languages Section Component
function LanguagesSection({ section }) {
  return (
    <section className="mb-4">
      <h2 className="font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1" style={{ fontSize: '13pt' }}>
        {section.title}
      </h2>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {section.data.items.map(lang => (
          <span key={lang.id} style={{ fontSize: '11pt' }}>
            {lang.language} {lang.proficiency && `(${lang.proficiency})`}
            {section.data.items[section.data.items.length - 1].id !== lang.id && ','}
          </span>
        ))}
      </div>
    </section>
  );
}

// Volunteer Section Component
function VolunteerSection({ section }) {
  return (
    <section className="mb-4">
      <h2 className="font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1" style={{ fontSize: '13pt' }}>
        {section.title}
      </h2>
      {section.data.items.map(vol => (
        <div key={vol.id} className="mb-3">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold" style={{ fontSize: '12pt' }}>
              {vol.organization || 'Organization'}
            </h3>
            <span style={{ fontSize: '10pt', color: '#555' }}>
              {formatCVDate(vol.startDate)} - {formatCVDate(vol.endDate)}
            </span>
          </div>
          <div className="italic" style={{ fontSize: '11pt' }}>
            {vol.role}
          </div>
          {vol.description && (
            <p style={{ fontSize: '11pt' }}>{vol.description}</p>
          )}
        </div>
      ))}
    </section>
  );
}

// Publications Section Component
function PublicationsSection({ section }) {
  return (
    <section className="mb-4">
      <h2 className="font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1" style={{ fontSize: '13pt' }}>
        {section.title}
      </h2>
      {section.data.items.map(pub => (
        <div key={pub.id} className="mb-2">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold" style={{ fontSize: '11pt' }}>
              {pub.title || 'Publication Title'}
            </h3>
            <span style={{ fontSize: '10pt', color: '#555' }}>
              {formatCVDate(pub.date)}
            </span>
          </div>
          <div style={{ fontSize: '11pt', color: '#444' }}>
            {pub.publisher}
          </div>
          {pub.link && (
            <div style={{ fontSize: '10pt', color: '#0066cc' }}>{pub.link}</div>
          )}
        </div>
      ))}
    </section>
  );
}

// Awards Section Component
function AwardsSection({ section }) {
  return (
    <section className="mb-4">
      <h2 className="font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1" style={{ fontSize: '13pt' }}>
        {section.title}
      </h2>
      {section.data.items.map(award => (
        <div key={award.id} className="mb-2">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold" style={{ fontSize: '11pt' }}>
              {award.title || 'Award Title'}
            </h3>
            <span style={{ fontSize: '10pt', color: '#555' }}>
              {formatCVDate(award.date)}
            </span>
          </div>
          <div style={{ fontSize: '11pt', color: '#444' }}>
            {award.issuer}
          </div>
          {award.description && (
            <p style={{ fontSize: '11pt' }}>{award.description}</p>
          )}
        </div>
      ))}
    </section>
  );
}

// Custom Section Component
function CustomSection({ section }) {
  return (
    <section className="mb-4">
      <h2 className="font-bold uppercase tracking-wider border-b border-gray-400 mb-2 pb-1" style={{ fontSize: '13pt' }}>
        {section.title}
      </h2>
      {section.data.content && (
        <div style={{ fontSize: '11pt' }} dangerouslySetInnerHTML={{ __html: section.data.content }} />
      )}
      {section.data.items && section.data.items.length > 0 && (
        <ul className="space-y-1">
          {section.data.items.map((item, idx) => (
            <li key={idx} className="flex" style={{ fontSize: '11pt' }}>
              <span className="mr-2">•</span>
              <span>{item.text || item.description || JSON.stringify(item)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

