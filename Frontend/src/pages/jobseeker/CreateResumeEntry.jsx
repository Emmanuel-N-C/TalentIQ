import { useNavigate } from 'react-router-dom';
import { FilePlus, Sparkles, Upload } from 'lucide-react';

export default function CreateResumeEntry() {
  const navigate = useNavigate();

  const options = [
    {
      id: 'manual',
      title: 'Create New Resume',
      description: 'Start from scratch – add your details step by step manually',
      icon: FilePlus,
      mode: 'manual',
      highlight: false
    },
    {
      id: 'ai',
      title: 'Create with AI Assistance',
      description: 'Let AI build a tailored, optimized resume for you',
      icon: Sparkles,
      mode: 'ai',
      highlight: true
    },
    {
      id: 'import',
      title: 'Import Already Existing',
      description: 'Upload your current CV – we\'ll reformat, enhance and optimize it',
      icon: Upload,
      mode: 'import',
      highlight: false
    }
  ];

  const handleCardClick = (mode) => {
    navigate(`/jobseeker/resumes/new?mode=${mode}&step=template`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            How do you want to create your resume?
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Choose your starting point – we'll guide you to a professional CV in minutes.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleCardClick(option.mode)}
                className={`
                  relative flex flex-col justify-between items-center text-center
                  p-8 rounded-xl cursor-pointer transition-all duration-300
                  ${option.highlight 
                    ? 'border-2 border-indigo-500 bg-gray-800/70 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30' 
                    : 'border border-gray-700 bg-gray-800/50 hover:border-indigo-500'
                  }
                  hover:scale-105 transform
                `}
              >
                {/* Highlight Badge */}
                {option.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      RECOMMENDED
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className="mb-4">
                  <Icon className={`h-10 w-10 mx-auto ${option.highlight ? 'text-indigo-400' : 'text-indigo-400'}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {option.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed">
                  {option.description}
                </p>

                {/* Decorative Arrow/Indicator */}
                <div className="mt-6 text-indigo-400 text-sm font-medium flex items-center gap-2">
                  Get Started
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Don't worry – you can always edit and customize your resume after creation
          </p>
        </div>
      </div>
    </div>
  );
}