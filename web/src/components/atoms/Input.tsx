import clsx from "clsx";
import React, { FC, LegacyRef, useId } from "react";

const Input: FC<{
  label: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  onClick?: () => void;
  icon?: (props: React.ComponentProps<"svg">) => JSX.Element;
  inputRef?: LegacyRef<HTMLInputElement>;
  password?: boolean;
}> = ({
  label,
  placeholder,
  onChange,
  value,
  onClick,
  icon,
  inputRef,
  password,
}) => {
  const id = useId();

  const Icon = icon;

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type={password ? "password" : "text"}
          id={id}
          onChange={onChange}
          readOnly={!onChange}
          onClick={onClick}
          onFocus={(e) => (onClick ? e.target.blur() : undefined)}
          placeholder={placeholder}
          value={value}
          className={clsx(
            "mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm text-sm border-gray-300 rounded-md h-[2.125rem]",
            password && "text-xl tracking-wide"
          )}
        />
        {Icon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <Icon className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;
