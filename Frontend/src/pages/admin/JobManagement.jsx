import { useState, useEffect } from 'react';
import { getAllJobsAdmin, deleteJobAdmin } from '../../api/admin';
import JobTable from '../../components/admin/JobTable';
import toast from 'react-hot-toast';

export default function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadJobs();
  }, [currentPage]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await getAllJobsAdmin(currentPage, pageSize, 'createdAt', 'desc');
      setJobs(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteJobAdmin(jobId);
      toast.success('Job deleted successfully');
      // Reload jobs to reflect changes
      await loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
        <p className="text-gray-600 mt-2">
          Oversee all job postings on the platform ({totalElements} total)
        </p>
      </div>

      <JobTable
        jobs={jobs}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onDeleteJob={handleDeleteJob}
        loading={loading}
      />
    </div>
  );
}