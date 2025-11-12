import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import { Sparkles, Mail, Lock, User, Briefcase, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { FaGithub } from 'react-icons/fa';
import validator from 'validator';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Register, 2: OTP Verification
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'JOB_SEEKER'
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    fullName: false
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  // OAuth state
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [oauthCredential, setOauthCredential] = useState(null);
  const [oauthProvider, setOauthProvider] = useState(null);
  const [oauthUserInfo, setOauthUserInfo] = useState(null);
  const [selectedRole, setSelectedRole] = useState('JOB_SEEKER');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validate email
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!validator.isEmail(email)) return 'Please enter a valid email address';
    return '';
  };

  // Validate password
  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[0-9])/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*[@#$%^&+=!])/.test(password)) return 'Password must contain at least one special character (@#$%^&+=!)';
    return '';
  };

  // Validate full name
  const validateFullName = (fullName) => {
    if (!fullName || fullName.trim().length === 0) return 'Full name is required';
    if (fullName.trim().length < 2) return 'Full name must be at least 2 characters';
    return '';
  };

  // Real-time validation
  useEffect(() => {
    if (touched.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(formData.email) }));
    }
  }, [formData.email, touched.email]);

  useEffect(() => {
    if (touched.password) {
      setErrors(prev => ({ ...prev, password: validatePassword(formData.password) }));
    }
  }, [formData.password, touched.password]);

  useEffect(() => {
    if (touched.fullName) {
      setErrors(prev => ({ ...prev, fullName: validateFullName(formData.fullName) }));
    }
  }, [formData.fullName, touched.fullName]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isFormValid = () => {
    return (
      !errors.email &&
      !errors.password &&
      !errors.fullName &&
      formData.email &&
      formData.password &&
      formData.fullName
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double submission
    if (loading) return;
    
    // Mark all fields as touched
    setTouched({ email: true, password: true, fullName: true });
    
    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const fullNameError = validateFullName(formData.fullName);
    
    setErrors({
      email: emailError,
      password: passwordError,
      fullName: fullNameError
    });
    
    // Stop if any errors
    if (emailError || passwordError || fullNameError) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      toast.success(response.message || 'Registration successful! Please check your email for OTP.');
      setStep(2); // Move to OTP verification
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);

    try {
      const response = await authAPI.verifyOtp(formData.email, otp);
      
      const { token, id, email, fullName, role } = response;
      const normalizedRole = role.toLowerCase().replace('_', '');
      
      const user = {
        id,
        email,
        name: fullName,
        role: normalizedRole
      };
      
      login(user, token);
      toast.success('Account verified successfully!');
      
      setTimeout(() => {
        navigate(`/${user.role}/dashboard`, { replace: true });
      }, 100);
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const response = await authAPI.resendOtp(formData.email);
      toast.success(response.message || 'OTP sent successfully');
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    }
  };

  // OAuth Handlers
  const handleGoogleSuccess = async (credentialResponse) => {
    if (isOAuthLoading) return;
    
    setIsOAuthLoading(true);
    try {
      // Check if user exists
      const checkResponse = await authAPI.checkOAuthUser(
        credentialResponse.credential,
        'GOOGLE'
      );

      if (checkResponse.exists) {
        // User exists - redirect to login
        toast.error('Account already exists. Please use login instead.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      } else {
        // New user - show role selection
        setOauthCredential(credentialResponse.credential);
        setOauthProvider('GOOGLE');
        setOauthUserInfo({
          email: checkResponse.email,
          fullName: checkResponse.fullName
        });
        setShowRoleDialog(true);
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Google registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const completeOAuthRegistration = async () => {
    if (isOAuthLoading) return;
    
    setIsOAuthLoading(true);
    try {
      const response = await authAPI.oauthRegister(
        oauthCredential,
        oauthProvider,
        selectedRole
      );
      
      const { token, id, email, fullName, role } = response;
      const normalizedRole = role.toLowerCase().replace('_', '');
      const user = { id, email, name: fullName, role: normalizedRole };
      
      login(user, token);
      toast.success('Registration successful!');
      
      setShowRoleDialog(false);
      setTimeout(() => {
        navigate(`/${user.role}/dashboard`, { replace: true });
      }, 100);
    } catch (error) {
      console.error('OAuth registration error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const handleGitHubRegister = () => {
    toast.error('GitHub registration coming soon!');
    // TODO: Implement GitHub OAuth flow
  };

  const handleGoogleError = () => {
    toast.error('Google registration failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Navigation */}
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
            <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
              Already have an account?
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h2>
            <p className="text-slate-400 text-lg">
              {step === 1 ? 'Join TalentIQ today' : 'Enter the OTP sent to your email'}
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            {step === 1 ? (
              <>
                <form onSubmit={handleRegister} className="space-y-5" noValidate>
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        onBlur={() => handleBlur('fullName')}
                        disabled={loading}
                        className={`w-full pl-11 pr-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          errors.fullName && touched.fullName
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-600 focus:border-purple-500 focus:ring-purple-500/20'
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.fullName && touched.fullName && (
                      <div className="flex items-center gap-1 mt-1.5 animate-fade-in">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        <p className="text-xs text-red-400">{errors.fullName}</p>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onBlur={() => handleBlur('email')}
                        disabled={loading}
                        className={`w-full pl-11 pr-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          errors.email && touched.email
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-600 focus:border-purple-500 focus:ring-purple-500/20'
                        }`}
                        placeholder="you@gmail.com"
                      />
                    </div>
                    {errors.email && touched.email && (
                      <div className="flex items-center gap-1 mt-1.5 animate-fade-in">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        <p className="text-xs text-red-400">{errors.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onBlur={() => handleBlur('password')}
                        disabled={loading}
                        className={`w-full pl-11 pr-12 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          errors.password && touched.password
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-600 focus:border-purple-500 focus:ring-purple-500/20'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 disabled:opacity-50"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && touched.password ? (
                      <div className="flex items-center gap-1 mt-1.5 animate-fade-in">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        <p className="text-xs text-red-400">{errors.password}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1.5">
                        Must contain uppercase, lowercase, number & special character
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">I am a</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        disabled={loading}
                        className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="JOB_SEEKER">Job Seeker</option>
                        <option value="RECRUITER">Recruiter</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isFormValid()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create Account'
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
                  {/* Google Registration */}
                  <div className="relative">
                    {isOAuthLoading ? (
                      <div className="w-full flex items-center justify-center py-3 bg-slate-700 rounded-lg">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span className="ml-2 text-white">Connecting...</span>
                      </div>
                    ) : (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_black"
                        size="large"
                        width="100%"
                        text="signup_with"
                      />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6" noValidate>
                <div className="text-center mb-6">
                  <p className="text-slate-300">
                    We sent a 6-digit code to <br />
                    <span className="font-semibold text-white">{formData.email}</span>
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Didn’t get the email? Check your spam or junk folder.
                </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Enter OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium disabled:opacity-50"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-center text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Selection Dialog for OAuth */}
      {showRoleDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Complete Your Registration</h3>
            <p className="text-slate-400 mb-6">
              Welcome {oauthUserInfo?.fullName}! Choose your role to continue.
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedRole('JOB_SEEKER')}
                disabled={isOAuthLoading}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left disabled:opacity-50 ${
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
                disabled={isOAuthLoading}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left disabled:opacity-50 ${
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
                  setOauthProvider(null);
                }}
                disabled={isOAuthLoading}
                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={completeOAuthRegistration}
                disabled={isOAuthLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                {isOAuthLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}