import React from 'react';
import { formatCVDate } from '../../../utils/cvDataStructure';

export default function EUSwissTemplate({ data }) {
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
    <div className="cv-eu-swiss-template bg-white shadow-lg mx-auto" style={{ 
      width: '210mm', // A4 width
      minHeight: '297mm', // A4 height
      padding: '15mm',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '10pt',
      lineHeight: '1.4',
      color: '#000000'
    }}>
      
      {/* Header with Photo */}
      <header className="flex gap-6 mb-6 pb-4 border-b-2 border-gray-300">
        {/* Left: Personal Info */}
        <div className="flex-1">
          <h1 className="font-bold mb-3" style={{ fontSize: '24pt', color: '#1a1a1a' }}>
            {personalInfo.fullName || 'YOUR NAME'}
          </h1>
          
          <div className="space-y-1" style={{ fontSize: '10pt', color: '#333' }}>
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Email:</span>
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Phone:</span>
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Address:</span>
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.dateOfBirth && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Date of Birth:</span>
                <span>{personalInfo.dateOfBirth}</span>
              </div>
            )}
            {personalInfo.nationality && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Nationality:</span>
                <span>{personalInfo.nationality}</span>
              </div>
            )}
            {personalInfo.residenceStatus && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Residence Status:</span>
                <span>{personalInfo.residenceStatus}</span>
              </div>
            )}
          </div>
          
          {/* Links */}
          {(personalInfo.linkedin || personalInfo.github || personalInfo.website) && (
            <div className="mt-3 space-y-1" style={{ fontSize: '9pt', color: '#0066cc' }}>
              {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
              {personalInfo.github && <div>{personalInfo.github}</div>}
              {personalInfo.website && <div>{personalInfo.website}</div>}
            </div>
          )}
        </div>
        
        {/* Right: Photo */}
        <div className="flex-shrink-0">
          {personalInfo.photoUrl ? (
            <img 
              src={personalInfo.photoUrl} 
              alt={personalInfo.fullName}
              className="object-cover"
              style={{ 
                width: '35mm',
                height: '45mm',
                border: '1px solid #ddd'
              }}
            />
          ) : (
            <div 
              className="flex items-center justify-center bg-gray-100 border border-gray-300"
              style={{ 
                width: '35mm',
                height: '45mm',
                fontSize: '8pt',
                color: '#999'
              }}
            >
              <div className="text-center">
                <div>Photo</div>
                <div className="text-xs">(35mm × 45mm)</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Profile/Summary Section */}
      {summary && (
        <section className="mb-5">
          <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-400" style={{ fontSize: '12pt', color: '#1a1a1a' }}>
            Profile
          </h2>
          <p className="text-justify leading-relaxed" style={{ fontSize: '10pt' }}>
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
    <section className="mb-5">
      <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-400" style={{ fontSize: '12pt', color: '#1a1a1a' }}>
        {section.title}
      </h2>
      {section.data.items.map((exp, index) => (
        <div key={exp.id} className={index > 0 ? 'mt-3' : ''}>
          <div className="flex justify-between items-start mb-1">
            <div className="flex-1">
              <h3 className="font-bold" style={{ fontSize: '11pt' }}>
                {exp.role || 'Job Title'}
              </h3>
              <div className="italic" style={{ fontSize: '10pt', color: '#444' }}>
                {exp.company || 'Company Name'}{exp.location && `, ${exp.location}`}
              </div>
            </div>
            <div className="text-right" style={{ fontSize: '9pt', color: '#555' }}>
              {formatCVDate(exp.startDate)} - {exp.current ? 'Present' : formatCVDate(exp.endDate)}
            </div>
          </div>
          {exp.description && (
            <p className="mt-1" style={{ fontSize: '10pt' }}>{exp.description}</p>
          )}
          {exp.achievements && exp.achievements.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {exp.achievements.map((achievement, idx) => (
                <li key={idx} className="flex" style={{ fontSize: '10pt' }}>
                  <span className="mr-2">-</span>
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
    <section className="mb-5">
      <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-400" style={{ fontSize: '12pt', color: '#1a1a1a' }}>
        {section.title}
      </h2>
      {section.data.items.map((edu, index) => (
        <div key={edu.id} className={index > 0 ? 'mt-3' : ''}>
          <div className="flex justify-between items-start mb-1">
            <div className="flex-1">
              <h3 className="font-bold" style={{ fontSize: '11pt' }}>
                {edu.degree} {edu.field && `in ${edu.field}`}
              </h3>
              <div className="italic" style={{ fontSize: '10pt', color: '#444' }}>
                {edu.school || 'Institution'}{edu.location && `, ${edu.location}`}
              </div>
            </div>
            <div className="text-right" style={{ fontSize: '9pt', color: '#555' }}>
              {formatCVDate(edu.startDate)} - {formatCVDate(edu.endDate)}
            </div>
          </div>
          {edu.gpa && (
            <div style={{ fontSize: '10pt' }}>
              <strong>GPA:</strong> {edu.gpa}
            </div>
          )}
          {edu.achievements && edu.achievements.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {edu.achievements.map((achievement, idx) => (
                <li key={idx} className="flex" style={{ fontSize: '10pt' }}>
                  <span className="mr-2">-</span>
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
    <section className="mb-5">
      <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-400" style={{ fontSize: '12pt', color: '#1a1a1a' }}>
        {section.title}
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {section.data.items.map(skill => (
          <div key={skill.id} style={{ fontSize: '10pt' }}>
            <strong>{skill.name}</strong>{skill.level && ` - ${skill.level}`}
          </div>
        ))}
      </div>
    </section>
  );
}

// Projects Section Component
function ProjectsSection({ section }) {
  return (
    <section className="mb-5">
      <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-400" style={{ fontSize: '12pt', color: '#1a1a1a' }}>
        {section.title}
      </h2>
      {section.data.items.map((project, index) => (
        <div key={project.id} className={index > 0 ? 'mt-3' : ''}>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold" style={{ fontSize: '11pt' }}>
              {project.name || 'Project Name'}
            </h3>
            {(project.startDate || project.endDate) && (
              <span style={{ fontSize: '9pt', color: '#555' }}>
                {formatCVDate(project.startDate)} {project.endDate && `- ${formatCVDate(project.endDate)}`}
              </span>
            )}
          </div>
          {project.description && (
            <p style={{ fontSize: '10pt' }}>{project.description}</p>
          )}
          {project.technologies && project.technologies.length > 0 && (
            <div style={{ fontSize: '9pt', color: '#555', marginTop: '4px' }}>
              <strong>Technologies:</strong> {project.technologies.join(', ')}
            </div>
          )}
          {project.link && (
            <div style={{ fontSize: '9pt', color: '#0066cc' }}>{project.link}</div>
          )}
        </div>
      ))}
    </section>
  );
}

// Certifications Section Component
function CertificationsSection({ section }) {
  return (
    <section className="mb-5">
      <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-400" style={{ fontSize: '12pt', color: '#1a1a1a' }}>
        {section.title}
      </h2>
      {section.data.items.map((cert, index) => (
        <div key={cert.id} className={index > 0 ? 'mt-2' : ''}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold" style={{ fontSize: '10pt' }}>
                {cert.name || 'Certification Name'}
              </h3>
              <div style={{ fontSize: '10pt', color: '#444' }}>
                {cert.issuer}
              </div>
            </div>
            <span style={{ fontSize: '9pt', color: '#555' }}>
              {formatCVDate(cert.date)}
            </span>
          </div>
          {cert.credentialId && (
            <div style={{ fontSize: '9pt', color: '#555' }}>
              ID: {cert.credentialId}
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
    <section className="mb-5">
      <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-400" style={{ fontSize: '12pt', color: '#1a1a1a' }}>
        {section.title}
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {section.data.items.map(lang => (
          <div key={lang.id} style={{ fontSize: '10pt' }}>
            <strong>{lang.language}</strong> {lang.proficiency && `- ${lang.proficiency}`}
          </div>
        ))}
      </div>
    </section>
  );
}

// Volunteer Section Component
function VolunteerSection({ section }) {
  return (
    <section className="mb-5">
      <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-400" style={{ fontSize: '12pt', color: '#1a1a1a' }}>
        {section.title}
      </h2>
      {section.data.items.map((vol, index) => (
        <div key={vol.id} className={index > 0 ? 'mt-3' : ''}>
          <div className="flex justify-between items-start mb-1">
            <div className="flex-1">
              <h3 className="font-bold" style={{ fontSize: '11pt' }}>
                {vol.role || 'Role'}
              </h3>
              <div className="italic" style={{ fontSize: '10pt', color: '#444' }}>
                {vol.organization || 'Organization'}
              </div>
            </div>
            <div className="text-right" style={{ fontSize: '9pt', color: '#555' }}>
              {formatCVDate(vol.startDate)} - {formatCVDate(vol.endDate)}
            </div>
          </div>
          {vol.description && (
            <p style={{ fontSize: '10pt' }}>{vol.description}</p>
          )}
        </div>
      ))}
    </section>
  );
}

// Publications Section Component
function PublicationsSection({ section }) {
  return (
    <section className="mb-5">
      <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-400" style={{ fontSize: '12pt', color: '#1a1a1a' }}>
        {section.title}
      </h2>
      {section.data.items.map((pub, index) => (
        <div key={pub.id} className={index > 0 ? 'mt-2' : ''}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold" style={{ fontSize: '10pt' }}>
                {pub.title || 'Publication Title'}
              </h3>
              <div style={{ fontSize: '10pt', color: '#444' }}>
                {pub.publisher}
              </div>
            </div>
            <span style={{ fontSize: '9pt', color: '#555' }}>
              {formatCVDate(pub.date)}
            </span>
          </div>
          {pub.link && (
            <div style={{ fontSize: '9pt', color: '#0066cc' }}>{pub.link}</div>
          )}
        </div>
      ))}
    </section>
  );
}

// Awards Section Component
function AwardsSection({ section }) {
  return (
    <section className="mb-5">
      <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-400" style={{ fontSize: '12pt', color: '#1a1a1a' }}>
        {section.title}
      </h2>
      {section.data.items.map((award, index) => (
        <div key={award.id} className={index > 0 ? 'mt-2' : ''}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold" style={{ fontSize: '10pt' }}>
                {award.title || 'Award Title'}
              </h3>
              <div style={{ fontSize: '10pt', color: '#444' }}>
                {award.issuer}
              </div>
            </div>
            <span style={{ fontSize: '9pt', color: '#555' }}>
              {formatCVDate(award.date)}
            </span>
          </div>
          {award.description && (
            <p style={{ fontSize: '10pt' }}>{award.description}</p>
          )}
        </div>
      ))}
    </section>
  );
}

// Custom Section Component
function CustomSection({ section }) {
  return (
    <section className="mb-5">
      <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-400" style={{ fontSize: '12pt', color: '#1a1a1a' }}>
        {section.title}
      </h2>
      {section.data.content && (
        <div style={{ fontSize: '10pt' }} dangerouslySetInnerHTML={{ __html: section.data.content }} />
      )}
      {section.data.items && section.data.items.length > 0 && (
        <ul className="space-y-0.5">
          {section.data.items.map((item, idx) => (
            <li key={idx} className="flex" style={{ fontSize: '10pt' }}>
              <span className="mr-2">-</span>
              <span>{item.text || item.description || JSON.stringify(item)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

