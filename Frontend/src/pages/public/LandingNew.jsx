import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Brain,
  FileText,
  Target,
  Briefcase,
  Shield,
  TrendingUp,
  Upload,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Users,
  BriefcaseBusiness,
  ChevronDown,
  Github,
  Linkedin,
  Quote,
  Menu
} from 'lucide-react';
import Logo from '../../assets/Talentiqsymb.png';

// Import screenshots from old landing
import AtsChecker from '../../assets/Atschecker.png';
import InterviewPrep from '../../assets/Interviewprep.png';
import PostJob from '../../assets/PostJob.png';
import ResumeUpload from '../../assets/ResumeUpload.png';

// Compact Dropdown Menu Component
const MobileDropdown = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute top-[68px] right-4 sm:right-6 lg:right-8 w-[200px] bg-[#1e2642]/95 backdrop-blur-xl border border-[#2a3350] rounded-xl shadow-2xl overflow-hidden z-50"
        >
          {/* Navigation Links */}
          <nav className="py-2">
            <a
              href="#features"
              onClick={handleLinkClick}
              className="block px-4 py-2.5 text-[14px] text-slate-300 hover:text-white hover:bg-[#2a3350]/60 transition-all font-[500]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={handleLinkClick}
              className="block px-4 py-2.5 text-[14px] text-slate-300 hover:text-white hover:bg-[#2a3350]/60 transition-all font-[500]"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              onClick={handleLinkClick}
              className="block px-4 py-2.5 text-[14px] text-slate-300 hover:text-white hover:bg-[#2a3350]/60 transition-all font-[500]"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              onClick={handleLinkClick}
              className="block px-4 py-2.5 text-[14px] text-slate-300 hover:text-white hover:bg-[#2a3350]/60 transition-all font-[500]"
            >
              FAQ
            </a>

            {/* Auth Buttons */}
            {!isAuthenticated && (
              <>
                <div className="border-t border-[#2a3350] my-2"></div>
                <Link
                  to="/login"
                  onClick={handleLinkClick}
                  className="block px-4 py-2.5 text-[14px] text-slate-300 hover:text-white hover:bg-[#2a3350]/60 transition-all font-[500]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={handleLinkClick}
                  className="block mx-3 my-2 px-4 py-2 text-center bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] text-white rounded-lg text-[14px] font-[600] transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Navbar Component with Dropdown
const ResponsiveNavbar = ({ onMenuToggle, isMenuOpen }) => {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0f1629]/95 backdrop-blur-xl border-b border-[#2a3350]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[68px]">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={Logo} alt="TalentIQ Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-[15px] font-[600] text-white tracking-[-0.01em]">
              TalentIQ
            </span>
          </motion.div>

          {/* Desktop Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center gap-8"
          >
            <a href="#features" className="text-[14px] text-white/60 hover:text-white transition-colors font-[500]">
              Features
            </a>
            <a href="#how-it-works" className="text-[14px] text-white/60 hover:text-white transition-colors font-[500]">
              How It Works
            </a>
            <a href="#testimonials" className="text-[14px] text-white/60 hover:text-white transition-colors font-[500]">
              Testimonials
            </a>
            <a href="#faq" className="text-[14px] text-white/60 hover:text-white transition-colors font-[500]">
              FAQ
            </a>
          </motion.div>

          {/* Right Side - Auth Buttons & Hamburger */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            {/* Desktop Auth Buttons */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block text-white/70 hover:text-white transition-colors text-[14px] font-[500] px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:block bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] text-white px-5 py-2 rounded-lg text-[14px] h-[38px] flex items-center transition-all font-[600]"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Hamburger Menu Button (Mobile) */}
            <button
              onClick={onMenuToggle}
              className={`md:hidden w-9 h-9 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center hover:bg-white/[0.12] transition-all ${
                isMenuOpen ? 'bg-white/[0.12]' : ''
              }`}
            >
              <Menu className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

// Feature Card Component - Simplified without tilt
const FeatureCard = ({ feature, index }) => {
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
    <motion.div
      variants={scaleIn}
      className="group relative"
    >
      <div className="absolute inset-0 bg-blue-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />

      <div className="relative h-full bg-[#1e2642]/50 backdrop-blur-sm border border-[#2a3350] rounded-2xl p-6 sm:p-8 hover:bg-[#252d48]/60 hover:border-[#3a4360] transition-all">
        <div className="w-14 h-14 rounded-xl bg-[#2a3350]/60 border border-[#3a4360] flex items-center justify-center mb-6 group-hover:bg-[#323b58]/70 group-hover:border-[#4a5370] transition-all">
          <feature.icon
            className="w-7 h-7 text-blue-300/70 group-hover:text-blue-200 transition-colors"
            strokeWidth={2}
          />
        </div>

        <h3 className="text-[18px] sm:text-[20px] font-[700] text-white mb-3 tracking-[-0.01em]">
          {feature.title}
        </h3>
        <p className="text-[14px] sm:text-[15px] text-slate-400 leading-[1.6] font-[500]">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

export default function LandingNew() {
  const { isAuthenticated, user } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
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

  // Features data
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Interview Prep',
      description:
        'Practice with intelligent AI-generated interview questions tailored to your role and get instant feedback to improve your performance.'
    },
    {
      icon: FileText,
      title: 'Smart Resume Analysis',
      description:
        'Upload your resume and get AI-powered insights, ATS compatibility scores, and personalized optimization suggestions.'
    },
    {
      icon: Briefcase,
      title: 'Complete Job Management',
      description:
        'Recruiters can post jobs, manage applications, and discover top candidates all in one unified platform.'
    },
    {
      icon: Target,
      title: 'Job Applications',
      description:
        'Discover open positions and apply seamlessly through a single, organized platform.'
    },
    {
      icon: Shield,
      title: 'ATS Compatibility Checker',
      description:
        'Ensure your resume passes Applicant Tracking Systems with our comprehensive ATS compatibility checker.'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Application Tracking',
      description:
        'Track your job applications in real-time with status updates and manage your entire job search journey.'
    }
  ];

  // How It Works steps
  const howItWorksSteps = [
    {
      title: 'Job Seekers: Upload Your Resume',
      description: 'Start by uploading your CV. Our system scans and prepares it for personalized analysis.',
      icon: Upload,
      screenshot: ResumeUpload,
    },
    {
      title: 'Get AI-Powered Feedback',
      description: 'Receive instant insights, ATS scores, and optimization suggestions to improve your resume.',
      icon: MessageSquare,
      screenshot: AtsChecker,
    },
    {
      title: 'Practice Mock Interviews',
      description: 'Practice with AI-generated questions tailored to the job, complete with real-time feedback.',
      icon: Brain,
      screenshot: InterviewPrep,
    },
    {
      title: 'Recruiters: Post jobs, Manage Candidates',
      description:
        'Post jobs, review applications, and discover top candidates all in one unified dashboard.',
      icon: BarChart3,
      screenshot: PostJob,
    }
  ];

  // Benefits
  const benefits = [
    'AI-powered interview preparation with instant feedback',
    'Advanced resume optimization and ATS checking',
    'Comprehensive application tracking',
    'Recruiter tools for candidate management',
    'Real-time notifications and updates'
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'Tech Corp',
      content:
        'TalentIQ helped me land my dream job! The AI interview prep was incredibly accurate and boosted my confidence.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'HR Manager',
      company: 'StartupXYZ',
      content:
        'As a recruiter, this platform has streamlined our hiring process. Finding qualified candidates has never been easier.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Designer',
      company: 'Design Studio',
      content:
        'The resume analysis feature is a game-changer. My ATS score improved dramatically after following the suggestions.',
      rating: 5
    },
    {
      name: 'David Kim',
      role: 'Data Scientist',
      company: 'Analytics Pro',
      content:
        'The ATS checker helped me optimize my resume perfectly. I started getting more interview calls within weeks!',
      rating: 5
    },
    {
      name: 'Jessica Martinez',
      role: 'Marketing Manager',
      company: 'Brand Solutions',
      content:
        'Love the interview practice feature! It felt like having a personal career coach available 24/7.',
      rating: 5
    },
    {
      name: 'Ryan Thompson',
      role: 'Full Stack Developer',
      company: 'WebDev Inc',
      content:
        'The job matching algorithm is spot on. I found opportunities that perfectly aligned with my skills and experience.',
      rating: 5
    },
    {
      name: 'Priya Patel',
      role: 'UX Researcher',
      company: 'UserFirst',
      content:
        'TalentIQ made my job search so much more organized. The application tracking feature is incredibly useful.',
      rating: 5
    },
    {
      name: 'James Wilson',
      role: 'Talent Acquisition Lead',
      company: 'Growth Ventures',
      content:
        'As a recruiter, this tool saves me hours every week. The candidate matching is impressively accurate.',
      rating: 5
    },
    {
      name: 'Aisha Rahman',
      role: 'Product Manager',
      company: 'Innovation Labs',
      content:
        'The AI-powered feedback on my resume was eye-opening. Made changes I never would have thought of!',
      rating: 5
    },
    {
      name: 'Carlos Mendez',
      role: 'DevOps Engineer',
      company: 'Cloud Systems',
      content:
        'Fantastic platform! The mock interviews helped me prepare for tough technical questions. Highly recommend!',
      rating: 5
    }
  ];

  // FAQs
  const faqs = [
    {
      question: 'What file formats can I upload for my CV?',
      answer:
        'You can upload your CV in PDF format. Our AI system will parse and analyze it to provide personalized insights and compatibility scores.'
    },
    {
      question: 'Is my uploaded CV stored or shared with others?',
      answer:
        'Your CV is stored securely in our encrypted database and is never shared with third parties without your explicit consent. Only you and recruiters you apply to can access your information.'
    },
    {
      question: 'Can I use this platform without a job description?',
      answer:
        'Yes! You can upload your resume for general analysis and ATS checking. For interview prep, you can either paste a job description or practice with general questions for your field.'
    },
    {
      question: 'What kind of interview questions should I expect?',
      answer:
        'Our AI generates questions based on the job description, your experience level, and industry standards. Expect behavioral, technical, and situational questions tailored to your role.'
    }
  ];

  // Social links
  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/Emmanuel-N-C'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://linkedin.com/in/emmanuel-nwanganga-4940ab2a5'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f1629] relative overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.1)_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f37]/40 via-[#0f1629]/70 to-[#0f1629]" />

      {/* Responsive Navbar */}
      <ResponsiveNavbar 
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
        isMenuOpen={mobileMenuOpen}
      />

      {/* Mobile Dropdown */}
      <MobileDropdown isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Hero Section */}
      <div className="relative min-h-[90vh] sm:min-h-screen flex items-center">
        <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] bg-blue-500/[0.05] rounded-full blur-[120px]" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative z-10 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-[980px] mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-[#1e2642]/60 border border-[#2a3350] rounded-full px-3 sm:px-4 py-2 mb-6 sm:mb-8 hover:bg-[#252d48]/70 transition-all cursor-pointer group"
            >
              <span className="text-[11px] sm:text-[13px] text-slate-400 font-[500]">
                Intelligence that connects Talent and Opportunity
              </span>
            </motion.div>

            {/* Hero heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-[36px] sm:text-[50px] lg:text-[70px] leading-[1.1] sm:leading-[1.08] font-[700] mb-5 sm:mb-7 tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)] px-4"
              style={{
                fontFamily:
                  '"Geist Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
              }}
            >
              Your Complete Platform for
              <br />
              Smart Hiring &amp; Career Growth
            </motion.h1>

            <motion.div variants={fadeInUp} className="mb-8 sm:mb-11 px-4">
              <p className="text-[15px] sm:text-[17px] text-slate-400 leading-[1.6] mb-0.5 font-[500]">
                TalentIQ is a platform that combines artificial intelligence with intuitive tools to help
              </p>
              <p className="text-[15px] sm:text-[17px] text-slate-400 leading-[1.6] font-[500]">
                job seekers land their dream jobs and recruiters find perfect candidates.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-3 px-4">
              <Link
                to="/register"
                className="bg-white hover:bg-white/90 text-[#0f1629] px-8 py-3.5 rounded-[10px] text-[15px] sm:text-[16px] font-[700] transition-all h-[48px] flex items-center justify-center shadow-lg shadow-blue-500/10"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-[#1e2642]/60 hover:bg-[#252d48]/70 border border-[#2a3350] text-white px-8 py-3.5 rounded-[10px] text-[15px] sm:text-[16px] font-[700] transition-all h-[48px] flex items-center justify-center gap-2"
              >
                Login
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
        className="relative py-16 sm:py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12 sm:mb-16">
          <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-[700] mb-4 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)] px-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-[15px] sm:text-[17px] text-slate-400 font-[500] max-w-2xl mx-auto px-4">
            Comprehensive tools for both job seekers and recruiters
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </motion.div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        id="how-it-works"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeIn}
        className="mb-16 sm:mb-24 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeInUp} className="text-center mb-16 sm:mb-20">
          <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-[700] mb-4 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)] px-4">
            How It Works
          </h2>
          <p className="text-[15px] sm:text-[17px] text-slate-400 font-[500] max-w-2xl mx-auto px-4">
            From uploading your resume to mastering interviews, every step is seamless and purposeful
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} className="space-y-20 sm:space-y-32">
          {howItWorksSteps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-10 sm:gap-16 lg:gap-20 items-center`}
            >
              {/* Content */}
              <div className="flex-none lg:w-[450px] space-y-4 sm:space-y-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl"
                >
                  <step.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
                </motion.div>
                <h3 className="text-[28px] sm:text-[32px] lg:text-[40px] font-[700] leading-tight tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]">
                  {step.title}
                </h3>
                <p className="text-[16px] sm:text-[18px] text-slate-400 leading-relaxed font-[500]">
                  {step.description}
                </p>
              </div>

              {/* Screenshot */}
              <motion.div whileHover={{ scale: 1.02 }} className="flex-1 w-full max-w-5xl">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur-3xl group-hover:opacity-40 transition-opacity rounded-3xl" />
                  <div className="relative bg-[#1e2642]/50 backdrop-blur-sm border border-[#2a3350] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src={step.screenshot}
                      alt={step.title}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Why Choose TalentIQ Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeIn}
        className="mb-16 sm:mb-24 px-4 sm:px-6 max-w-7xl mx-auto"
      >
        <motion.div
          variants={fadeInUp}
          className="relative bg-[#1e2642]/50 border border-[#2a3350] rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/[0.05] rounded-full blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
            <motion.div variants={staggerContainer}>
              <motion.h2
                variants={fadeInUp}
                className="text-[32px] sm:text-[40px] lg:text-[48px] font-[700] mb-6 sm:mb-8 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]"
              >
                Why Choose TalentIQ?
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-[15px] sm:text-[17px] text-slate-400 mb-8 sm:mb-10 leading-relaxed font-[500]"
              >
                Built with cutting-edge technology and designed for real-world success. Our platform
                streamlines the entire hiring process from start to finish.
              </motion.p>
              <motion.div variants={staggerContainer} className="space-y-4 sm:space-y-5">
                {benefits.map((benefit, index) => (
                  <motion.div key={index} variants={fadeInUp} className="flex items-start gap-3 group">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle2
                        className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300 flex-shrink-0 mt-0.5"
                        strokeWidth={2}
                      />
                    </motion.div>
                    <span className="text-[14px] sm:text-[16px] text-slate-300 leading-relaxed font-[500]">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-4 sm:gap-6">
              <motion.div
                variants={scaleIn}
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-[#1e2642]/50 backdrop-blur-sm border border-[#2a3350] rounded-2xl p-6 sm:p-8 text-center hover:border-[#3a4360] transition-all"
              >
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-blue-300 mx-auto mb-3 sm:mb-4" strokeWidth={2} />
                <div className="text-[20px] sm:text-[24px] font-[700] mb-2 text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500">For Job Seekers</div>
                <p className="text-[12px] sm:text-[14px] text-slate-400 font-[500]">Land your dream job faster</p>
              </motion.div>
              <motion.div
                variants={scaleIn}
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-[#1e2642]/50 backdrop-blur-sm border border-[#2a3350] rounded-2xl p-6 sm:p-8 text-center hover:border-[#3a4360] transition-all"
              >
                <BriefcaseBusiness className="w-10 h-10 sm:w-12 sm:h-12 text-blue-300 mx-auto mb-3 sm:mb-4" strokeWidth={2} />
                <div className="text-[20px] sm:text-[24px] font-[700] mb-2 text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500">For Recruiters</div>
                <p className="text-[12px] sm:text-[14px] text-slate-400 font-[500]">Find perfect candidates</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Testimonials Section - Auto-scrolling */}
      <motion.div
        id="testimonials"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeIn}
        className="mb-16 sm:mb-24 overflow-hidden"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12 sm:mb-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-[700] mb-4 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]">
            What Our Users Say
          </h2>
          <p className="text-[15px] sm:text-[17px] text-slate-400 font-[500] max-w-2xl mx-auto">
            Real stories from people who transformed their careers with TalentIQ
          </p>
        </motion.div>

        {/* Scrolling testimonials container */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#0f1629] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#0f1629] to-transparent z-10" />
          
          <motion.div
            className="flex gap-4 sm:gap-6"
            animate={{
              x: [0, -2400],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
          >
            {/* Render testimonials twice for seamless loop */}
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[320px] sm:w-[400px] bg-[#1e2642]/50 backdrop-blur-sm border border-[#2a3350] rounded-2xl p-6 sm:p-8"
              >
                <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600 mb-3 sm:mb-4" />
                <p className="text-[14px] sm:text-[15px] text-slate-300 leading-[1.6] mb-4 sm:mb-6 font-[500]">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-base sm:text-lg">
                      ★
                    </span>
                  ))}
                </div>
                <div>
                  <div className="text-[15px] sm:text-[16px] font-[700] text-white">{testimonial.name}</div>
                  <div className="text-[13px] sm:text-[14px] text-slate-400 font-[500]">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        id="faq"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeIn}
        className="mb-16 sm:mb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12 sm:mb-16">
          <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-[700] mb-4 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]">
            Frequently Asked Questions
          </h2>
          <p className="text-[15px] sm:text-[17px] text-slate-400 font-[500]">Everything you need to know about TalentIQ</p>
        </motion.div>

        <motion.div variants={staggerContainer} className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-[#1e2642]/50 backdrop-blur-sm border border-[#2a3350] rounded-xl overflow-hidden hover:border-[#3a4360] transition-all"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
              >
                <span className="text-[15px] sm:text-[17px] font-[600] text-white pr-4">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </motion.div>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openFaqIndex === index ? 'auto' : 0,
                  opacity: openFaqIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-[14px] sm:text-[15px] text-slate-400 leading-relaxed font-[500]">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
        className="relative text-center px-4 sm:px-6 max-w-7xl mx-auto mb-16 sm:mb-20"
      >
        <div className="relative bg-[#1e2642]/50 border border-[#2a3350] rounded-2xl sm:rounded-3xl p-10 sm:p-16 lg:p-20 shadow-2xl">
          <motion.h2 variants={fadeInUp} className="text-[32px] sm:text-[40px] lg:text-[48px] font-[700] mb-4 sm:mb-6 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]">
            Ready to Transform Your Career?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-[16px] sm:text-[18px] text-slate-400 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed font-[500]"
          >
            Join TalentIQ today and experience the future of recruitment powered by AI
          </motion.p>
          {!isAuthenticated && (
            <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-[#0f1629] px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-[16px] sm:text-[17px] font-[700] transition-all shadow-2xl"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-[#2a3350] mt-16 sm:mt-20 relative z-10 bg-[#0f1629]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            {/* Logo and Copyright */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={Logo} alt="TalentIQ Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-white text-lg font-bold">TalentIQ</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                AI-Powered Hiring Platform
              </p>
              <p className="text-slate-500 text-xs">
                Copyright © 2025 TalentIQ Inc.
                <br />
                All rights reserved.
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                FEATURES
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    AI Interview Prep
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    Resume Analysis
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    ATS Checker
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    Job Management
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    Application Tracking
                  </a>
                </li>
              </ul>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                PRODUCT
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#how-it-works"
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Channels */}
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                CHANNELS
              </h3>
              <ul className="space-y-3">
                {socialLinks.map((social, index) => (
                  <li key={index}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                    >
                      <social.icon className="w-4 h-4" strokeWidth={2} />
                      {social.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}