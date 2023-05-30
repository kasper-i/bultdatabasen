import { isDefined } from "@/utils/common";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { isArray } from "lodash-es";
import { FC, Fragment, ReactNode } from "react";
import Icon from "./Icon";
import IconButton from "./IconButton";
import { Option } from "./RadioGroup";

type Props<T> = {
  label: string;
  disabled?: boolean;
  noOptionsText?: string;
  options: Option<T>[];
} & (
  | {
      value?: T;
      onSelect: (value: T) => void;
      displayValue?: (value: T) => string;
      multiple: false;
    }
  | {
      value: T[];
      onSelect: (value: T[]) => void;
      displayValue?: (value: T[]) => string;
      multiple: true;
    }
);

const EmptyState: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="cursor-default select-none py-2 px-4 text-gray-700">
      {children}
    </div>
  );
};

export function Select<T>({
  label,
  value,
  options,
  onSelect,
  displayValue,
  disabled,
  noOptionsText,
  multiple,
}: Props<T>) {
  const renderOptions = () => {
    if (options.length === 0) {
      return <EmptyState>{noOptionsText}</EmptyState>;
    } else {
      return options.map((option, index) => (
        <Listbox.Option
          key={option.key}
          value={option.value}
          className={({ active, disabled }) =>
            clsx(
              "select-none relative py-2 pl-8 pr-4",
              active ? "bg-primary-500 text-white" : "text-black",
              index !== options.length - 1 && "border-b border-gray-300",
              disabled ? "text-gray-300 cursor-default" : "cursor-pointer",
              index === 0 && "rounded-t-md",
              index === options.length - 1 && "rounded-b-md"
            )
          }
          disabled={option.disabled}
        >
          {({ selected, active }) => (
            <>
              <span
                className={clsx(
                  "block truncate",
                  selected ? "font-medium" : "font-normal"
                )}
              >
                {option.label}
              </span>
              {selected && (
                <span className="absolute inset-y-0 left-2 flex items-center">
                  <Icon
                    name="check"
                    className={clsx(active ? "text-white" : "text-primary-500")}
                  />
                </span>
              )}
              {option.sublabel && (
                <span className="absolute inset-y-0 right-4 flex items-center">
                  {option.sublabel}
                </span>
              )}
            </>
          )}
        </Listbox.Option>
      ));
    }
  };

  const lookupOption = (value: T) =>
    options.find((option) => option.value === value);

  const removeOption = (valueToRemove: T) => {
    if (multiple) {
      onSelect(value.filter((v) => v !== valueToRemove));
    }
  };

  const renderLabel = (): string => {
    if (!value) {
      return "";
    }

    if (displayValue) {
      return multiple ? displayValue(value) : displayValue(value);
    }

    if (isArray(value)) {
      switch (value.length) {
        case 0:
          return "";
        case 1:
          return `${lookupOption(value[0])?.label}`;
        default:
          return `${lookupOption(value[0])?.label} (+${value.length - 1})`;
      }
    } else {
      return `${lookupOption(value)?.label}`;
    }
  };

  const renderTags = () => (
    <div className="flex flex-wrap gap-1.5 mb-1.5">
      {multiple &&
        value
          .map(lookupOption)
          .filter(isDefined)
          .map(({ key, label, value }) => (
            <div
              key={key}
              className="flex items-center gap-0.5 bg-primary-500 text-white text-xs font-medium py-0.5 px-1.5 rounded-md"
            >
              {label}
              <IconButton
                className="cursor-pointer"
                icon="x"
                tiny
                color="white"
                onClick={() => removeOption(value)}
              />
            </div>
          ))}
    </div>
  );

  return (
    <div className="w-full">
      <Listbox
        value={value}
        onChange={onSelect}
        disabled={disabled}
        multiple={multiple}
        as="div"
      >
        <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </Listbox.Label>
        {multiple && value.length > 0 && renderTags()}
        <div className="relative">
          <Listbox.Button className="focus:outline-none bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm text-sm border border-gray-300 rounded-md h-[2.125rem]">
            <span className="block truncate text-left ml-3">
              {value && renderLabel()}
            </span>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute z-50 w-full">
              <Listbox.Options className="w-full max-h-72 overflow-y-auto mt-2 mb-4 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
                {renderOptions()}
              </Listbox.Options>
            </div>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
