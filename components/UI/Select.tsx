
import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  id: string;
  options: SelectOption[];
  className?: string;
  labelClassName?: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, options, className, labelClassName, error, ...props }) => {
  const baseSelectClasses = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-slate-700 text-white";
  const errorSelectClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const finalLabelClasses = `block text-sm font-medium text-sky-300 ${labelClassName || ''}`;
  
  return (
    <div>
      {label && (
        <label htmlFor={id} className={finalLabelClasses}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`${baseSelectClasses} ${error ? errorSelectClasses : ''} ${className || ''}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value} className="bg-slate-700 text-white">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Select;
    