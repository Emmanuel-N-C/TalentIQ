import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              TalentIQ
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <span className="text-gray-700">
                  Welcome, {user?.name || user?.email}
                </span>
                <Link
                  to={`/${user?.role}/dashboard`}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2"
                >
                  Dashboard
                </Link>
                
                {/* Show Saved Jobs link for job seekers */}
                {user?.role === 'jobseeker' && (
                  <Link
                    to="/jobseeker/saved-jobs"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 flex items-center gap-1"
                  >
                    <span>💾</span>
                    <span>Saved Jobs</span>
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}