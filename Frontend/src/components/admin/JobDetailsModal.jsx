import { useState, useEffect } from 'react';
import { getJobDetails } from '../../api/admin';
import { formatDate } from '../../utils/formatters';
import ConfirmDialog from '../common/ConfirmDialog';
import { X, Briefcase, Building2, FileText, Award } from 'lucide-react';

export default function JobDetailsModal({ jobId, onClose, onDelete }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      const data = await getJobDetails(jobId);
      setJob(data);
    } catch (error) {
      console.error('Error loading job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await onDelete(jobId);
      onClose();
    } catch (error) {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-sm" 
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-slate-800 border border-slate-700 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : job ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{job.title}</h3>
                    <p className="text-blue-100 mt-1">Job ID: {job.id}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4 max-h-96 overflow-y-auto">
                {/* Company Info */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    Company Information
                  </h4>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Company:</span>
                      <span className="font-medium text-white">{job.company}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Experience Level:</span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {job.experienceLevel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Posted By:</span>
                      <span className="font-medium text-white">{job.recruiterName} (ID: {job.recruiterId})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Posted Date:</span>
                      <span className="font-medium text-white">{formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Job Description
                  </h4>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                </div>

                {/* Skills Required */}
                {job.skillsRequired && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-400" />
                      Required Skills
                    </h4>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {job.skillsRequired}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="bg-slate-900/50 border-t border-slate-700 px-6 py-4 flex items-center justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete Job'}
                </button>
              </div>
            </>
          ) : (
            <div className="px-6 py-12 text-center text-slate-400">
              Job not found
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {job && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Job Posting"
          message={`Are you sure you want to delete "${job.title}" at ${job.company}? This will permanently remove the job posting and all associated applications. This action cannot be undone.`}
          confirmText="Delete Job"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </div>
  );
}