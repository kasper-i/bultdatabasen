import clsx from "clsx";
import React, { FC } from "react";
import { Dots } from "react-activity";
import "react-activity/dist/Dots.css";
import Icon from "./Icon";
import { ColorType, IconType } from "./types";

export interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  icon?: IconType;
  className?: string;
  color?: ColorType;
  loading?: boolean;
  circular?: boolean;
  disabled?: boolean;
  full?: boolean;
}

const Button: FC<ButtonProps> = ({
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
        "relative flex justify-center items-center py-1.5 px-3 gap-1.5 border border-transparent text-sm shadow-sm rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:ring-0",
        disabled
          ? "bg-gray-400"
          : color === "danger"
          ? "bg-red-500 hover:bg-red-600 focus:ring-red-400"
          : "bg-primary-500 hover:bg-primary-600 focus:ring-primary-400",
        full && "w-full",
        className
      )}
      disabled={disabled}
    >
      {icon && <Icon name={icon} className={clsx(loading && "invisible")} />}
      <div className={clsx(loading && "invisible", "whitespace-nowrap")}>
        {children}
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Dots
            className={clsx(
              color === "danger" ? "text-danger-100" : "text-primary-100",
              "flex items-center"
            )}
          />
        </div>
      )}
    </button>
  );
};

export default Button;
