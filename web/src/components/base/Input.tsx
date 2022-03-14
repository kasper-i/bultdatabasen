import React, { FC } from "react";

const Input: FC<{
  label: string;
  id: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}> = ({ label, id, placeholder, onChange, value }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="text"
        id={id}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm text-sm border-gray-300 rounded-md"
      />
    </div>
  );
};

export default Input;
