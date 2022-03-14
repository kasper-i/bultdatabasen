import clsx from "clsx";
import React, { FC } from "react";
import Icon from "./Icon";
import { Spinner } from "./Spinner";
import { ColorType, IconType } from "./types";

const Button: FC<{
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  icon?: IconType;
  className?: string;
  color?: ColorType;
  loading?: boolean;
  circular?: boolean;
  disabled?: boolean;
  full?: boolean;
}> = ({
  children,
  icon,
  onClick,
  className,
  color,
  loading,
  disabled,
  full,
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative flex justify-center items-center py-2 gap-2 border border-transparent text-sm shadow-sm rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:ring-0",
        disabled
          ? "bg-gray-400"
          : color === "danger"
          ? "bg-red-500 hover:bg-red-600 focus:ring-red-400"
          : "bg-primary-500 hover:bg-primary-600 focus:ring-primary-400",
        full && "w-full",
        children ? "px-4" : "px-2",
        className
      )}
      disabled={disabled}
    >
      {icon && <Icon name={icon} className={clsx(loading && "invisible")} />}
      <div className={clsx(loading && "invisible")}>{children}</div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </button>
  );
};

export default Button;
