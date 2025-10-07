import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface AnimatedButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onDragEnter' | 'onDragLeave' | 'onDrop' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onTransitionEnd'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  gradient?: boolean;
  glow?: boolean;
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  gradient = false,
  glow = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500',
    ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500 border border-secondary-300'
  };

  const gradientClasses = gradient ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800' : '';
  const glowClasses = glow ? 'shadow-lg hover:shadow-xl hover:shadow-primary-500/25' : '';

  return (
    <motion.button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        gradientClasses,
        glowClasses,
        className
      )}
      disabled={disabled || loading}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 to-transparent"
          animate={{
            opacity: [0, 1, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      <div className="relative z-10 flex items-center">
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <motion.div
            className="mr-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {icon}
          </motion.div>
        )}
        
        <span>{children}</span>
        
        {!loading && icon && iconPosition === 'right' && (
          <motion.div
            className="ml-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};

export default AnimatedButton;
