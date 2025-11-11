import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ResumeAnalyzer from './components/ai/ResumeAnalyzer';
import ResumeOptimizer from './components/resume/ResumeOptimizer';
import ATSChecker from './components/resume/ATSChecker';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import VerifyOtp from './pages/public/VerifyOtp';

// Job Seeker pages
import JobSeekerDashboard from './pages/jobseeker/Dashboard';
import BrowseJobs from './pages/jobseeker/BrowseJobs';
import InterviewPrep from './pages/jobseeker/InterviewPrep';
import MyResumes from './pages/jobseeker/MyResumes';
import SavedJobs from './pages/jobseeker/SavedJobs';
import MyApplications from './pages/jobseeker/MyApplications';
import JobSeekerProfile from './pages/jobseeker/Profile';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import MyJobs from './pages/recruiter/MyJobs';
import CreateJob from './pages/recruiter/CreateJob';
import EditJob from './pages/recruiter/EditJob';
import JobApplications from './pages/recruiter/JobApplications';
import JobStats from './pages/recruiter/JobStats';
import AllApplications from './pages/recruiter/AllApplications';
import ShortlistedCandidates from './pages/recruiter/ShortlistedCandidates';
import RecruiterSettings from './pages/recruiter/Settings';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import JobManagement from './pages/admin/JobManagement';

// Layout
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import RecruiterSidebar from './components/layout/RecruiterSidebar';
import AdminSidebar from './components/layout/AdminSidebar';

// Layout wrapper component for authenticated users
function AuthenticatedLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  
  // Check if user is logged in and on a protected route
  const isProtectedRoute = location.pathname.startsWith('/jobseeker') || 
                          location.pathname.startsWith('/recruiter') || 
                          location.pathname.startsWith('/admin');
  
  const showNewLayout = user && isProtectedRoute;

  if (showNewLayout) {
    // Determine which sidebar to show based on user role
    let SidebarComponent;
    if (user?.role === 'recruiter') {
      SidebarComponent = RecruiterSidebar;
    } else if (user?.role === 'admin') {
      SidebarComponent = AdminSidebar;
    } else {
      SidebarComponent = Sidebar;
    }

    return (
      <div className="flex min-h-screen bg-slate-900">
        {/* Sidebar - conditionally render based on user role */}
        <SidebarComponent />
        
        <div className="flex-1 flex flex-col">
          {/* New Navbar */}
          <Navbar />
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Public pages - NO NAVBAR, just content
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

function App() {
  return (
    <AuthenticatedLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        
        {/* PUBLIC Interview Prep for Testing - NO AUTH REQUIRED */}
        <Route path="/interview-prep" element={<InterviewPrep />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
        
        {/* Job Seeker Routes */}
        <Route path="/jobseeker" element={<ProtectedRoute role="jobseeker" />}>
          <Route path="dashboard" element={<JobSeekerDashboard />} />
          <Route path="browse" element={<BrowseJobs />} />
          <Route path="interview-prep" element={<InterviewPrep />} />
          <Route path="resumes" element={<MyResumes />} />
          <Route path="resume-optimizer" element={<ResumeOptimizer />} />
          <Route path="ats-checker" element={<ATSChecker />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="profile" element={<JobSeekerProfile />} />
        </Route>
        
        {/* Recruiter Routes */}
        <Route path="/recruiter" element={<ProtectedRoute role="recruiter" />}>
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="jobs/create" element={<CreateJob />} />
          <Route path="jobs/edit/:id" element={<EditJob />} />
          <Route path="jobs/:jobId/applications" element={<JobApplications />} />
          <Route path="jobs/:jobId/stats" element={<JobStats />} />
          <Route path="applications" element={<AllApplications />} />
          <Route path="shortlisted" element={<ShortlistedCandidates />} />
          <Route path="settings" element={<RecruiterSettings />} />
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
    </AuthenticatedLayout>
  );
}

export default App;