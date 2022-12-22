import { css, cx } from "@emotion/css";
import chroma from "chroma-js";
import React, { FC, ReactNode } from "react";
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
}) => {
  return (
    <button
      onClick={onClick}
      className={cx(
        {
          [css`
            color: ${color};
            border-width: ${Border.Thin};
            border-color: ${color};
            &:disabled {
              border-color: ${Color.Disabled};
              color: ${Color.Disabled};
            }
          `]: outlined,
          [css`
            background: ${color};
            color: ${Color.White};
            &:disabled {
              background: ${Color.Disabled};
            }
            &:not(:disabled) {
              &:hover,
              &:focus {
                background: ${chroma(color).darken(0.4).hex()};
              }
            }
          `]: !outlined,
        },
        css`
          display: inline;
          outline: none;
          height: ${Size.Base};
          line-height: calc(${Size.Base} - 0.75rem - 2px);
          padding: 0.375rem 0.75rem;
          box-shadow: ${Shadow.Sm};
          border-radius: ${Rounding.Base};
          white-space: nowrap;
          &:disabled {
            cursor: not-allowed;
          }
        `,
        {
          [css`
            width: 100%;
          `]: full,
        },
        className
      )}
      disabled={disabled}
    >
      <span
        className={cx(
          css`
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.375rem;
            font-size: ${FontSize.Sm};
            font-weight: ${FontWeight.Md};
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
                color: ${outlined ? color : chroma(color).brighten(4).hex()};
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
