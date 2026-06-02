import { useState } from 'react';

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
  required?: boolean;
}

export default function Input({ label, type = 'text', value, onChange, error, disabled, className = '', autoComplete, required }: InputProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className={`relative rounded-[14px] border-2 transition-all duration-200 ${error ? 'border-red-300 bg-red-50/50 dark:bg-red-900/20' : active ? 'border-[#6C4CF1] bg-white dark:bg-gray-900' : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'}`}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className="w-full bg-transparent px-4 pt-5 pb-2 text-sm text-gray-900 dark:text-gray-100 placeholder-transparent disabled:opacity-50 transition-colors"
          placeholder={label}
        />
        <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${active ? 'text-[11px] text-[#6C4CF1] top-1.5' : 'text-sm text-gray-400 dark:text-gray-500 top-3.5'}`}>
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      </div>
      {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 ml-1">{error}</p>}
    </div>
  );
}
