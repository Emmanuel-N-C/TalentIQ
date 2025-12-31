import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import Logo from '../../assets/Talentiqsymb.png';

export default function NavbarNew() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="bg-transparent backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-[68px]">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5"
          >
            {/* Logo Placeholder - Import your logo above and uncomment the img tag below */}
            <div className="w-8 h-8 bg-white/[0.06] rounded-lg flex items-center justify-center border border-white/[0.10] overflow-hidden">
              <img src={Logo} alt="TalentIQ Logo" className="w-full h-full object-contain" />
            </div>
            <span 
              className="text-[15px] font-[600] text-white tracking-[-0.01em]"
              style={{ fontFamily: '"Geist Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            >
              TalentIQ
            </span>
          </motion.div>

          {/* Center Navigation Links */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center gap-8"
          >
            <a href="#features" className="text-[14px] text-white/60 hover:text-white transition-colors font-[500]">Features</a>
            <a href="#how-it-works" className="text-[14px] text-white/60 hover:text-white transition-colors font-[500]">How It Works</a>
            <a href="#testimonials" className="text-[14px] text-white/60 hover:text-white transition-colors font-[500]">Testimonials</a>
            <a href="#faq" className="text-[14px] text-white/60 hover:text-white transition-colors font-[500]">FAQ</a>
          </motion.div>

          {/* Right Side - Auth Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login" 
                  className="text-white/70 hover:text-white transition-colors text-[14px] font-[500] px-4 py-2"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] text-white px-5 py-2 rounded-lg text-[14px] h-[38px] flex items-center transition-all font-[600]"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white/70 hover:text-white transition-colors text-[14px] font-[500] px-4 py-2"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.12] text-white px-5 py-2 rounded-lg text-[14px] h-[38px] flex items-center transition-all font-[600]"
                >
                  Get Started
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </nav>
  );
}