import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { FC } from "react";
import Icon from "../atoms/Icon";
import { IconType } from "../atoms/types";

export interface MenuItem {
  icon?: IconType;
  className?: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Menu: FC<{ items: MenuItem[] }> = ({ items }) => {
  return (
    <div className="text-right">
      <HeadlessMenu as="div" className="relative inline-block text-left">
        <div>
          <HeadlessMenu.Button>
            <EllipsisVerticalIcon className="h-4 w-4" />
          </HeadlessMenu.Button>
        </div>
        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <HeadlessMenu.Items className="bg-white absolute z-50 w-36 right-0 mt-1 origin-top-right divide-y divide-gray-100 rounded-md shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="divide-y">
              {items.map(({ label, className, onClick, icon, disabled }) => (
                <HeadlessMenu.Item key={label} disabled={disabled}>
                  {({ active, disabled }) => (
                    <div
                      className={clsx(
                        "relative py-1.5 first:rounded-t-md last:rounded-b-md",
                        active && "bg-neutral-50",
                        disabled ? "cursor-not-allowed" : "cursor-pointer",
                        className
                      )}
                      onClick={onClick}
                    >
                      {icon && (
                        <div className="absolute inset-y-0 left-2 h-full flex items-center">
                          <Icon name={icon} />
                        </div>
                      )}
                      <p
                        className={clsx(
                          "ml-8 mr-1.5",
                          disabled && "opacity-20"
                        )}
                      >
                        {label}
                      </p>
                    </div>
                  )}
                </HeadlessMenu.Item>
              ))}
            </div>
          </HeadlessMenu.Items>
        </Transition>
      </HeadlessMenu>
    </div>
  );
};
