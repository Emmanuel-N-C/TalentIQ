import { useState, useEffect } from 'react';
import { getAllJobsAdmin, deleteJobAdmin } from '../../api/admin';
import JobTable from '../../components/admin/JobTable';
import { Briefcase } from 'lucide-react';
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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
          <Briefcase className="w-6 h-6 sm:w-8 sm:h-8" />
          Job Management
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">
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