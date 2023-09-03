import { css, cx } from "@emotion/css";
import React, { ButtonHTMLAttributes, FC, ReactNode } from "react";
import { Dots } from "react-activity";
import "react-activity/dist/Dots.css";
import {
  Border,
  Color,
  FontSize,
  FontWeight,
  Rounding,
  Size,
  Spacing,
} from "./constants";
import Icon from "./Icon";
import { IconType } from "./types";

export interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  icon?: IconType;
  className?: string;
  color?: Color;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  outlined?: boolean;
  children: ReactNode;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

const Button: FC<ButtonProps> = ({
  children,
  icon,
  onClick,
  className,
  color = Color.Primary,
  loading,
  disabled,
  full,
  outlined,
  type,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      className={cx(
        css`
          border: none;
          outline: none;
          font-size: ${FontSize.Sm};
          font-weight: ${FontWeight.Medium};
          cursor: pointer;
          height: ${Size.Input};
          padding: 0 ${Spacing.Sm};
          border-radius: ${Rounding.Base};
          white-space: nowrap;
          position: relative;
          gap: ${Spacing.Xxs};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: ${full ? "100%" : "min-content"};

          &:focus {
            outline: none;
          }

          &:disabled {
            cursor: not-allowed;
          }

          &:not(:disabled) {
            &:hover,
            &:active,
            &:focus {
              outline: solid ${Border.Thin} ${color};
              outline-offset: ${Border.Thin};
            }
          }

          & > :not(.rai-container) {
            visibility: ${loading ? "hidden" : "visible"};
          }

          & > .rai-container {
            position: absolute;
            inset: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        `,
        {
          [css`
            color: ${color};
            background-color: transparent;
            border: ${Border.Thin} solid ${color};
            &:disabled {
              border-color: ${Color.Disabled};
              color: ${Color.Disabled};
            }
          `]: outlined,
          [css`
            background-color: ${color};
            color: ${Color.White};
            &:disabled {
              background-color: ${Color.Disabled};
            }
          `]: !outlined,
        },
        className
      )}
    >
      {icon && <Icon name={icon} />}
      <span>{children}</span>
      {loading && <Dots />}
    </button>
  );
};

export default Button;
