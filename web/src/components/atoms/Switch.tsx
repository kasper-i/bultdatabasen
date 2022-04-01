import { Switch as HeadlessSwitch } from "@headlessui/react";
import React from "react";

interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const Switch = ({ enabled, onChange }: Props) => {
  return (
    <HeadlessSwitch
      checked={enabled}
      onChange={onChange}
      className={`${enabled ? "bg-primary-900" : "bg-primary-700"}
          relative inline-flex flex-shrink-0 h-[38px] w-[74px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={`${enabled ? "translate-x-9" : "translate-x-0"}
            pointer-events-none inline-block h-[34px] w-[34px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
      />
    </HeadlessSwitch>
  );
};
