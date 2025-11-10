import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllJobs, deleteJob } from '../../api/jobs';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Briefcase, Edit, Trash2, Eye, BarChart3, PlusCircle, Calendar, FileText, TrendingUp, Clock } from 'lucide-react';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const allJobs = await getAllJobs();
      
      const myJobs = allJobs.filter(job => job.recruiterId === user.id);
      setJobs(myJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      setDeletingId(jobToDelete.id);
      await deleteJob(jobToDelete.id);
      toast.success('Job deleted successfully');
      setJobs(jobs.filter(job => job.id !== jobToDelete.id));
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error.response?.data?.message || 'Failed to delete job');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (jobId) => {
    navigate(`/recruiter/jobs/edit/${jobId}`);
  };

  const handleViewApplications = (jobId) => {
    navigate(`/recruiter/jobs/${jobId}/applications`);
  };

  const handleViewStats = (jobId) => {
    navigate(`/recruiter/jobs/${jobId}/stats`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalApplications = jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
              My Job Postings
            </h1>
            <p className="text-slate-400">Manage your active job listings</p>
          </div>
          <Link
            to="/recruiter/jobs/create"
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-blue-600 font-semibold flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            Post New Job
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-3xl font-bold text-white">{jobs.length}</div>
                <div className="text-slate-400 text-sm">Total Jobs Posted</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-3xl font-bold text-white">
                  {jobs.filter(j => new Date(j.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </div>
                <div className="text-slate-400 text-sm">Posted This Week</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-3xl font-bold text-white">{totalApplications}</div>
                <div className="text-slate-400 text-sm">Total Applications</div>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Job Postings Yet</h2>
            <p className="text-slate-400 mb-6">
              Create your first job posting to start receiving applications
            </p>
            <Link
              to="/recruiter/jobs/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-blue-600 font-semibold transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              Create Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{job.title}</h3>
                        <p className="text-slate-400">{job.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/30">
                        {job.experienceLevel}
                      </span>
                      {job.applicationCount > 0 && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium border border-green-500/30 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {job.applicationCount} {job.applicationCount === 1 ? 'Application' : 'Applications'}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-300 mb-4 line-clamp-2">{job.description}</p>

                    {job.skillsRequired && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {job.skillsRequired.split(',').slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                          {job.skillsRequired.split(',').length > 5 && (
                            <span className="px-3 py-1 text-slate-500 text-sm">
                              +{job.skillsRequired.split(',').length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-6 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Posted {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        0 views
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {job.applicationCount || 0} applications
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(job.id)}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition font-medium whitespace-nowrap flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewApplications(job.id)}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition font-medium whitespace-nowrap flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Applications ({job.applicationCount || 0})
                    </button>
                    <button
                      onClick={() => handleViewStats(job.id)}
                      className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition font-medium whitespace-nowrap flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Stats
                    </button>
                    <button
                      onClick={() => handleDeleteClick(job)}
                      disabled={deletingId === job.id}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition font-medium disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                    >
                      {deletingId === job.id ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
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
            setJobToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Job Posting"
          message={`Are you sure you want to delete "${jobToDelete?.title}" at ${jobToDelete?.company}? This will permanently remove the job posting and all ${jobToDelete?.applicationCount || 0} associated applications. This action cannot be undone.`}
          confirmText="Delete Job"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
}