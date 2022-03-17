import clsx from "clsx";
import React, { FC } from "react";
import { Windmill } from "react-activity";
import "react-activity/dist/Windmill.css";
import Icon from "./Icon";
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
        "relative flex justify-center items-center py-2 px-2 border border-transparent text-sm shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:ring-0",
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
      <Icon name={icon} className={clsx(loading && "invisible")} />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Windmill
            size={14}
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

export default IconButton;
