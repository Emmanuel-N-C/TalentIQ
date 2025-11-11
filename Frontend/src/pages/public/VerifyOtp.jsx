import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import { Sparkles, Mail, ArrowRight } from 'lucide-react';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('Email not provided');
      navigate('/login');
    }
  }, [email, navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.verifyOtp(email, otp);
      
      const { token, id, email: userEmail, fullName, role } = response;
      const normalizedRole = role.toLowerCase().replace('_', '');
      
      const user = {
        id,
        email: userEmail,
        name: fullName,
        role: normalizedRole
      };
      
      login(user, token);
      toast.success('Account verified successfully!');
      navigate(`/${user.role}/dashboard`);
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const response = await authAPI.resendOtp(email);
      toast.success(response.message || 'OTP sent to your email');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Verify Email</h2>
            <p className="text-slate-400 text-lg">Enter the OTP sent to your email</p>
            <p className="text-purple-400 text-sm mt-2">{email}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-widest placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm mb-3">Didn't receive the code?</p>
              <button
                onClick={handleResendOtp}
                disabled={resending}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link 
              to="/login" 
              className="text-slate-400 hover:text-slate-300 transition-colors inline-flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}