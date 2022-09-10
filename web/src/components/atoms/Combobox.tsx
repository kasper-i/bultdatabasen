import { Combobox as HeadlessCombobox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import React, { FC, Fragment, ReactNode, useState } from "react";
import Icon from "./Icon";
import { Option } from "./RadioGroup";

interface Props<T> {
  label: string;
  value?: T;
  options: Option<T>[];
  onSelect: (value: T) => void;
  displayValue: (value: T) => string;
  disabled?: boolean;
  noOptionsText?: string;
}

const EmptyState: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="cursor-default select-none py-2 px-4 text-gray-700">
      {children}
    </div>
  );
};

export function Combobox<T>({
  label,
  value,
  options,
  onSelect,
  displayValue,
  disabled,
  noOptionsText,
}: Props<T>) {
  const [query, setQuery] = useState("");

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          option.label
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  const renderOptions = () => {
    if (options.length === 0) {
      return <EmptyState>{noOptionsText}</EmptyState>;
    } else if (filteredOptions.length === 0) {
      return <EmptyState>Inga träffar</EmptyState>;
    } else {
      return filteredOptions.map((option, index) => (
        <HeadlessCombobox.Option
          key={option.key}
          value={option.value}
          className={({ active, disabled }) =>
            clsx(
              "select-none relative py-2 pl-8 pr-4",
              active ? "bg-primary-500 text-white" : "text-black",
              index !== filteredOptions.length - 1 &&
                "border-b border-gray-300",
              disabled ? "text-gray-300 cursor-default" : "cursor-pointer",
              index === 0 && "rounded-t-md",
              index === filteredOptions.length - 1 && "rounded-b-md"
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
        </HeadlessCombobox.Option>
      ));
    }
  };

  return (
    <HeadlessCombobox value={value} onChange={onSelect} disabled={disabled}>
      <HeadlessCombobox.Label className="block text-sm font-medium text-gray-700">
        {label}
      </HeadlessCombobox.Label>
      <div className="relative">
        <HeadlessCombobox.Button className="w-full">
          <HeadlessCombobox.Input
            displayValue={displayValue}
            onChange={(event) => setQuery(event.target.value)}
            className="focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm text-sm border border-gray-300 rounded-md h-[2.125rem]"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
        </HeadlessCombobox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <div className="absolute z-50 w-full">
            <HeadlessCombobox.Options className="w-full mt-2 mb-4 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
              {renderOptions()}
            </HeadlessCombobox.Options>
          </div>
        </Transition>
      </div>
    </HeadlessCombobox>
  );
}
