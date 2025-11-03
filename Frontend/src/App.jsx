import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Job Seeker pages
import JobSeekerDashboard from './pages/jobseeker/Dashboard';
import BrowseJobs from './pages/jobseeker/BrowseJobs';
import InterviewPrep from './pages/jobseeker/InterviewPrep';
import MyResumes from './pages/jobseeker/MyResumes';
import MyMatches from './pages/jobseeker/MyMatches';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import MyJobs from './pages/recruiter/MyJobs';
import CreateJob from './pages/recruiter/CreateJob';
import EditJob from './pages/recruiter/EditJob';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import JobManagement from './pages/admin/JobManagement';

// Layout
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Toaster position="top-right" />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* PUBLIC Interview Prep for Testing - NO AUTH REQUIRED */}
              <Route path="/interview-prep" element={<InterviewPrep />} />
              
              {/* Job Seeker Routes */}
              <Route path="/jobseeker" element={<ProtectedRoute role="jobseeker" />}>
                <Route path="dashboard" element={<JobSeekerDashboard />} />
                <Route path="browse" element={<BrowseJobs />} />
                <Route path="interview-prep" element={<InterviewPrep />} />
                <Route path="resumes" element={<MyResumes />} />
                <Route path="matches" element={<MyMatches />} />
              </Route>
              
              {/* Recruiter Routes */}
              <Route path="/recruiter" element={<ProtectedRoute role="recruiter" />}>
                <Route path="dashboard" element={<RecruiterDashboard />} />
                <Route path="jobs" element={<MyJobs />} />
                <Route path="jobs/create" element={<CreateJob />} />
                <Route path="jobs/edit/:id" element={<EditJob />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute role="admin" />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="jobs" element={<JobManagement />} />
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;