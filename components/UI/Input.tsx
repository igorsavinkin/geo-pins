
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  className?: string;
  labelClassName?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, className, labelClassName, error, ...props }) => {
  const baseInputClasses = "mt-1 block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-slate-700 text-white placeholder-slate-400";
  const errorInputClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const finalLabelClasses = `block text-sm font-medium text-sky-300 ${labelClassName || ''}`;

  return (
    <div>
      {label && (
        <label htmlFor={id} className={finalLabelClasses}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`${baseInputClasses} ${error ? errorInputClasses : ''} ${className || ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
    