import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to TalentIQ
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            AI-Powered Recruitment & Interview Preparation Platform
          </p>

          <div className="flex justify-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50"
                >
                  Login
                </Link>
              </>
            ) : (
              <Link
                to={`/${user?.role}/dashboard`}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700"
              >
                Go to Dashboard
              </Link>
            )}
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3">🎯 AI Interview Prep</h3>
              <p className="text-gray-600">
                Practice with AI-generated questions and get instant feedback
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3">📄 Resume Matching</h3>
              <p className="text-gray-600">
                Find the perfect job match using AI-powered analysis
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3">💼 Job Management</h3>
              <p className="text-gray-600">
                Recruiters can post jobs and find top candidates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}