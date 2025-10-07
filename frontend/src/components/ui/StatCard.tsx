import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  delay?: number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  delay = 0,
  className
}) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    danger: 'from-danger-500 to-danger-600',
    secondary: 'from-secondary-500 to-secondary-600'
  };

  const iconColorClasses = {
    primary: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
    secondary: 'text-secondary-600'
  };

  return (
    <motion.div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft border border-secondary-200/50',
        'hover:shadow-medium transition-all duration-300',
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
    >
      {/* Background gradient */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300',
        colorClasses[color]
      )} />
      
      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-10"
        initial={{ scale: 0, rotate: 0 }}
        whileHover={{ 
          scale: 1.2, 
          rotate: 5,
          transition: { duration: 0.3 }
        }}
      >
        <div className={cn(
          'w-full h-full bg-gradient-to-br from-transparent via-current to-transparent',
          iconColorClasses[color]
        )} />
      </motion.div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-600 mb-1">
              {title}
            </p>
            <motion.p 
              className="text-3xl font-bold text-secondary-900"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.3 }}
            >
              {value}
            </motion.p>
            {trend && (
              <motion.div 
                className={cn(
                  'flex items-center mt-2 text-sm font-medium',
                  trend.isPositive ? 'text-success-600' : 'text-danger-600'
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.4, duration: 0.3 }}
              >
                <span className="mr-1">
                  {trend.isPositive ? '↗' : '↘'}
                </span>
                {Math.abs(trend.value)}%
              </motion.div>
            )}
          </div>
          
          <motion.div
            className={cn(
              'p-3 rounded-xl bg-gradient-to-br shadow-sm',
              colorClasses[color]
            )}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: delay + 0.3, 
              duration: 0.5,
              type: "spring",
              stiffness: 200
            }}
            whileHover={{ 
              scale: 1.1, 
              rotate: 5,
              transition: { duration: 0.2 }
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
