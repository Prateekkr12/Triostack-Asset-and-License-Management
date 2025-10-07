import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'soft' | 'medium' | 'strong';
  border?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  shadow = 'soft',
  border = true,
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

  return (
    <div
      className={cn(
        'bg-white rounded-lg',
        border && 'border border-secondary-200',
        paddingClasses[padding],
        shadowClasses[shadow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={cn('border-b border-secondary-200 pb-4 mb-4', className)}
    {...props}
  >
    {children}
  </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
  ...props
}) => (
  <h3
    className={cn('text-lg font-semibold text-secondary-900', className)}
    {...props}
  >
    {children}
  </h3>
);

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className,
  ...props
}) => (
  <p
    className={cn('text-sm text-secondary-600 mt-1', className)}
    {...props}
  >
    {children}
  </p>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={cn('border-t border-secondary-200 pt-4 mt-4', className)}
    {...props}
  >
    {children}
  </div>
);

export default Card;
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
