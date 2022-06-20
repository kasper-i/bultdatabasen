import clsx from "clsx";
import React, { FC, ReactNode } from "react";
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
  outlined?: boolean;
  children: ReactNode;
}

const Button: FC<ButtonProps> = ({
  children,
  icon,
  onClick,
  className,
  color = "primary",
  loading,
  disabled,
  full,
  outlined,
}) => {
  const solidStyle = () => {
    if (color === "white") {
      return false;
    }

    const colors: Record<Exclude<ColorType, "white">, string> = {
      danger: "bg-red-500 !disabled:hover:bg-red-600 focus:ring-red-400",
      primary:
        "bg-primary-500 !disabled:hover:bg-primary-600 focus:ring-primary-400",
    };

    return [colors[color], "text-white"];
  };

  const outlinedStyle = () => {
    const colors: Record<ColorType, string> = {
      danger:
        "text-red-500 border-2 border-red-500 !disabled:hover:border-red-600 !disabled:hover:text-red-600 focus:ring-red-400",
      primary:
        "text-primary-500 border-2 border-primary-500 !disabled:hover:border-primary-600 !disabled:hover:text-primary-600 focus:ring-primary-400",
      white: "text-white border-2 border-white focus:ring-white",
    };

    return colors[color];
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative h-[2.125rem] flex justify-center items-center py-1.5 px-3 gap-1.5 text-sm shadow-sm rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:ring-0",
        outlined ? outlinedStyle() : solidStyle(),
        "disabled:opacity-40",
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
              color === "danger"
                ? "text-danger-100"
                : color === "primary"
                ? "text-primary-100"
                : "text-white",
              "flex items-center"
            )}
          />
        </div>
      )}
    </button>
  );
};

export default Button;
