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
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition duration-150 ease-in-out"
      />
    </div>
  );
};

export default TextInput;