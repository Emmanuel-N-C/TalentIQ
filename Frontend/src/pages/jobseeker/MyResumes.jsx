import { useState, useEffect } from 'react';
import { getUserResumes, deleteResume, getResumeText } from '../../api/resumes';
import ResumeUpload from '../../components/resume/ResumeUpload';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function MyResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumeText, setResumeText] = useState('');

  // Fetch resumes on mount
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
      fetchResumes(); // Refresh list
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handleViewText = async (resume) => {
    try {
      const data = await getResumeText(resume.id);
      setResumeText(data.extractedText);
      setSelectedResume(resume);
    } catch (error) {
      console.error('Error fetching resume text:', error);
      toast.error('Failed to load resume text');
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Resumes</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
        >
          {showUpload ? 'View Resumes' : '➕ Upload New Resume'}
        </button>
      </div>

      {showUpload ? (
        <ResumeUpload
          onUploadSuccess={() => {
            setShowUpload(false);
            fetchResumes();
          }}
        />
      ) : (
        <>
          {resumes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-semibold mb-2">No resumes yet</h2>
              <p className="text-gray-600 mb-6">
                Upload your first resume to get started
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
              >
                Upload Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">📄</div>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete resume"
                    >
                      🗑️
                    </button>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 truncate">
                    {resume.filename}
                  </h3>

                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p>📊 {formatFileSize(resume.fileSize)}</p>
                    <p>📅 {format(new Date(resume.uploadedAt), 'MMM dd, yyyy')}</p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleViewText(resume)}
                      className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200"
                    >
                      👁️ View Text
                    </button>
                    <button
                      className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200"
                    >
                      🤖 Analyze
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Resume Text Modal */}
      {selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedResume.filename}</h2>
              <button
                onClick={() => setSelectedResume(null)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">
                {resumeText}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}