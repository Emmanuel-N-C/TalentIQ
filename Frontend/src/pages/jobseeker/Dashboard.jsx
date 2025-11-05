import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function JobSeekerDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Job Seeker Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {user?.name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Browse Jobs */}
        <Link
          to="/jobseeker/browse"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">🔍 Browse Jobs</h3>
          <p className="text-gray-600">Explore available job opportunities</p>
        </Link>

        {/* Interview Prep */}
        <Link
          to="/jobseeker/interview-prep"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">🎯 Interview Prep</h3>
          <p className="text-gray-600">Practice with AI-powered questions</p>
        </Link>

        {/* My Resumes */}
        <Link
          to="/jobseeker/resumes"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">📄 My Resumes</h3>
          <p className="text-gray-600">Manage your resumes</p>
        </Link>

        {/* NEW: Resume Optimizer */}
        <Link
          to="/jobseeker/resume-optimizer"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">📝 Resume Optimizer</h3>
          <p className="text-gray-600">Get professional feedback to improve your CV</p>
        </Link>

        {/* NEW: ATS Checker */}
        <Link
          to="/jobseeker/ats-checker"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">🎯 ATS Checker</h3>
          <p className="text-gray-600">Check ATS score against specific jobs</p>
        </Link>

        {/* Job Matcher */}
        <Link
          to="/jobseeker/job-matcher"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">🔍 Job Matcher</h3>
          <p className="text-gray-600">Find how well your resume matches specific jobs</p>
        </Link>

        {/* My Matches */}
        <Link
          to="/jobseeker/matches"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">✨ Job Matches</h3>
          <p className="text-gray-600">View AI-matched opportunities</p>
        </Link>

        {/* My Applications */}
        <Link
          to="/jobseeker/applications"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">📄 My Applications</h3>
          <p className="text-gray-600">Track your job applications</p>
        </Link>
      </div>
    </div>
  );
}