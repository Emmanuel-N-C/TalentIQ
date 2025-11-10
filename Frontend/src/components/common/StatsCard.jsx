import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up', 
  color = 'blue',
  subtitle 
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="bg-white dark:bg-dark-secondary rounded-2xl p-6 shadow-soft dark:shadow-dark hover:shadow-lg dark:hover:shadow-dark transition-all transform hover:-translate-y-1 border border-gray-100 dark:border-dark-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
      </div>
      
      {change && (
        <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-dark-700">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
            vs last month
          </span>
        </div>
      )}
    </div>
  );
}