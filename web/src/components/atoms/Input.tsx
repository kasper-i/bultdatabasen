import React, { FC, useId } from "react";

const Input: FC<{
  label: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}> = ({ label, placeholder, onChange, value }) => {
  const id = useId();

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="text"
        id={id}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm text-sm border-gray-300 rounded-md h-[2.125rem]"
      />
    </div>
  );
};

export default Input;
