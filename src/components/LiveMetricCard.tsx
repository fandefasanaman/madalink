import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LiveMetricCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  formatValue?: (value: number | string) => string;
  subtitle?: string;
}

const LiveMetricCard: React.FC<LiveMetricCardProps> = ({
  title,
  value,
  previousValue,
  icon: Icon,
  color,
  formatValue = (v) => v.toString(),
  subtitle
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  // Animation lors du changement de valeur
  useEffect(() => {
    if (displayValue !== value) {
      setIsAnimating(true);
      
      // Animation de transition
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  // Calculer la tendance si on a une valeur précédente
  const getTrend = () => {
    if (previousValue === undefined || typeof value !== 'number') return null;
    
    const diff = value - previousValue;
    if (diff > 0) return { type: 'up', value: diff };
    if (diff < 0) return { type: 'down', value: Math.abs(diff) };
    return { type: 'stable', value: 0 };
  };

  const trend = getTrend();

  return (
    <div className={`bg-gradient-to-br ${color} border border-opacity-30 rounded-2xl p-4 sm:p-6 transition-all duration-300 ${
      isAnimating ? 'scale-105 shadow-lg' : ''
    }`}>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
        <div className="flex-1">
          <p className={`text-lg sm:text-2xl font-semibold transition-all duration-300 ${
            isAnimating ? 'scale-110' : ''
          }`}>
            {formatValue(displayValue)}
          </p>
          <div className="flex items-center space-x-2">
            <p className="text-xs sm:text-sm opacity-80 truncate">{title}</p>
            {trend && trend.type !== 'stable' && (
              <div className={`flex items-center space-x-1 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
                trend.type === 'up' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {trend.type === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="text-xs">{trend.value}</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs opacity-60 mt-1 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMetricCard;