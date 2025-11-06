import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function JobSeekerDashboard() {
  const { user } = useAuth();

  const dashboardCards = [
    {
      title: 'Browse Jobs',
      description: 'Explore available job opportunities',
      icon: '🔍',
      link: '/jobseeker/browse',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: 'Interview Prep',
      description: 'Practice with AI-powered questions',
      icon: '🎤',
      link: '/jobseeker/interview-prep',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      title: 'My Resumes',
      description: 'Manage your resumes',
      icon: '📄',
      link: '/jobseeker/resumes',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      title: 'Resume Optimizer',
      description: 'Get professional feedback to improve your CV',
      icon: '📝',
      link: '/jobseeker/resume-optimizer',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    },
    {
      title: 'ATS Checker',
      description: 'Check ATS score against specific jobs',
      icon: '🎯',
      link: '/jobseeker/ats-checker',
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
    },
    {
      title: 'Saved Jobs',
      description: 'View jobs you saved for later',
      icon: '💾',
      link: '/jobseeker/saved-jobs',
      color: 'bg-teal-50 hover:bg-teal-100 border-teal-200'
    },
    {
      title: 'My Applications',
      description: 'Track your job applications',
      icon: '📋',
      link: '/jobseeker/applications',
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Seeker Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name || user?.email}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className={`${card.color} border-2 rounded-lg p-6 transition-all hover:shadow-lg transform hover:scale-105`}
          >
            <div className="text-4xl mb-3">{card.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
            <p className="text-sm text-gray-600">{card.description}</p>
          </Link>
        ))}
      </div>

      {/* Quick Tips Section */}
      <div className="mt-12 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border-2 border-primary-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Quick Tips</h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">▸</span>
            <span>Upload your resume first to unlock ATS Checker features</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">▸</span>
            <span>Save jobs you're interested in for easy access later</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">▸</span>
            <span>Practice interview questions regularly to build confidence</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-600 mr-2">▸</span>
            <span>Check your ATS compatibility before applying to increase your chances</span>
          </li>
        </ul>
      </div>
    </div>
  );
}