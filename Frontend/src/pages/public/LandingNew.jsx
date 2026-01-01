import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
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
  Quote
} from 'lucide-react';
import NavbarNew from '../../components/layout/NavbarNew';

// Import screenshots from old landing
import AtsChecker from '../../assets/Atschecker.png';
import InterviewPrep from '../../assets/Interviewprep.png';
import PostJob from '../../assets/PostJob.png';
import ResumeUpload from '../../assets/ResumeUpload.png';

// Feature Card Component with Tilt Effect - MOVED OUTSIDE
const FeatureCard = ({ feature, index }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -10;
    const tiltY = ((x - centerX) / centerX) * 10;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
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
    <motion.div
      variants={scaleIn}
      className="group relative"
      style={{ perspective: '1000px' }}
    >
      <div className="absolute inset-0 bg-blue-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />

      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
        className="relative h-full bg-[#1e2642]/50 backdrop-blur-sm border border-[#2a3350] rounded-2xl p-8 hover:bg-[#252d48]/60 hover:border-[#3a4360] transition-all"
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-14 h-14 rounded-xl bg-[#2a3350]/60 border border-[#3a4360] flex items-center justify-center mb-6 group-hover:bg-[#323b58]/70 group-hover:border-[#4a5370] transition-all"
        >
          <feature.icon
            className="w-7 h-7 text-blue-300/70 group-hover:text-blue-200 transition-colors"
            strokeWidth={2}
          />
        </motion.div>

        <h3 className="text-[20px] font-[700] text-white mb-3 tracking-[-0.01em]">
          {feature.title}
        </h3>
        <p className="text-[15px] text-slate-400 leading-[1.6] font-[500]">
          {feature.description}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default function LandingNew() {
  const { isAuthenticated, user } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

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
      icon: Target,
      title: 'Job Matching Algorithm',
      description:
        'Our AI analyzes your skills and experience to match you with the most relevant job opportunities automatically.'
    },
    {
      icon: Briefcase,
      title: 'Complete Job Management',
      description:
        'Recruiters can post jobs, manage applications, and discover top candidates all in one unified platform.'
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
      screenshot: ResumeUpload
    },
    {
      title: 'Get AI-Powered Feedback',
      description: 'Receive instant insights, ATS scores, and optimization suggestions to improve your resume.',
      icon: MessageSquare,
      screenshot: AtsChecker
    },
    {
      title: 'Practice Mock Interviews',
      description: 'Practice with AI-generated questions tailored to the job, complete with real-time feedback.',
      icon: Brain,
      screenshot: InterviewPrep
    },
    {
      title: 'Recruiters: Post jobs, Manage Candidates',
      description:
        'Post jobs, review applications, and discover top candidates all in one unified dashboard.',
      icon: BarChart3,
      screenshot: PostJob
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

  // Testimonials
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

      <NavbarNew />

      {/* Hero Section - INCREASED PADDING BOTTOM */}
      <div className="relative min-h-screen flex items-center">
        <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/[0.05] rounded-full blur-[120px]" />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-32 relative z-10 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-[980px] mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-[#1e2642]/60 border border-[#2a3350] rounded-full px-4 py-2 mb-8 hover:bg-[#252d48]/70 transition-all cursor-pointer group"
            >
              <span className="text-[13px] text-slate-400 font-[500]">
                Intelligence that connects Talent and Opportunity
              </span>
            </motion.div>

            {/* Hero heading - keep as is */}
            <motion.h1
              variants={fadeInUp}
              className="text-[70px] leading-[1.08] font-[700] mb-7 tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]"
              style={{
                fontFamily:
                  '"Geist Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
              }}
            >
              Your Complete Platform for
              <br />
              Smart Hiring &amp; Career Growth
            </motion.h1>

            <motion.div variants={fadeInUp} className="mb-11">
              <p className="text-[17px] text-slate-400 leading-[1.6] mb-0.5 font-[500]">
                TalentIQ is a platform that combines artificial intelligence with intuitive tools to help
              </p>
              <p className="text-[17px] text-slate-400 leading-[1.6] font-[500]">
                job seekers land their dream jobs and recruiters find perfect candidates.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex justify-center gap-3">
              <Link
                to="/register"
                className="bg-white hover:bg-white/90 text-[#0f1629] px-8 py-3.5 rounded-[10px] text-[16px] font-[700] transition-all h-[48px] flex items-center shadow-lg shadow-blue-500/10"
              >
                Get Started — Free
              </Link>
              <Link
                to="/login"
                className="bg-[#1e2642]/60 hover:bg-[#252d48]/70 border border-[#2a3350] text-white px-8 py-3.5 rounded-[10px] text-[16px] font-[700] transition-all h-[48px] flex items-center gap-2"
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
        className="relative py-24 max-w-[1400px] mx-auto px-6 lg:px-8"
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          {/* UPDATED: Applied silver gradient */}
          <h2 className="text-[48px] font-[700] mb-4 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]">
            Everything You Need to Succeed
          </h2>
          <p className="text-[17px] text-slate-400 font-[500] max-w-2xl mx-auto">
            Comprehensive tools for both job seekers and recruiters
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
        className="mb-24 max-w-[1600px] mx-auto px-6 lg:px-8"
      >
        <motion.div variants={fadeInUp} className="text-center mb-20">
          {/* UPDATED: Applied silver gradient */}
          <h2 className="text-[48px] font-[700] mb-4 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]">
            How It Works
          </h2>
          <p className="text-[17px] text-slate-400 font-[500] max-w-2xl mx-auto">
            From uploading your resume to mastering interviews, every step is seamless and purposeful
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} className="space-y-32">
          {howItWorksSteps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-16 lg:gap-20 items-center`}
            >
              {/* Content */}
              <div className="flex-none lg:w-[450px] space-y-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-[#1e2642]/60 border border-[#2a3350] rounded-2xl"
                >
                  <step.icon className="w-10 h-10 text-blue-300" strokeWidth={2} />
                </motion.div>
                <h3 className="text-[40px] font-[700] text-white leading-tight tracking-[-0.02em]">
                  {step.title}
                </h3>
                <p className="text-[18px] text-slate-400 leading-relaxed font-[500]">
                  {step.description}
                </p>
              </div>

              {/* Screenshot */}
              <motion.div whileHover={{ scale: 1.02 }} className="flex-1 w-full max-w-5xl">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-blue-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-3xl" />
                  <div className="relative bg-[#1e2642]/50 backdrop-blur-sm border border-[#2a3350] rounded-3xl overflow-hidden shadow-2xl">
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
        className="mb-24 px-6 max-w-7xl mx-auto"
      >
        <motion.div
          variants={fadeInUp}
          className="relative bg-[#1e2642]/50 border border-[#2a3350] rounded-3xl p-16 backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/[0.05] rounded-full blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-16 items-center">
            <motion.div variants={staggerContainer}>
              {/* UPDATED: Applied silver gradient */}
              <motion.h2
                variants={fadeInUp}
                className="text-[48px] font-[700] mb-8 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]"
              >
                Why Choose TalentIQ?
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-[17px] text-slate-400 mb-10 leading-relaxed font-[500]"
              >
                Built with cutting-edge technology and designed for real-world success. Our platform
                streamlines the entire hiring process from start to finish.
              </motion.p>
              <motion.div variants={staggerContainer} className="space-y-5">
                {benefits.map((benefit, index) => (
                  <motion.div key={index} variants={fadeInUp} className="flex items-start gap-3 group">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle2
                        className="w-6 h-6 text-blue-300 flex-shrink-0 mt-0.5"
                        strokeWidth={2}
                      />
                    </motion.div>
                    <span className="text-[16px] text-slate-300 leading-relaxed font-[500]">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-6">
              <motion.div
                variants={scaleIn}
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-[#1e2642]/50 backdrop-blur-sm border border-[#2a3350] rounded-2xl p-8 text-center hover:border-[#3a4360] transition-all"
              >
                <Users className="w-12 h-12 text-blue-300 mx-auto mb-4" strokeWidth={2} />
                <div className="text-[24px] font-[700] text-white mb-2">For Job Seekers</div>
                <p className="text-[14px] text-slate-400 font-[500]">Land your dream job faster</p>
              </motion.div>
              <motion.div
                variants={scaleIn}
                whileHover={{ scale: 1.03, y: -4 }}
                className="bg-[#1e2642]/50 backdrop-blur-sm border border-[#2a3350] rounded-2xl p-8 text-center hover:border-[#3a4360] transition-all"
              >
                <BriefcaseBusiness className="w-12 h-12 text-blue-300 mx-auto mb-4" strokeWidth={2} />
                <div className="text-[24px] font-[700] text-white mb-2">For Recruiters</div>
                <p className="text-[14px] text-slate-400 font-[500]">Find perfect candidates</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        id="testimonials"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeIn}
        className="mb-24 max-w-7xl mx-auto px-6 lg:px-8"
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          {/* UPDATED: Applied silver gradient */}
          <h2 className="text-[48px] font-[700] mb-4 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]">
            What Our Users Say
          </h2>
          <p className="text-[17px] text-slate-400 font-[500] max-w-2xl mx-auto">
            Real stories from people who transformed their careers with TalentIQ
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-[#1e2642]/50 backdrop-blur-sm border border-[#2a3350] rounded-2xl p-8 hover:bg-[#252d48]/60 hover:border-[#3a4360] transition-all"
            >
              <Quote className="w-10 h-10 text-slate-600 mb-4" />
              <p className="text-[15px] text-slate-300 leading-[1.6] mb-6 font-[500]">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>
              <div>
                <div className="text-[16px] font-[700] text-white">{testimonial.name}</div>
                <div className="text-[14px] text-slate-400 font-[500]">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        id="faq"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeIn}
        className="mb-24 max-w-4xl mx-auto px-6 lg:px-8"
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          {/* UPDATED: Applied silver gradient */}
          <h2 className="text-[48px] font-[700] mb-4 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]">
            Frequently Asked Questions
          </h2>
          <p className="text-[17px] text-slate-400 font-[500]">Everything you need to know about TalentIQ</p>
        </motion.div>

        <motion.div variants={staggerContainer} className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-[#1e2642]/50 backdrop-blur-sm border border-[#2a3350] rounded-xl overflow-hidden hover:border-[#3a4360] transition-all"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-[17px] font-[600] text-white pr-4">{faq.question}</span>
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
                <div className="px-6 pb-6 text-[15px] text-slate-400 leading-relaxed font-[500]">
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
        className="relative text-center px-6 max-w-7xl mx-auto mb-20"
      >
        <div className="relative bg-[#1e2642]/50 border border-[#2a3350] rounded-3xl p-20 shadow-2xl">
          {/* UPDATED: Applied silver gradient */}
          <motion.h2 variants={fadeInUp} className="text-[48px] font-[700] mb-6 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]">
            Ready to Transform Your Career?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-[18px] text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed font-[500]"
          >
            Join TalentIQ today and experience the future of recruitment powered by AI
          </motion.p>
          {!isAuthenticated && (
            <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-[#0f1629] px-10 py-5 rounded-xl text-[17px] font-[700] transition-all shadow-2xl"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Get In Touch Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeIn}
        className="mb-24 max-w-7xl mx-auto px-6 lg:px-8"
      >
        <motion.div
          variants={fadeInUp}
          className="relative bg-[#1e2642]/50 border border-[#2a3350] rounded-3xl p-16 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/[0.05] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/[0.05] rounded-full blur-3xl" />

          <div className="relative text-center">
            {/* UPDATED: Applied silver gradient */}
            <h2 className="text-[48px] font-[700] mb-6 tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-200 to-slate-500 drop-shadow-[0_1px_0_rgba(255,255,255,0.06)]">
              Get In Touch
            </h2>
            <p className="text-[17px] text-slate-400 mb-12 max-w-2xl mx-auto font-[500]">
              Have questions or want to connect? Reach out through any of these channels
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={scaleIn}
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 bg-[#1e2642]/60 border border-[#2a3350] rounded-xl px-6 py-4 text-white hover:bg-[#252d48]/70 hover:border-[#3a4360] transition-all group"
                >
                  <social.icon className="w-6 h-6" strokeWidth={2} />
                  <span className="text-[16px] font-[600]">{social.name}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-[#2a3350] mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1e2642]/60 border border-[#2a3350] rounded-lg flex items-center justify-center">
                <span className="text-blue-300 text-xs font-bold">TIQ</span>
              </div>
              <span className="text-slate-500 text-[15px] font-[500]">
                © 2025 TalentIQ. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}