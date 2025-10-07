import React from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder,
  className,
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'block w-full rounded-lg border px-3 py-2 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer',
            error
              ? 'border-danger-300 text-danger-900 focus:border-danger-500 focus:ring-danger-500'
              : 'border-secondary-300 text-secondary-900 focus:border-primary-500 focus:ring-primary-500',
            className
          )}
          value={props.value || ''}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="h-5 w-5 text-secondary-400" />
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary-500">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
