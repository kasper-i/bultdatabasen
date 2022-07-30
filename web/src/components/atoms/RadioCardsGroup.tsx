import clsx from "clsx";
import { isEqual } from "lodash";
import React, { useId } from "react";
import { Option } from "./RadioGroup";

interface Props<T> {
  value?: T;
  options: Option<T>[];
  onChange: (value: T | undefined) => void;
  label?: string;
}

const RadioCardsGroup = <T,>({ value, options, onChange, label }: Props<T>) => {
  const groupId = useId();

  return (
    <div>
      <label
        htmlFor={groupId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>

      <div id={groupId} className="flex flex-wrap items-center gap-2">
        {options.map(({ key, value: optionValue, label }) => {
          const optionId = useId();
          const selected = isEqual(optionValue, value);

          return (
            <div key={key}>
              <input
                id={optionId}
                type="radio"
                className="pointer-events-none opacity-0 fixed"
                defaultChecked={selected}
                onClick={() => onChange(selected ? undefined : optionValue)}
              />
              <label
                htmlFor={optionId}
                className={clsx(
                  "block text-sm border border-gray-300 shadow-sm rounded-md py-1.5 px-3 cursor-pointer",
                  selected
                    ? "border-primary-500 text-primary-500 font-medium"
                    : "text-gray-700"
                )}
              >
                {label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RadioCardsGroup;
