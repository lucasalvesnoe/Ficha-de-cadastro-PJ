import React from 'react';

interface TextInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'tel' | 'date';
  placeholder?: string;
  required?: boolean;
  // FIX: Add disabled prop to allow disabling the input field. This resolves errors in files that use this component with a disabled prop.
  disabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  // FIX: Destructure disabled prop with a default value.
  disabled = false,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        // FIX: Apply the disabled attribute to the input element and add styling for the disabled state.
        disabled={disabled}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition duration-150 ease-in-out disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
      />
    </div>
  );
};

export default TextInput;