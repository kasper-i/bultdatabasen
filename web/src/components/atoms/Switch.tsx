import { Switch as HeadlessSwitch } from "@headlessui/react";
import clsx from "clsx";
import React from "react";

interface Props {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
}

export const Switch = ({ enabled, onChange, label }: Props) => {
  return (
    <HeadlessSwitch.Group>
      <div className="flex items-center">
        <HeadlessSwitch
          checked={enabled}
          onChange={onChange}
          className={clsx(
            enabled ? "bg-primary-500" : "bg-gray-300",
            "relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400"
          )}
        >
          <span
            className={clsx(
              enabled ? "translate-x-6" : "translate-x-1",
              "absolute inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
            )}
          />
        </HeadlessSwitch>
        <HeadlessSwitch.Label className="ml-2">{label}</HeadlessSwitch.Label>
      </div>
    </HeadlessSwitch.Group>
  );
};
