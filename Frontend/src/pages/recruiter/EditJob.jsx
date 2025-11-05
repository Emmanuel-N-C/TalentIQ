import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, updateJob } from '../../api/jobs';
import JobForm from '../../components/job/JobForm';
import toast from 'react-hot-toast';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const data = await getJobById(id);
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
      navigate('/recruiter/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await updateJob(id, formData);
      toast.success('✅ Job updated successfully!');
      navigate('/recruiter/jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      
      // Check for authorization errors
      if (error.response?.status === 403) {
        toast.error('You do not have permission to edit this job');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update job');
      }
      throw error;
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to My Jobs
        </button>
        <h1 className="text-3xl font-bold">Edit Job Posting</h1>
        <p className="text-gray-600 mt-2">
          Update your job posting details
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <JobForm
          initialData={job}
          onSubmit={handleSubmit}
          submitButtonText="Update Job"
        />
      </div>
    </div>
  );
}