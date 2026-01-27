import React, { useState, useEffect } from 'react';
import { getUserResumes, getResumeText } from '../../api/resumes';
import { FileText, Upload, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Import Selector Component
 * Allows users to import data from existing uploaded resumes
 */
export default function ImportSelector({ cvData, onDataChange, templateId }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await getUserResumes();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
  };

  const handleImport = async () => {
    if (!selectedResume) {
      toast.error('Please select a resume to import');
      return;
    }

    setImporting(true);

    try {
      // Get resume text
      const { extractedText } = await getResumeText(selectedResume.id);

      // TODO: Use AI to parse resume and extract structured data
      // For now, we'll do basic parsing
      
      // Simulate import delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update CV data with imported content
      const updatedData = {
        ...cvData,
        title: `CV - ${selectedResume.filename.replace(/\.[^/.]+$/, '')}`,
        sourceType: 'imported',
        sourceResumeId: selectedResume.id,
        summary: extractedText.substring(0, 300) + '...' // Basic summary extraction
        // TODO: Parse sections from extracted text
      };

      onDataChange(updatedData);
      setImported(true);
      toast.success('Resume imported successfully! Review and edit as needed.');
    } catch (error) {
      console.error('Error importing resume:', error);
      toast.error('Failed to import resume');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-slate-400">Loading your resumes...</p>
      </div>
    );
  }

  if (imported) {
    return (
      <div className="space-y-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">
            Resume imported successfully!
          </h3>
          <p className="text-slate-400 mb-4">
            Your resume data has been imported. Review the preview and make any necessary edits.
          </p>
          <button
            onClick={() => {
              setImported(false);
              setSelectedResume(null);
            }}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Import Another Resume
          </button>
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
          <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            No Resumes Found
          </h3>
          <p className="text-slate-400 mb-6">
            You need to upload a resume first before you can import it.
          </p>
          <a
            href="/jobseeker/resumes"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go to My Resumes
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-green-500 rounded-full p-3">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Import from Existing Resume
            </h3>
            <p className="text-slate-400 text-sm">
              Select one of your uploaded resumes and we&apos;ll extract the data to create your CV.
            </p>
          </div>
        </div>
      </div>

      {/* Resume Selection */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">
          Select Resume to Import
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumes.map(resume => (
            <div
              key={resume.id}
              onClick={() => handleSelectResume(resume)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedResume?.id === resume.id
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <FileText className={`w-10 h-10 flex-shrink-0 ${
                  selectedResume?.id === resume.id ? 'text-green-400' : 'text-slate-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">
                    {resume.filename}
                  </div>
                  <div className="text-sm text-slate-400">
                    {new Date(resume.uploadedAt).toLocaleDateString()}
                  </div>
                  {selectedResume?.id === resume.id && (
                    <div className="flex items-center gap-1 text-sm text-green-400 mt-1">
                      <CheckCircle className="w-4 h-4" />
                      Selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Import Button */}
      {selectedResume && (
        <div className="flex justify-center">
          <button
            onClick={handleImport}
            disabled={importing}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            {importing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Importing Resume...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                Import Selected Resume
              </>
            )}
          </button>
        </div>
      )}

      {/* Info */}
      <div className="text-center text-sm text-slate-500">
        <p>The imported data will be parsed and you can edit it before downloading.</p>
      </div>
    </div>
  );
}

