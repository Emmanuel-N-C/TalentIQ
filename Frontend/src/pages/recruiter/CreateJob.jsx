import { useNavigate } from 'react-router-dom';
import { createJob } from '../../api/jobs';
import JobForm from '../../components/job/JobForm';
import toast from 'react-hot-toast';

export default function CreateJob() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await createJob(formData);
      toast.success('✅ Job posted successfully!');
      navigate('/recruiter/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error(error.response?.data?.message || 'Failed to create job');
      throw error; // Re-throw to keep form in submitting state if needed
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to My Jobs
        </button>
        <h1 className="text-3xl font-bold">Create New Job</h1>
        <p className="text-gray-600 mt-2">
          Post a new job opportunity for candidates to apply
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <JobForm onSubmit={handleSubmit} submitButtonText="Create Job" />
      </div>
    </div>
  );
}