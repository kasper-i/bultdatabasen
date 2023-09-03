import { css, cx } from "@emotion/css";
import styled from "@emotion/styled";
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

export const StyledButton = styled.button<{ color: Color; outlined?: boolean }>(
  ({ color, outlined }) => `
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

  ${cx({
    [`
        color: ${color};
        background-color: transparent;
        border: ${Border.Thin} solid ${color};
        &:disabled {
          border-color: ${Color.Disabled};
          color: ${Color.Disabled};
        }
  `]: outlined,
    [`
        background-color: ${color};
        color: ${Color.White};
        &:disabled {
          background-color: ${Color.Disabled};
        }
  `]: !outlined,
  })}
`
);

export const StyledLoader = styled(Dots)`
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
    <StyledButton
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      outlined={outlined}
      color={color}
      className={cx(
        css`
          width: ${full ? "100%" : "min-content"};

          & > :not(${StyledLoader}) {
            visibility: ${loading ? "hidden" : "visible"};
          }

          & > ${StyledLoader} {
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
