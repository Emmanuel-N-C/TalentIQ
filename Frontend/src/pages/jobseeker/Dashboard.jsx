import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function JobSeekerDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Job Seeker Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {user?.name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/jobseeker/browse"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">🔍 Browse Jobs</h3>
          <p className="text-gray-600">Explore available job opportunities</p>
        </Link>

        <Link
          to="/jobseeker/interview-prep"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">🎯 Interview Prep</h3>
          <p className="text-gray-600">Practice with AI-powered questions</p>
        </Link>

        <Link
          to="/jobseeker/resumes"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">📄 My Resumes</h3>
          <p className="text-gray-600">Manage your resumes</p>
        </Link>

        <Link
          to="/jobseeker/matches"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">✨ Job Matches</h3>
          <p className="text-gray-600">View AI-matched opportunities</p>
        </Link>

        <Link
          to="/jobseeker/job-matcher"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">🎯 Job Matcher</h3>
          <p className="text-gray-600">Find how well your resume matches specific jobs</p>
        </Link>
      </div>
    </div>
  );
}