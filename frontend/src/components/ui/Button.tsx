import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500/50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
    secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-700 text-white hover:from-secondary-700 hover:to-secondary-800 focus:ring-secondary-500/50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
    success: 'bg-gradient-to-r from-success-600 to-success-700 text-white hover:from-success-700 hover:to-success-800 focus:ring-success-500/50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
    warning: 'bg-gradient-to-r from-warning-600 to-warning-700 text-white hover:from-warning-700 hover:to-warning-800 focus:ring-warning-500/50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
    danger: 'bg-gradient-to-r from-danger-600 to-danger-700 text-white hover:from-danger-700 hover:to-danger-800 focus:ring-danger-500/50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500/50 bg-white/50 backdrop-blur-sm hover:shadow-lg transform hover:scale-105 active:scale-95',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500/50 hover:shadow-md transform hover:scale-105 active:scale-95',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -top-1 -left-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      
      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
      
      {/* Button content */}
      <span className={cn(
        "relative z-10 flex items-center justify-center transition-all duration-200",
        loading && "opacity-0"
      )}>
        {children}
      </span>
    </button>
  );
};

export default Button;
