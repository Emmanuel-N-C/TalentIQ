// CV Template Registry

import ATSTemplate from './ATSTemplate';
import EUSwissTemplate from './EUSwissTemplate';

export const CV_TEMPLATES = {
  'ats-friendly': {
    id: 'ats-friendly',
    name: 'ATS-Friendly',
    description: 'Clean, minimal, optimized for applicant tracking systems',
    category: 'simple',
    thumbnail: '/assets/templates/ats-friendly-thumb.png', 
    component: ATSTemplate,
    features: ['No photo', 'Single column', 'ATS-optimized', 'Clean formatting'],
    requiredFields: [],
    optionalFields: ['linkedin', 'github', 'website'],
    pageSize: 'letter', // 8.5 x 11 inches
    margins: { top: 0.75, right: 0.75, bottom: 0.75, left: 0.75 },
    recommendedFor: ['Corporate', 'Traditional industries', 'Large companies']
  },
  
  'eu-swiss': {
    id: 'eu-swiss',
    name: 'EU/Swiss Professional',
    description: 'Professional format with photo, common in Europe and Switzerland',
    category: 'modern',
    thumbnail: '/assets/templates/eu-swiss-thumb.webp',
    component: EUSwissTemplate,
    features: ['Photo included', 'Formal structure', 'Personal details', 'European standard'],
    requiredFields: ['photoUrl', 'nationality'],
    optionalFields: ['dateOfBirth', 'residenceStatus'],
    pageSize: 'a4', // European standard
    margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
    recommendedFor: ['European companies', 'Swiss companies', 'Formal applications']
  }
};

// Get template by ID
export const getTemplateById = (templateId) => {
  return CV_TEMPLATES[templateId] || CV_TEMPLATES['ats-friendly'];
};

// Get all templates
export const getAllTemplates = () => {
  return Object.values(CV_TEMPLATES);
};

// Get templates by category
export const getTemplatesByCategory = (category) => {
  if (category === 'all') {
    return Object.values(CV_TEMPLATES);
  }
  return Object.values(CV_TEMPLATES).filter(t => t.category === category);
};

// Template categories
export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: '📄' },
  { id: 'simple', name: 'Simple', icon: '📋' },
  { id: 'modern', name: 'Modern', icon: '✨' },
  { id: 'creative', name: 'Creative', icon: '🎨' }
];

// Get template recommendation based on job description
export const getTemplateRecommendation = (jobDescription) => {
  if (!jobDescription) return 'ats-friendly';
  
  const jdLower = jobDescription.toLowerCase();
  
  // Keywords suggesting EU/Swiss template
  const europeanKeywords = ['europe', 'european', 'switzerland', 'swiss', 'germany', 'german', 'france', 'french'];
  const hasEuropeanContext = europeanKeywords.some(keyword => jdLower.includes(keyword));
  
  if (hasEuropeanContext) {
    return 'eu-swiss';
  }
  
  // Default to ATS-friendly for most cases
  return 'ats-friendly';
};

