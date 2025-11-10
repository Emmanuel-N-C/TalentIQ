import { useState, useEffect } from 'react';
import { getUserResumes, deleteResume, getResumeFileBlob } from '../../api/resumes';
import ResumeUpload from '../../components/resume/ResumeUpload';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FileText, Trash2, Eye, X, Upload, Download } from 'lucide-react';

export default function MyResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

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

  const handleDeleteClick = (resume) => {
    setResumeToDelete(resume);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resumeToDelete) return;

    try {
      await deleteResume(resumeToDelete.id);
      toast.success('Resume deleted successfully');
      fetchResumes();
      setResumeToDelete(null);
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handlePreview = async (resume) => {
    setSelectedResume(resume);
    setLoadingPreview(true);
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            My Resumes
          </h1>
          <p className="text-slate-400">Manage your uploaded resumes</p>
        </div>

        {/* Upload Button */}
        {!showUpload && (
          <button
            onClick={() => setShowUpload(true)}
            className="mb-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium"
          >
            <Upload className="w-5 h-5" />
            Upload New Resume
          </button>
        )}

        {/* Upload Component */}
        {showUpload && (
          <div className="mb-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <ResumeUpload
              onUploadSuccess={() => {
                setShowUpload(false);
                fetchResumes();
              }}
            />
            <button
              onClick={() => setShowUpload(false)}
              className="mt-4 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Resumes Grid */}
        {resumes.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No resumes yet</h3>
            <p className="text-slate-400 mb-6">Upload your first resume to get started</p>
            {!showUpload && (
              <button
                onClick={() => setShowUpload(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Resume
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 break-words group-hover:text-blue-400 transition-colors">
                      {resume.filename}
                    </h3>
                    <p className="text-sm text-slate-400 mb-1">
                      {formatFileSize(resume.fileSize)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(resume.uploadedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {resume.extractedTextPreview && (
                  <div className="mb-4 p-3 bg-slate-900/50 rounded-lg text-sm text-slate-400 line-clamp-3">
                    {resume.extractedTextPreview}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(resume)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleDeleteClick(resume)}
                    className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setResumeToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Resume"
          message={`Are you sure you want to delete "${resumeToDelete?.filename}"? This action cannot be undone and will also remove any job applications associated with this resume.`}
          confirmText="Delete Resume"
          cancelText="Cancel"
          type="danger"
        />

        {/* Resume Preview Modal */}
        {selectedResume && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-6xl w-full h-[90vh] flex flex-col">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{selectedResume.filename}</h2>
                <button
                  onClick={handleClosePreview}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-900">
                {loadingPreview ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : selectedResume.filename.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={previewUrl ? `${previewUrl}#toolbar=0&navpanes=0&view=FitH` : ''}
                    className="w-full h-full"
                    title="Resume Preview"
                    style={{ border: 'none' }}
                  />
                ) : selectedResume.filename.toLowerCase().match(/\.(docx?|doc)$/) ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <FileText className="w-16 h-16 text-slate-600 mb-4" />
                    <p className="text-slate-300 mb-4">Word documents cannot be previewed directly in browser</p>
                    <a
                      href={previewUrl}
                      download={selectedResume.filename}
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download to View
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Preview not available for this file type</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}