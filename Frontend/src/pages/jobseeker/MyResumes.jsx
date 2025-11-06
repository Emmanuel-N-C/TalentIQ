import { useState, useEffect } from 'react';
import { getUserResumes, deleteResume, getResumeFileBlob } from '../../api/resumes';
import ResumeUpload from '../../components/resume/ResumeUpload';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function MyResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

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

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await deleteResume(resumeId);
      toast.success('Resume deleted successfully');
      fetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handlePreview = async (resume) => {
    setSelectedResume(resume);
    setLoadingPreview(true);
    
    // Fetch file as blob and create object URL
    try {
      const blobUrl = await getResumeFileBlob(resume.id);
      setPreviewUrl(blobUrl);
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to load preview');
      setSelectedResume(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClosePreview = () => {
    // Clean up blob URL to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedResume(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
        <p className="mt-2 text-gray-600">Manage your uploaded resumes</p>
      </div>

      {/* Upload Button */}
      {!showUpload && (
        <button
          onClick={() => setShowUpload(true)}
          className="mb-6 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Upload New Resume
        </button>
      )}

      {/* Upload Component */}
      {showUpload && (
        <>
          <ResumeUpload
            onUploadSuccess={() => {
              setShowUpload(false);
              fetchResumes();
            }}
          />
          <button
            onClick={() => setShowUpload(false)}
            className="mt-4 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </>
      )}

      {/* Resumes List */}
      {resumes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No resumes yet</h3>
          <p className="text-gray-600">Upload your first resume to get started</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
                      {resume.filename}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(resume.fileSize)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(resume.uploadedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {resume.extractedTextPreview && (
                  <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                    {resume.extractedTextPreview}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(resume)}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Resume Preview Modal - Shows actual PDF/DOCX */}
      {selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedResume.filename}</h2>
              <button
                onClick={handleClosePreview}
                className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {loadingPreview ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : selectedResume.filename.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewUrl ? `${previewUrl}#toolbar=0&navpanes=0&view=FitH` : ''}
                  className="w-full h-full"
                  title="Resume Preview"
                  style={{ border: 'none' }}
                />
              ) : selectedResume.filename.toLowerCase().match(/\.(docx?|doc)$/) ? (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-gray-700 mb-4">Word documents cannot be previewed directly in browser</p>
                  <a
                    href={previewUrl}
                    download={selectedResume.filename}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
                  >
                    Download to View
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-gray-700">Preview not available for this file type</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}