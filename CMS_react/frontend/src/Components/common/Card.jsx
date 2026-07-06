import React from 'react';

const Card = ({
  children,
  className = '',
  hoverable = false,
  ...props
}) => {
  return (
    <div 
      className={`
        bg-white rounded-xl border border-border shadow-sm
        ${hoverable ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-border ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-text-primary leading-tight ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 border-t border-border bg-slate-50 rounded-b-xl flex items-center ${className}`}>
    {children}
  </div>
);

export default Card;
