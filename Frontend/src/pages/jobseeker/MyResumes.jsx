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
  const [showPreview, setShowPreview] = useState(false);

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
      
      // Close preview if the deleted resume was being previewed
      if (selectedResume?.id === resumeToDelete.id) {
        setSelectedResume(null);
        setPreviewUrl(null);
        setShowPreview(false);
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handlePreview = async (resume) => {
    // If clicking the same resume, toggle preview
    if (selectedResume?.id === resume.id) {
      setShowPreview(!showPreview);
      return;
    }

    // New resume selected
    setSelectedResume(resume);
    setShowPreview(true);
    setLoadingPreview(true);
    setPreviewUrl(null);
    
    try {
      const s3Url = await getResumeFileBlob(resume.id);
      setPreviewUrl(s3Url);
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to load preview');
      setShowPreview(false);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewUrl(null);
    setSelectedResume(null);
  };

  const handleDownload = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            My Resumes
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">Manage your uploaded resumes</p>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => setShowUpload(true)}
          className="mb-6 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-medium transition-all flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload New Resume
        </button>

        {/* Resumes List */}
        {resumes.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 sm:p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Resumes Yet</h2>
            <p className="text-slate-400 mb-6">Upload your first resume to get started</p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
            >
              Upload Resume
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-6 hover:border-slate-600 transition-all ${
                    selectedResume?.id === resume.id && showPreview
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white truncate">{resume.filename}</h3>
                        <p className="text-xs text-slate-400">{formatFileSize(resume.fileSize)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-400 mb-4">
                    Uploaded {format(new Date(resume.uploadedAt), 'MMM dd, yyyy')}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(resume)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
                        selectedResume?.id === resume.id && showPreview
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      {selectedResume?.id === resume.id && showPreview ? 'Hide' : 'View'}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(resume)}
                      className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Resume Preview - Same as Resume Optimizer */}
            {showPreview && selectedResume && (
              <div className="mt-6">
                <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <span className="font-medium text-slate-300">{selectedResume.filename}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      
                      <button
                        onClick={handleClosePreview}
                        className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                        title="Close Preview"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="h-[600px] bg-slate-950">
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
                        <p className="text-slate-400 mb-4">Word documents cannot be previewed directly in browser</p>
                        <a
                          href={previewUrl}
                          download={selectedResume.filename}
                          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
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
          </>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Upload Resume</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <ResumeUpload
                onSuccess={() => {
                  setShowUpload(false);
                  fetchResumes();
                }}
              />
            </div>
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
          message={`Are you sure you want to delete "${resumeToDelete?.filename}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
}