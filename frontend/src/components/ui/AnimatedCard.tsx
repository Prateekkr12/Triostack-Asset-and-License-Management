import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface AnimatedCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onDragEnter' | 'onDragLeave' | 'onDrop' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onTransitionEnd'> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'soft' | 'medium' | 'strong';
  border?: boolean;
  hover?: boolean;
  gradient?: boolean;
  glass?: boolean;
  delay?: number;
  duration?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  padding = 'md',
  shadow = 'soft',
  border = true,
  hover = true,
  gradient = false,
  glass = false,
  delay = 0,
  duration = 0.3,
  className,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowClasses = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    strong: 'shadow-strong',
  };

  const baseClasses = cn(
    'bg-white rounded-xl relative overflow-hidden',
    border && 'border border-secondary-200/50',
    paddingClasses[padding],
    shadowClasses[shadow],
    gradient && 'bg-gradient-to-br from-white to-secondary-50',
    glass && 'backdrop-blur-xl bg-white/80 border-white/20',
    className
  );

  return (
    <motion.div
      className={baseClasses}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={hover ? {
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
      {...props}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 pointer-events-none" />
      )}
      {glass && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default AnimatedCard;
