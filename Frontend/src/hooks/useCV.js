import { useState } from 'react';
import * as cvApi from '../api/cv';
import toast from 'react-hot-toast';

/**
 * Custom hook for CV operations
 */
export function useCV() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create new CV
  const createCV = async (cvData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cvApi.createCV(cvData);
      toast.success('CV created successfully!');
      return result;
    } catch (err) {
      setError(err.message || 'Failed to create CV');
      toast.error(err.message || 'Failed to create CV');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing CV
  const updateCV = async (cvId, cvData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cvApi.updateCV(cvId, cvData);
      toast.success('CV updated successfully!');
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update CV');
      toast.error(err.message || 'Failed to update CV');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get CV by ID
  const getCVById = async (cvId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cvApi.getCVById(cvId);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to load CV');
      toast.error(err.message || 'Failed to load CV');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get all user CVs
  const getUserCVs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await cvApi.getUserCVs();
      return result;
    } catch (err) {
      setError(err.message || 'Failed to load CVs');
      toast.error(err.message || 'Failed to load CVs');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete CV
  const deleteCV = async (cvId) => {
    setLoading(true);
    setError(null);
    try {
      await cvApi.deleteCV(cvId);
      toast.success('CV deleted successfully!');
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete CV');
      toast.error(err.message || 'Failed to delete CV');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Rename CV
  const renameCV = async (cvId, newTitle) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cvApi.renameCV(cvId, newTitle);
      toast.success('CV renamed successfully!');
      return result;
    } catch (err) {
      setError(err.message || 'Failed to rename CV');
      toast.error(err.message || 'Failed to rename CV');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Generate CV with AI
  const generateCVWithAI = async (aiRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cvApi.generateCVWithAI(aiRequest);
      toast.success('CV generated with AI!');
      return result;
    } catch (err) {
      setError(err.message || 'Failed to generate CV');
      toast.error(err.message || 'Failed to generate CV');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Import from resume
  const importFromResume = async (resumeId, templateId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cvApi.importCVFromResume(resumeId, templateId);
      toast.success('Resume imported successfully!');
      return result;
    } catch (err) {
      setError(err.message || 'Failed to import resume');
      toast.error(err.message || 'Failed to import resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create from tailored resume
  const createFromTailoredResume = async (tailoredRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cvApi.createCVFromTailoredResume(tailoredRequest);
      toast.success('CV created from tailored resume!');
      return result;
    } catch (err) {
      setError(err.message || 'Failed to create CV from tailored resume');
      toast.error(err.message || 'Failed to create CV from tailored resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF
  const generatePDF = async (cvId) => {
    setLoading(true);
    setError(null);
    try {
      const s3Url = await cvApi.generatePDF(cvId);
      toast.success('PDF generated successfully!');
      return s3Url;
    } catch (err) {
      setError(err.message || 'Failed to generate PDF');
      toast.error(err.message || 'Failed to generate PDF');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const downloadPDF = async (cvId, filename) => {
    setLoading(true);
    setError(null);
    try {
      await cvApi.downloadPDF(cvId, filename);
      toast.success('PDF downloaded successfully!');
      return true;
    } catch (err) {
      setError(err.message || 'Failed to download PDF');
      toast.error(err.message || 'Failed to download PDF');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createCV,
    updateCV,
    getCVById,
    getUserCVs,
    deleteCV,
    renameCV,
    generateCVWithAI,
    importFromResume,
    createFromTailoredResume,
    generatePDF,
    downloadPDF
  };
}

