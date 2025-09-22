import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  helperText?: string;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  children,
  helperText,
  className = ''
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {helperText && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
};

export default FormField;