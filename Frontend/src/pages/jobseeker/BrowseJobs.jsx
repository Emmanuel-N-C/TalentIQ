import { useState, useEffect } from 'react';
import { getAllJobs } from '../../api/jobs';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs from backend
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getAllJobs();
      console.log('📋 Fetched jobs from database:', data);
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Browse Jobs</h1>
        <p className="text-gray-600">{jobs.length} jobs available</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">💼</div>
          <h2 className="text-2xl font-semibold mb-2">No Jobs Available</h2>
          <p className="text-gray-600">Check back later for new opportunities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                  <p className="text-gray-600 font-medium">{job.company}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {job.experienceLevel}
                </span>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

              {job.skillsRequired && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Skills Required:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.split(',').map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Posted {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                </p>
                <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}