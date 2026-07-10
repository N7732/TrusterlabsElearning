import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  id,
  type = 'text',
  error,
  helpText,
  className = '',
  fullWidth = true,
  ...props
}, ref) => {
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={type}
          className={`
            block w-full rounded-lg border bg-white px-4 py-2.5 text-text-primary 
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border hover:border-slate-400'}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-danger" id={`${id}-error`}>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1.5 text-sm text-text-secondary" id={`${id}-help`}>
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
