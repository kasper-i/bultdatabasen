import clsx from "clsx";
import React from "react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

const Pill = ({ children, className }: Props) => {
  return (
    <div
      className={clsx([
        className,
        "w-min bg-red-500 rounded-full h-5 flex justify-center items-center px-2 text-xs font-bold text-white",
      ])}
    >
      {children}
    </div>
  );
};

export default Pill;
