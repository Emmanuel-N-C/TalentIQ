import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';
import { authAPI } from '../../api/auth';
import { Sparkles, Mail, Lock, ArrowRight, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [oauthCredential, setOauthCredential] = useState(false);
  const [selectedRole, setSelectedRole] = useState('JOB_SEEKER');
  
  // Email verification state
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendingOtp, setResendingOtp] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowVerificationPrompt(false);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      const { token, id, email: userEmail, fullName, role } = response.data;
      const normalizedRole = role.toLowerCase().replace('_', '');
      
      const user = {
        id,
        email: userEmail,
        name: fullName,
        role: normalizedRole,
      };
      
      login(user, token);
      toast.success('Login successful!');
      navigate(`/${user.role}/dashboard`);
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if error is due to unverified email
      if (error.response?.data?.requiresVerification) {
        setUnverifiedEmail(error.response.data.email);
        setShowVerificationPrompt(true);
        toast.error('Please verify your email to continue');
      } else {
        toast.error(error.response?.data?.error || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendingOtp(true);
    try {
      const response = await authAPI.resendOtp(unverifiedEmail);
      toast.success(response.message || 'OTP sent to your email');
      
      // Navigate to verify OTP page
      navigate('/verify-otp', { state: { email: unverifiedEmail } });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResendingOtp(false);
    }
  };

  const handleOAuthSuccess = async (credentialResponse) => {
    setOauthCredential(credentialResponse.credential);
    setShowRoleDialog(true);
  };

  const completeOAuthLogin = async () => {
    setIsOAuthLoading(true);
    try {
      const response = await authAPI.oauthLogin(
        oauthCredential,
        'GOOGLE',
        selectedRole
      );
      
      const { token, id, email, fullName, role } = response;
      const normalizedRole = role.toLowerCase().replace('_', '');
      const user = { id, email, name: fullName, role: normalizedRole };
      
      login(user, token);
      toast.success('Login successful!');
      navigate(`/${user.role}/dashboard`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'OAuth login failed');
    } finally {
      setIsOAuthLoading(false);
      setShowRoleDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TalentIQ</h1>
                <p className="text-xs text-slate-400">AI-Powered Hiring</p>
              </div>
            </Link>
            <Link
              to="/register"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Need an account?
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-400 text-lg">
              Sign in to continue to TalentIQ
            </p>
          </div>

          {/* Email Verification Prompt */}
          {showVerificationPrompt && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-amber-500 font-semibold mb-1">Email Not Verified</h3>
                  <p className="text-slate-300 text-sm mb-3">
                    Please verify your email address to continue. We'll send you a verification code.
                  </p>
                  <button
                    onClick={handleResendOtp}
                    disabled={resendingOtp}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {resendingOtp ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Form Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="you@gmail.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <Link 
                    to="/forgot-password" 
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800/50 text-slate-400">Or continue with</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <GoogleLogin
                onSuccess={handleOAuthSuccess}
                onError={() => {
                  toast.error('Google login failed');
                }}
                theme="filled_black"
                size="large"
                width="100%"
              />
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-center text-slate-400">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="text-slate-400 hover:text-slate-300 transition-colors inline-flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Role Selection Dialog for OAuth */}
      {showRoleDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Select Your Role</h3>
            <p className="text-slate-400 mb-6">Choose how you want to use TalentIQ</p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedRole('JOB_SEEKER')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedRole === 'JOB_SEEKER'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedRole === 'JOB_SEEKER' ? 'border-purple-500' : 'border-slate-500'
                  }`}>
                    {selectedRole === 'JOB_SEEKER' && (
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    )}
                  </div>
                  <div>
                    <div className="text-white font-semibold">Job Seeker</div>
                    <div className="text-slate-400 text-sm">Find jobs and manage applications</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole('RECRUITER')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedRole === 'RECRUITER'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedRole === 'RECRUITER' ? 'border-purple-500' : 'border-slate-500'
                  }`}>
                    {selectedRole === 'RECRUITER' && (
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    )}
                  </div>
                  <div>
                    <div className="text-white font-semibold">Recruiter</div>
                    <div className="text-slate-400 text-sm">Post jobs and hire candidates</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRoleDialog(false);
                  setOauthCredential(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={completeOAuthLogin}
                disabled={isOAuthLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                {isOAuthLoading ? 'Completing...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}