import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ModernGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  stagger?: boolean;
  delay?: number;
}

const ModernGrid: React.FC<ModernGridProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className,
  stagger = true,
  delay = 0
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger ? 0.1 : 0,
        delayChildren: delay
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1
    }
  };

  return (
    <motion.div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ 
            y: -4,
            transition: { duration: 0.2 }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ModernGrid;
