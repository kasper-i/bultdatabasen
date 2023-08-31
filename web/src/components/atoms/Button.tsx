import { css, cx } from "@emotion/css";
import chroma from "chroma-js";
import React, { ButtonHTMLAttributes, FC, ReactNode } from "react";
import { Dots } from "react-activity";
import "react-activity/dist/Dots.css";
import {
  Border,
  Color,
  FontSize,
  FontWeight,
  Rounding,
  Shadow,
  Size,
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
      className={cx(
        css`
          border: none;
          font-size: ${FontSize.Sm};
          font-weight: ${FontWeight.Md};
          cursor: pointer;
          display: inline;
          outline: none;
          &:focus {
            outline: none;
          }
          height: ${Size.Base};
          line-height: calc(${Size.Base} - 0.75rem - 2px);
          padding: 0.375rem 0.75rem;
          border-radius: ${Rounding.Base};
          white-space: nowrap;
          &:disabled {
            cursor: not-allowed;
          }
          &:active {
            transform: scale(0.95);
            transform-origin: center;
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
            border: none;
            &:disabled {
              background-color: ${Color.Disabled};
            }
            &:not(:disabled) {
              &:hover,
              &:focus {
                background-color: ${chroma(color).darken(0.4).hex()};
              }
            }
          `]: !outlined,
          [css`
            width: 100%;
          `]: full,
        },
        className
      )}
      disabled={disabled || loading}
      type={type}
    >
      <span
        className={cx(
          css`
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.375rem;
          `,
          {
            [css`
              & > :not(:last-child) {
                visibility: hidden;
              }
              & > :last-child {
                position: absolute;
                inset: 0;
                display: flex;
                justify-content: center;
                align-items: center;
              }
            `]: loading,
          }
        )}
      >
        {icon && <Icon name={icon} />}
        <span>{children}</span>
        {loading && <Dots />}
      </span>
    </button>
  );
};

export default Button;
