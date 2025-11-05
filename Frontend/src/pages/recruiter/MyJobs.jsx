import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllJobs, deleteJob } from '../../api/jobs';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const allJobs = await getAllJobs();
      
      // Filter to only show jobs created by this recruiter
      const myJobs = allJobs.filter(job => job.recruiterId === user.id);
      console.log('📋 My jobs:', myJobs);
      console.log('👤 Current user ID:', user.id);
      setJobs(myJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This will also delete all applications. This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(jobId);
      await deleteJob(jobId);
      toast.success('Job deleted successfully');
      
      // Remove from local state
      setJobs(jobs.filter(job => job.id !== jobId));
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Calculate total applications
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Job Postings</h1>
          <p className="text-gray-600 mt-1">Manage your active job listings</p>
        </div>
        <Link
          to="/recruiter/jobs/create"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold"
        >
          ➕ Post New Job
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-primary-600">{jobs.length}</div>
          <div className="text-gray-600 mt-1">Total Jobs Posted</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-green-600">
            {jobs.filter(j => new Date(j.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
          </div>
          <div className="text-gray-600 mt-1">Posted This Week</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-blue-600">{totalApplications}</div>
          <div className="text-gray-600 mt-1">Total Applications</div>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">💼</div>
          <h2 className="text-2xl font-semibold mb-2">No Job Postings Yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first job posting to start receiving applications
          </p>
          <Link
            to="/recruiter/jobs/create"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 font-semibold"
          >
            Create Your First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {job.experienceLevel}
                    </span>
                    {/* NEW: Application Count Badge */}
                    {job.applicationCount > 0 && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {job.applicationCount} {job.applicationCount === 1 ? 'Application' : 'Applications'}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 font-medium mb-3">{job.company}</p>
                  
                  <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                  {job.skillsRequired && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {job.skillsRequired.split(',').slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                        {job.skillsRequired.split(',').length > 5 && (
                          <span className="px-2 py-1 text-gray-500 text-sm">
                            +{job.skillsRequired.split(',').length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>📅 Posted {format(new Date(job.createdAt), 'MMM dd, yyyy')}</span>
                    <span>👁️ 0 views</span>
                    <span>📄 {job.applicationCount || 0} applications</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="ml-6 flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(job.id)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium whitespace-nowrap"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleViewApplications(job.id)}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium whitespace-nowrap"
                  >
                    📄 Applications ({job.applicationCount || 0})
                  </button>
                  <button
                    onClick={() => handleViewStats(job.id)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium whitespace-nowrap"
                  >
                    📊 View Stats
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    disabled={deletingId === job.id}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium disabled:opacity-50 whitespace-nowrap"
                  >
                    {deletingId === job.id ? '⏳ Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}