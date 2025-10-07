import React from 'react';
import { motion } from 'framer-motion';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'custom';
  intensity?: 'light' | 'medium' | 'strong';
  animated?: boolean;
  className?: string;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  variant = 'primary',
  intensity = 'medium',
  animated = true,
  className = ''
}) => {
  const gradients = {
    primary: {
      light: 'from-primary-50 via-white to-primary-100',
      medium: 'from-primary-100 via-primary-50 to-white',
      strong: 'from-primary-200 via-primary-100 to-primary-50'
    },
    secondary: {
      light: 'from-secondary-50 via-white to-secondary-100',
      medium: 'from-secondary-100 via-secondary-50 to-white',
      strong: 'from-secondary-200 via-secondary-100 to-secondary-50'
    },
    success: {
      light: 'from-success-50 via-white to-success-100',
      medium: 'from-success-100 via-success-50 to-white',
      strong: 'from-success-200 via-success-100 to-success-50'
    },
    warning: {
      light: 'from-warning-50 via-white to-warning-100',
      medium: 'from-warning-100 via-warning-50 to-white',
      strong: 'from-warning-200 via-warning-100 to-warning-50'
    },
    danger: {
      light: 'from-danger-50 via-white to-danger-100',
      medium: 'from-danger-100 via-danger-50 to-white',
      strong: 'from-danger-200 via-danger-100 to-danger-50'
    },
    custom: {
      light: 'from-blue-50 via-purple-50 to-pink-50',
      medium: 'from-blue-100 via-purple-100 to-pink-100',
      strong: 'from-blue-200 via-purple-200 to-pink-200'
    }
  };

  const gradientClass = `bg-gradient-to-br ${gradients[variant][intensity]}`;

  if (animated) {
    return (
      <motion.div
        className={`relative min-h-screen ${gradientClass} ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(0, 0, 0, 0), rgba(100, 116, 139, 0.1))',
              'linear-gradient(225deg, rgba(59, 130, 246, 0.1), rgba(0, 0, 0, 0), rgba(100, 116, 139, 0.1))',
              'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(0, 0, 0, 0), rgba(100, 116, 139, 0.1))'
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`min-h-screen ${gradientClass} ${className}`}>
      {children}
    </div>
  );
};

export default GradientBackground;
