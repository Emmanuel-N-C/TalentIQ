// CV Data Structure and Helpers

// Create empty CV data structure
export const createEmptyCVData = (templateId = 'ats-friendly') => ({
  id: null,
  userId: null,
  title: 'Untitled CV',
  templateId: templateId,
  sourceType: 'manual', // 'manual' | 'ai-generated' | 'imported' | 'optimizer'
  sourceResumeId: null,
  jobDescriptionId: null,
  createdAt: null,
  updatedAt: null,
  
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    // EU/Swiss specific
    photoUrl: '',
    dateOfBirth: '',
    nationality: '',
    residenceStatus: ''
  },
  
  summary: '',
  
  sections: [
    {
      id: crypto.randomUUID(),
      type: 'experience',
      title: 'Work Experience',
      order: 1,
      visible: true,
      data: {
        items: [
          {
            id: crypto.randomUUID(),
            company: '',
            role: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
            achievements: []
          }
        ]
      }
    },
    {
      id: crypto.randomUUID(),
      type: 'education',
      title: 'Education',
      order: 2,
      visible: true,
      data: {
        items: [
          {
            id: crypto.randomUUID(),
            school: '',
            degree: '',
            field: '',
            location: '',
            startDate: '',
            endDate: '',
            gpa: '',
            achievements: []
          }
        ]
      }
    },
    {
      id: crypto.randomUUID(),
      type: 'skills',
      title: 'Skills',
      order: 3,
      visible: true,
      data: {
        items: [
          { id: crypto.randomUUID(), name: '', level: '' }
        ]
      }
    }
  ]
});

// Section types available
export const SECTION_TYPES = {
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  SKILLS: 'skills',
  PROJECTS: 'projects',
  CERTIFICATIONS: 'certifications',
  LANGUAGES: 'languages',
  VOLUNTEER: 'volunteer',
  PUBLICATIONS: 'publications',
  AWARDS: 'awards',
  CUSTOM: 'custom'
};

// Create new section
export const createNewSection = (type, order) => ({
  id: crypto.randomUUID(),
  type: type,
  title: getSectionDefaultTitle(type),
  order: order,
  visible: true,
  data: getSectionDefaultData(type)
});

// Helper functions
const getSectionDefaultTitle = (type) => {
  const titles = {
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    languages: 'Languages',
    volunteer: 'Volunteer Experience',
    publications: 'Publications',
    awards: 'Awards',
    custom: 'Custom Section'
  };
  return titles[type] || 'New Section';
};

const getSectionDefaultData = (type) => {
  // Return appropriate structure based on type
  switch(type) {
    case 'experience':
      return { 
        items: [{ 
          id: crypto.randomUUID(), 
          company: '', 
          role: '', 
          location: '',
          startDate: '', 
          endDate: '', 
          current: false,
          description: '', 
          achievements: [] 
        }] 
      };
    case 'education':
      return { 
        items: [{ 
          id: crypto.randomUUID(), 
          school: '', 
          degree: '', 
          field: '',
          location: '', 
          startDate: '', 
          endDate: '',
          gpa: '', 
          achievements: [] 
        }] 
      };
    case 'skills':
      return { 
        items: [{ id: crypto.randomUUID(), name: '', level: '' }] 
      };
    case 'projects':
      return { 
        items: [{ 
          id: crypto.randomUUID(), 
          name: '', 
          description: '', 
          technologies: [], 
          link: '',
          startDate: '',
          endDate: '' 
        }] 
      };
    case 'certifications':
      return { 
        items: [{ 
          id: crypto.randomUUID(), 
          name: '', 
          issuer: '', 
          date: '', 
          credentialId: '',
          link: '' 
        }] 
      };
    case 'languages':
      return { 
        items: [{ 
          id: crypto.randomUUID(), 
          language: '', 
          proficiency: '' 
        }] 
      };
    case 'volunteer':
      return { 
        items: [{ 
          id: crypto.randomUUID(), 
          organization: '', 
          role: '', 
          startDate: '', 
          endDate: '',
          description: '' 
        }] 
      };
    case 'publications':
      return { 
        items: [{ 
          id: crypto.randomUUID(), 
          title: '', 
          publisher: '', 
          date: '', 
          link: '' 
        }] 
      };
    case 'awards':
      return { 
        items: [{ 
          id: crypto.randomUUID(), 
          title: '', 
          issuer: '', 
          date: '', 
          description: '' 
        }] 
      };
    case 'custom':
      return { 
        content: '',
        items: [] 
      };
    default:
      return { items: [] };
  }
};

// Add item to section
export const addItemToSection = (section) => {
  const newItem = getSectionDefaultData(section.type).items[0];
  return {
    ...section,
    data: {
      ...section.data,
      items: [...section.data.items, newItem]
    }
  };
};

// Remove item from section
export const removeItemFromSection = (section, itemId) => {
  return {
    ...section,
    data: {
      ...section.data,
      items: section.data.items.filter(item => item.id !== itemId)
    }
  };
};

// Update item in section
export const updateItemInSection = (section, itemId, updates) => {
  return {
    ...section,
    data: {
      ...section.data,
      items: section.data.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    }
  };
};

// Reorder sections
export const reorderSections = (sections, startIndex, endIndex) => {
  const result = Array.from(sections);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  
  // Update order property
  return result.map((section, index) => ({
    ...section,
    order: index + 1
  }));
};

// Validate CV data
export const validateCVData = (data, templateId) => {
  const errors = [];
  
  // Check required personal info
  if (!data.personalInfo.fullName?.trim()) {
    errors.push('Full name is required');
  }
  if (!data.personalInfo.email?.trim()) {
    errors.push('Email is required');
  }
  
  // Template-specific validation
  if (templateId === 'eu-swiss') {
    if (!data.personalInfo.nationality?.trim()) {
      errors.push('Nationality is required for EU/Swiss template');
    }
    if (!data.personalInfo.photoUrl?.trim()) {
      errors.push('Photo is required for EU/Swiss template');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format date for display
export const formatCVDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short' };
  return date.toLocaleDateString('en-US', options);
};

