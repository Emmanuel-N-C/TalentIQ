import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../../api/jobs';
import { getJobStats } from '../../api/applications';
import toast from 'react-hot-toast';

export default function JobStats() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobData, statsData] = await Promise.all([
        getJobById(jobId),
        getJobStats(jobId)
      ]);
      setJob(jobData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
      navigate('/recruiter/jobs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/recruiter/jobs')}
        className="text-primary-600 hover:text-primary-700 mb-4"
      >
        ← Back to My Jobs
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{job?.title}</h1>
        <p className="text-gray-600 mt-1">{job?.company}</p>
      </div>

      {/* Total Applications */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-2 opacity-90">Total Applications</h2>
        <div className="text-7xl font-bold">
          {stats?.totalApplications || 0}
        </div>
        <p className="text-primary-100 mt-2 text-lg">Total candidates applied to this position</p>
      </div>

      {/* Application Status Breakdown */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold mb-6">Applications by Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending */}
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200 hover:shadow-lg transition">
            <div className="text-5xl font-bold text-yellow-700">
              {stats?.pendingApplications || 0}
            </div>
            <div className="text-yellow-800 font-medium mt-2 text-lg">⏳ Pending Review</div>
            <div className="text-sm text-yellow-600 mt-1">
              {stats?.totalApplications > 0 
                ? `${Math.round((stats?.pendingApplications / stats?.totalApplications) * 100)}%`
                : '0%'}
            </div>
          </div>

          {/* Reviewing */}
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 hover:shadow-lg transition">
            <div className="text-5xl font-bold text-blue-700">
              {stats?.reviewingApplications || 0}
            </div>
            <div className="text-blue-800 font-medium mt-2 text-lg">👀 Under Review</div>
            <div className="text-sm text-blue-600 mt-1">
              {stats?.totalApplications > 0 
                ? `${Math.round((stats?.reviewingApplications / stats?.totalApplications) * 100)}%`
                : '0%'}
            </div>
          </div>

          {/* Shortlisted */}
          <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 hover:shadow-lg transition">
            <div className="text-5xl font-bold text-purple-700">
              {stats?.shortlistedApplications || 0}
            </div>
            <div className="text-purple-800 font-medium mt-2 text-lg">⭐ Shortlisted</div>
            <div className="text-sm text-purple-600 mt-1">
              {stats?.totalApplications > 0 
                ? `${Math.round((stats?.shortlistedApplications / stats?.totalApplications) * 100)}%`
                : '0%'}
            </div>
          </div>

          {/* Interviewed */}
          <div className="bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200 hover:shadow-lg transition">
            <div className="text-5xl font-bold text-indigo-700">
              {stats?.interviewedApplications || 0}
            </div>
            <div className="text-indigo-800 font-medium mt-2 text-lg">🎤 Interviewed</div>
            <div className="text-sm text-indigo-600 mt-1">
              {stats?.totalApplications > 0 
                ? `${Math.round((stats?.interviewedApplications / stats?.totalApplications) * 100)}%`
                : '0%'}
            </div>
          </div>

          {/* Accepted */}
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 hover:shadow-lg transition">
            <div className="text-5xl font-bold text-green-700">
              {stats?.acceptedApplications || 0}
            </div>
            <div className="text-green-800 font-medium mt-2 text-lg">✅ Accepted</div>
            <div className="text-sm text-green-600 mt-1">
              {stats?.totalApplications > 0 
                ? `${Math.round((stats?.acceptedApplications / stats?.totalApplications) * 100)}%`
                : '0%'}
            </div>
          </div>

          {/* Rejected */}
          <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200 hover:shadow-lg transition">
            <div className="text-5xl font-bold text-red-700">
              {stats?.rejectedApplications || 0}
            </div>
            <div className="text-red-800 font-medium mt-2 text-lg">❌ Rejected</div>
            <div className="text-sm text-red-600 mt-1">
              {stats?.totalApplications > 0 
                ? `${Math.round((stats?.rejectedApplications / stats?.totalApplications) * 100)}%`
                : '0%'}
            </div>
          </div>

          {/* Views (placeholder) */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <div className="text-5xl font-bold text-gray-700">
              {stats?.totalViews || 0}
            </div>
            <div className="text-gray-800 font-medium mt-2 text-lg">👁️ Total Views</div>
            <div className="text-sm text-gray-600 mt-1">Coming soon</div>
          </div>
        </div>
      </div>

      {/* Progress Bar Visualization */}
      {stats?.totalApplications > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Application Pipeline</h2>
          <div className="space-y-4">
            {/* Pending */}
            {stats.pendingApplications > 0 && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-yellow-700">⏳ Pending</span>
                  <span className="text-gray-600 font-semibold">{stats.pendingApplications}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-yellow-500 h-6 rounded-full transition-all flex items-center justify-end pr-2 text-white text-sm font-bold"
                    style={{ width: `${(stats.pendingApplications / stats.totalApplications) * 100}%` }}
                  >
                    {Math.round((stats.pendingApplications / stats.totalApplications) * 100)}%
                  </div>
                </div>
              </div>
            )}

            {/* Reviewing */}
            {stats.reviewingApplications > 0 && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-blue-700">👀 Reviewing</span>
                  <span className="text-gray-600 font-semibold">{stats.reviewingApplications}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-blue-500 h-6 rounded-full transition-all flex items-center justify-end pr-2 text-white text-sm font-bold"
                    style={{ width: `${(stats.reviewingApplications / stats.totalApplications) * 100}%` }}
                  >
                    {Math.round((stats.reviewingApplications / stats.totalApplications) * 100)}%
                  </div>
                </div>
              </div>
            )}

            {/* Shortlisted */}
            {stats.shortlistedApplications > 0 && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-purple-700">⭐ Shortlisted</span>
                  <span className="text-gray-600 font-semibold">{stats.shortlistedApplications}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-purple-500 h-6 rounded-full transition-all flex items-center justify-end pr-2 text-white text-sm font-bold"
                    style={{ width: `${(stats.shortlistedApplications / stats.totalApplications) * 100}%` }}
                  >
                    {Math.round((stats.shortlistedApplications / stats.totalApplications) * 100)}%
                  </div>
                </div>
              </div>
            )}

            {/* Interviewed */}
            {stats.interviewedApplications > 0 && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-indigo-700">🎤 Interviewed</span>
                  <span className="text-gray-600 font-semibold">{stats.interviewedApplications}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-indigo-500 h-6 rounded-full transition-all flex items-center justify-end pr-2 text-white text-sm font-bold"
                    style={{ width: `${(stats.interviewedApplications / stats.totalApplications) * 100}%` }}
                  >
                    {Math.round((stats.interviewedApplications / stats.totalApplications) * 100)}%
                  </div>
                </div>
              </div>
            )}

            {/* Accepted */}
            {stats.acceptedApplications > 0 && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-green-700">✅ Accepted</span>
                  <span className="text-gray-600 font-semibold">{stats.acceptedApplications}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-green-500 h-6 rounded-full transition-all flex items-center justify-end pr-2 text-white text-sm font-bold"
                    style={{ width: `${(stats.acceptedApplications / stats.totalApplications) * 100}%` }}
                  >
                    {Math.round((stats.acceptedApplications / stats.totalApplications) * 100)}%
                  </div>
                </div>
              </div>
            )}

            {/* Rejected */}
            {stats.rejectedApplications > 0 && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-red-700">❌ Rejected</span>
                  <span className="text-gray-600 font-semibold">{stats.rejectedApplications}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-red-500 h-6 rounded-full transition-all flex items-center justify-end pr-2 text-white text-sm font-bold"
                    style={{ width: `${(stats.rejectedApplications / stats.totalApplications) * 100}%` }}
                  >
                    {Math.round((stats.rejectedApplications / stats.totalApplications) * 100)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigate(`/recruiter/jobs/${jobId}/applications`)}
          className="bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 font-semibold text-lg shadow-md hover:shadow-lg transition"
        >
          View All Applications →
        </button>
        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="bg-gray-200 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-300 font-semibold text-lg"
        >
          Back to My Jobs
        </button>
      </div>
    </div>
  );
}