import React, { useId } from "react";

export interface Option<T> {
  value: T;
  label: string;
}

interface Props<T> {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}

const RadioGroup = <T extends string>({
  value,
  options,
  onChange,
}: Props<T>) => {
  return (
    <div className="space-y-2">
      {options.map(({ value: optionValue, label }) => {
        const elementId = useId();

        return (
          <div key={optionValue} className="flex items-center">
            <input
              id={elementId}
              type="radio"
              className="h-4 w-4 focus:ring-primary-500 text-primary-500 border-gray-300"
              onChange={(event) =>
                event.currentTarget.checked && onChange(optionValue)
              }
              checked={optionValue === value}
            />
            <label
              htmlFor={elementId}
              className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer"
            >
              {label}
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default RadioGroup;
