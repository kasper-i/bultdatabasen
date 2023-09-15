import { cx } from "@emotion/css";
import styled from "@emotion/styled";
import React, { FC } from "react";
import { Windmill } from "react-activity";
import "react-activity/dist/Windmill.css";
import { StyledButton } from "./Button";
import { Color, Size } from "./constants";
import Icon from "./Icon";
import { IconType } from "./types";

export interface IconButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  icon: IconType;
  className?: string;
  color?: Color;
  loading?: boolean;
  circular?: boolean;
  disabled?: boolean;
  tiny?: boolean;
  variant?: "outlined" | "filled" | "subtle";
}

const IconButton: FC<IconButtonProps> = ({
  icon,
  onClick,
  className,
  color = Color.Primary,
  loading,
  circular,
  disabled,
  variant = "filled",
  tiny,
}) => {
  const StyledLoaderContainer = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const StyledIconButton = styled(StyledButton)`
    border-radius: ${circular ? "50%" : undefined};
    width: ${Size.Input};
    padding-left: 0;
    padding-right: 0;

    ${cx({
      [`
        width: ${Size.SmallIcon};
        height: ${Size.SmallIcon};
     `]: tiny,
    })}
  `;

  return (
    <StyledIconButton
      onClick={onClick}
      className={className}
      disabled={disabled}
      variant={tiny ? "subtle" : variant}
      color={color}
    >
      {loading ? (
        <StyledLoaderContainer>
          <Windmill size={14} />
        </StyledLoaderContainer>
      ) : (
        <Icon name={icon} />
      )}
    </StyledIconButton>
  );
};

export default IconButton;
