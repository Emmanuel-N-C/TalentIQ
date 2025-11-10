import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  Brain, 
  FileText, 
  Briefcase, 
  Award,
  Target,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Interview Prep',
      description: 'Practice with intelligent AI-generated interview questions tailored to your role and get instant feedback to improve your performance.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FileText,
      title: 'Smart Resume Analysis',
      description: 'Upload your resume and get AI-powered insights, ATS compatibility scores, and personalized optimization suggestions.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Job Matching Algorithm',
      description: 'Our AI analyzes your skills and experience to match you with the most relevant job opportunities automatically.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Briefcase,
      title: 'Complete Job Management',
      description: 'Recruiters can post jobs, manage applications, and discover top candidates all in one unified platform.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Award,
      title: 'ATS Checker',
      description: 'Ensure your resume passes Applicant Tracking Systems with our comprehensive ATS compatibility checker.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: 'Real-Time Applications',
      description: 'Track your job applications in real-time with status updates and manage your entire job search journey.',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const benefits = [
    'AI-powered interview preparation with instant feedback',
    'Advanced resume optimization and ATS checking',
    'Smart job matching based on your skills',
    'Comprehensive application tracking',
    'Recruiter tools for candidate management',
    'Real-time notifications and updates'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Custom Landing Page Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TalentIQ</h1>
                <p className="text-xs text-slate-400">AI-Powered Hiring</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="text-slate-300 hover:text-white transition-colors px-4 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <Link
                  to={`/${user?.role}/dashboard`}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Powered by Advanced AI Technology</span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Your Complete Platform for
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Smart Hiring & Career Growth
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            TalentIQ is a full-stack recruitment platform that combines artificial intelligence with 
            intuitive tools to help job seekers land their dream jobs and recruiters find perfect candidates.
          </p>

          <div className="flex justify-center gap-4 mb-12">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="bg-slate-800 border border-slate-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-700 transition-all"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to={`/${user?.role}/dashboard`}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Open Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-3xl font-bold text-white mb-1">AI-Powered</div>
              <div className="text-sm text-slate-400">Interview Prep</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-3xl font-bold text-white mb-1">Smart</div>
              <div className="text-sm text-slate-400">Job Matching</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-3xl font-bold text-white mb-1">ATS</div>
              <div className="text-sm text-slate-400">Resume Checker</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-3xl font-bold text-white mb-1">Full-Stack</div>
              <div className="text-sm text-slate-400">Platform</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-slate-400">Comprehensive tools for both job seekers and recruiters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition-all hover:border-slate-600 hover:shadow-xl"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Why Choose TalentIQ?
                </h2>
                <p className="text-lg text-slate-300 mb-8">
                  Built with cutting-edge technology and designed for real-world success. 
                  Our platform streamlines the entire hiring process from start to finish.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">For Job Seekers</div>
                  <p className="text-sm text-slate-400">Land your dream job faster</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">For Recruiters</div>
                  <p className="text-sm text-slate-400">Find perfect candidates</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join TalentIQ today and experience the future of recruitment powered by AI
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl group"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-400">© 2025 TalentIQ. All rights reserved.</span>
            </div>
            <div className="text-slate-400 text-sm">
              Powered by AI Technology
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}