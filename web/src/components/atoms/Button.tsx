import { css, cx } from "@emotion/css";
import styled from "@emotion/styled";
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
  Size,
  Spacing,
} from "./constants";
import Icon from "./Icon";
import { IconType } from "./types";

export const StyledButton = styled.button<{
  color: Color;
  variant: "outlined" | "filled" | "subtle";
}>(
  ({ color, variant }) => `
  border: none;
  outline: none;
  font-size: ${FontSize.Sm};
  font-weight: ${FontWeight.SemiBold};
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

  &:focus {
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: ${Border.Thin} dotted ${color};
    outline-offset: ${Border.Thin};
  }
    
  &:active {
    transform: translateY(0.09375rem);
  }
    
  ${cx({
    [`
        color: ${color};
        background-color: transparent;
        border: ${Border.Thin} solid ${color};
        &:disabled {
          border-color: ${Color.Disabled};
          color: ${Color.Disabled};
        }

        &:not(:disabled):hover {
          background-color: ${chroma(color).alpha(0.1).hex()};
        }
  `]: variant === "outlined",
    [`
        background-color: ${color};
        color: ${Color.White};
        &:disabled {
          background-color: ${Color.Disabled};
        }

        &:not(:disabled):hover {
          background-color: ${chroma(color).alpha(0.9).hex()};
        }
  `]: variant === "filled",
    [`
        background-color: transparent;
        color: ${color};
        &:disabled {
          color: ${Color.Disabled};
        }

        &:not(:disabled):hover {
          background-color: ${chroma(color).alpha(0.1).hex()};
        }
  `]: variant === "subtle",
  })}
`
);

const StyledLoader = styled(Dots)`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  icon?: IconType;
  className?: string;
  color?: Color;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  variant?: "outlined" | "filled" | "subtle";
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
  variant = "filled",
  type,
}) => {
  return (
    <StyledButton
      onClick={(event) => {
        event.currentTarget.blur();
        onClick?.(event);
      }}
      disabled={disabled || loading}
      type={type}
      variant={variant}
      color={color}
      tabIndex={disabled ? -1 : undefined}
      className={cx(
        css`
          width: ${full ? "100%" : "min-content"};

          & > :not(${StyledLoader}) {
            visibility: ${loading ? "hidden" : "visible"};
          }
        `,
        className
      )}
    >
      {icon && <Icon name={icon} />}
      <span>{children}</span>
      {loading && <StyledLoader />}
    </StyledButton>
  );
};

export default Button;
