import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
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
  CheckCircle2,
  Lightbulb
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Interview Prep',
      description: 'Practice with intelligent AI-generated interview questions tailored to your role and get instant feedback to improve your performance.',
      color: 'from-purple-600 to-indigo-600'
    },
    {
      icon: FileText,
      title: 'Smart Resume Analysis',
      description: 'Upload your resume and get AI-powered insights, ATS compatibility scores, and personalized optimization suggestions.',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      icon: Target,
      title: 'Job Matching Algorithm',
      description: 'Our AI analyzes your skills and experience to match you with the most relevant job opportunities automatically.',
      color: 'from-indigo-600 to-purple-700'
    },
    {
      icon: Briefcase,
      title: 'Complete Job Management',
      description: 'Recruiters can post jobs, manage applications, and discover top candidates all in one unified platform.',
      color: 'from-slate-600 to-slate-700'
    },
    {
      icon: Award,
      title: 'ATS Compatibility Checker',
      description: 'Ensure your resume passes Applicant Tracking Systems with our comprehensive ATS compatibility checker.',
      color: 'from-violet-600 to-purple-600'
    },
    {
      icon: Zap,
      title: 'Real-Time Application Tracking',
      description: 'Track your job applications in real-time with status updates and manage your entire job search journey.',
      color: 'from-indigo-700 to-blue-700'
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

  // Animation variants with natural easing
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent pointer-events-none" />
      
      {/* Navbar */}
      <nav className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white">TalentIQ</h1>
                <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">AI-Powered Hiring</p>
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 sm:gap-3"
            >
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="text-slate-300 hover:text-white transition-colors px-2 sm:px-3 py-2 text-xs sm:text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 sm:px-5 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/30 text-xs sm:text-sm"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <Link
                  to={`/${user?.role}/dashboard`}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 sm:px-5 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  Dashboard <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-24 relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center mb-12 sm:mb-20 lg:mb-24"
        >
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-8"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
            <span className="text-[10px] sm:text-xs md:text-sm text-purple-300 font-medium">
              <span className="hidden sm:inline">Intelligence that Connects Talent and Opportunity</span>
              <span className="sm:hidden">AI-Powered Platform</span>
            </span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-8 leading-tight px-2"
          >
            Your Complete Platform for
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Smart Hiring & Career Growth
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-sm sm:text-lg lg:text-xl text-slate-400 mb-6 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-3"
          >
            TalentIQ is a full-stack recruitment platform that combines artificial intelligence with 
            intuitive tools to help job seekers land their dream jobs and recruiters find perfect candidates.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-16 px-3"
          >
            {!isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2 group w-full sm:w-auto"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/login"
                    className="bg-slate-800 border border-slate-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-lg font-semibold hover:bg-slate-700 hover:border-slate-600 transition-all w-full sm:w-auto block text-center"
                  >
                    Sign In
                  </Link>
                </motion.div>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={`/${user?.role}/dashboard`}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  Open Dashboard
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Stats - Mobile Optimized */}
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto px-3"
          >
            {[
              { label: 'AI-Powered', sublabel: 'Interview Prep', gradient: 'from-purple-600 to-indigo-600' },
              { label: 'Smart', sublabel: 'Job Matching', gradient: 'from-blue-600 to-indigo-600' },
              { label: 'ATS', sublabel: 'Resume Checker', gradient: 'from-violet-600 to-purple-600' },
              { label: 'AI Career', sublabel: 'Insights', gradient: 'from-indigo-600 to-blue-700' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-6 hover:border-slate-600 transition-all hover:shadow-lg group"
              >
                <div className={`text-lg xs:text-xl sm:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1 sm:mb-2`}>
                  {stat.label}
                </div>
                <div className="text-[10px] xs:text-xs sm:text-sm text-slate-400 font-medium leading-tight">{stat.sublabel}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeIn}
          className="mb-16 sm:mb-24 lg:mb-28"
        >
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-8 sm:mb-16 px-3"
          >
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-sm sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto">
              Comprehensive tools for both job seekers and recruiters
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 px-3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                {/* Subtle hover glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl blur-xl`} />
                
                <div className="relative h-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 sm:p-8 hover:bg-slate-800/80 transition-all hover:border-slate-600 hover:shadow-xl">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}
                  >
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeIn}
          className="mb-16 sm:mb-24 lg:mb-28 px-3"
        >
          <motion.div 
            variants={fadeInUp}
            className="relative bg-gradient-to-br from-purple-900/8 via-indigo-900/5 to-blue-900/8 border border-purple-500/10 rounded-2xl sm:rounded-3xl p-6 sm:p-12 lg:p-16 backdrop-blur-sm overflow-hidden"
          >
            {/* Subtle background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-full blur-3xl" />
            
            <div className="relative grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <motion.div variants={staggerContainer}>
                <motion.h2 variants={fadeInUp} className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-8">
                  Why Choose TalentIQ?
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-sm sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-10 leading-relaxed">
                  Built with cutting-edge technology and designed for real-world success. 
                  Our platform streamlines the entire hiring process from start to finish.
                </motion.p>
                <motion.div variants={staggerContainer} className="space-y-3 sm:space-y-5">
                  {benefits.map((benefit, index) => (
                    <motion.div 
                      key={index}
                      variants={fadeInUp}
                      className="flex items-start gap-3 group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-500 flex-shrink-0 mt-0.5 group-hover:text-emerald-400 transition-colors" />
                      </motion.div>
                      <span className="text-xs sm:text-base lg:text-lg text-slate-300 leading-relaxed">{benefit}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
              
              <motion.div 
                variants={staggerContainer}
                className="grid grid-cols-2 gap-4 sm:gap-6"
              >
                <motion.div 
                  variants={scaleIn}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center hover:border-blue-500/30 transition-all hover:shadow-lg"
                >
                  <Users className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-2 sm:mb-4" />
                  <div className="text-base sm:text-3xl font-bold text-white mb-1 sm:mb-2">For Job Seekers</div>
                  <p className="text-[10px] sm:text-base text-slate-400">Land your dream job faster</p>
                </motion.div>
                <motion.div 
                  variants={scaleIn}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center hover:border-purple-500/30 transition-all hover:shadow-lg"
                >
                  <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-2 sm:mb-4" />
                  <div className="text-base sm:text-3xl font-bold text-white mb-1 sm:mb-2">For Recruiters</div>
                  <p className="text-[10px] sm:text-base text-slate-400">Find perfect candidates</p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          className="relative text-center px-3"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-800 rounded-2xl sm:rounded-3xl blur-2xl opacity-30" />
          <div className="relative bg-gradient-to-r from-purple-700/90 to-blue-800/90 rounded-2xl sm:rounded-3xl p-8 sm:p-16 lg:p-20 shadow-2xl">
            <motion.h2 
              variants={fadeInUp}
              className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6"
            >
              Ready to Transform Your Career?
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-sm sm:text-xl lg:text-2xl text-purple-50 mb-6 sm:mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Join TalentIQ today and experience the future of recruitment powered by AI
            </motion.p>
            {!isAuthenticated && (
              <motion.div
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 sm:gap-3 bg-white text-purple-700 px-6 sm:px-10 py-3 sm:py-5 rounded-xl text-base sm:text-xl font-bold hover:bg-gray-50 transition-all shadow-2xl hover:shadow-white/10 group"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-12 sm:mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/15">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-slate-400 text-xs sm:text-base">© 2025 TalentIQ. All rights reserved.</span>
            </div>
            <div className="text-slate-400 text-xs sm:text-base">
              Powered by TalentIQ Technology
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}