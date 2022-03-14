import clsx from "clsx";
import React, { FC } from "react";
import Icon from "./Icon";
import { Spinner } from "./Spinner";
import { ColorType, IconType } from "./types";

const IconButton: FC<{
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  icon: IconType;
  className?: string;
  color?: ColorType;
  loading?: boolean;
  circular?: boolean;
  disabled?: boolean;
}> = ({ icon, onClick, className, color, loading, circular, disabled }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex justify-center items-center py-2 px-2 border border-transparent text-sm shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:ring-0",
        disabled
          ? "bg-gray-400"
          : color === "danger"
          ? "bg-red-500 hover:bg-red-600 focus:ring-red-400"
          : "bg-primary-500 hover:bg-primary-600 focus:ring-primary-400",
        circular ? "rounded-full" : "rounded-md",
        className
      )}
      disabled={disabled}
    >
      {loading ? <Spinner /> : <Icon name={icon} />}
    </button>
  );
};

export default IconButton;
