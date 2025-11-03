import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RecruiterDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Recruiter Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {user?.name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/recruiter/jobs"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">💼 My Jobs</h3>
          <p className="text-gray-600">View and manage your job postings</p>
        </Link>

        <Link
          to="/recruiter/jobs/create"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">➕ Post New Job</h3>
          <p className="text-gray-600">Create a new job listing</p>
        </Link>
      </div>
    </div>
  );
}