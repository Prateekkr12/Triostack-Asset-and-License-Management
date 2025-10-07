import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="w-full group">
      {label && (
        <label 
          htmlFor={inputId} 
          className={cn(
            "block text-sm font-medium mb-2 transition-colors duration-200",
            error 
              ? "text-danger-700" 
              : isFocused 
                ? "text-primary-700" 
                : "text-secondary-700 group-hover:text-secondary-900"
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={cn(
            "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200",
            error 
              ? "text-danger-400" 
              : isFocused 
                ? "text-primary-500" 
                : "text-secondary-400 group-hover:text-secondary-500"
          )}>
            <div className="h-5 w-5">{leftIcon}</div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'block w-full rounded-xl border-2 px-4 py-3 text-sm placeholder-secondary-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-0 bg-white/50 backdrop-blur-sm',
            leftIcon ? 'pl-12' : 'pl-4',
            rightIcon ? 'pr-12' : 'pr-4',
            error
              ? 'border-danger-300 text-danger-900 placeholder-danger-300 focus:border-danger-500 focus:ring-danger-500/20 shadow-danger-100'
              : 'border-secondary-200 text-secondary-900 placeholder-secondary-400 focus:border-primary-500 focus:ring-primary-500/20 shadow-secondary-100 group-hover:border-secondary-300 group-hover:shadow-md',
            isFocused && 'shadow-lg scale-[1.02]',
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className={cn(
              "h-5 w-5 transition-colors duration-200",
              error 
                ? "text-danger-400" 
                : isFocused 
                  ? "text-primary-500" 
                  : "text-secondary-400 group-hover:text-secondary-500"
            )}>
              {rightIcon}
            </div>
          </div>
        )}

        {/* Focus ring effect */}
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-xl ring-4 ring-primary-500/20 pointer-events-none animate-pulse"></div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-center space-x-1 animate-slide-down">
          <div className="w-1 h-1 bg-danger-500 rounded-full"></div>
          <p className="text-sm text-danger-600 font-medium">{error}</p>
        </div>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-secondary-500 animate-fade-in">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
