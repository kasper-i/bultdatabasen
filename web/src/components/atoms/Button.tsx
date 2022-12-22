import { css, cx } from "@emotion/css";
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
  const colorHex =
    color === "danger" ? "#EF4444" : color === "white" ? "white" : "#7D2AE8";

  const solidStyle = css`
    background: ${colorHex};
    color: white;
  `;

  const outlinedStyle = css`
    color: ${colorHex};
    border-width: 1px;
    border-color: ${colorHex};
  `;

  return (
    <button
      onClick={onClick}
      className={cx(
        css`
          outline: none;
          height: 2rem;
          line-height: calc(2rem - 0.75rem - 2px);
          padding: 0.375rem 0.75rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          border-radius: 0.25rem;
          white-space: nowrap;
          & > span {
            position: relative;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
          }
          &:hover,
          &:focus {
            filter: brightness(120%);
          }
          &:disabled {
            filter: grayscale(100%);
            opacity: 0.4;
          }
        `,
        outlined ? outlinedStyle : solidStyle,
        full &&
          css`
            width: 100%;
          `,
        loading &&
          css`
            & > span > :not(:last-child) {
              visibility: hidden;
            }
            & > span > :last-child {
              position: absolute;
              inset: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              color: ${colorHex};
              filter: saturate(300%);
            }
          `,
        className
      )}
      disabled={disabled}
    >
      <span>
        {icon && <Icon name={icon} />}
        <span>{children}</span>
        {loading && <Dots />}
      </span>
    </button>
  );
};

export default Button;
