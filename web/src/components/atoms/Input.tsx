import { css } from "@emotion/css";
import React, { FC, LegacyRef, useId } from "react";
import {
  Border,
  Color,
  ExtendedColor,
  FontSize,
  Rounding,
  Shadow,
  Size,
} from "./constants";
import { Label } from "./Label";

const Input: FC<{
  label: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  onClick?: () => void;
  icon?: (props: React.ComponentProps<"svg">) => JSX.Element;
  inputRef?: LegacyRef<HTMLInputElement>;
  password?: boolean;
  tabIndex?: number;
  disabled?: boolean;
}> = ({
  label,
  placeholder,
  onChange,
  value,
  onClick,
  icon,
  inputRef,
  password,
  tabIndex,
  disabled,
}) => {
  const id = useId();

  const Icon = icon;

  return (
    <div>
      <Label htmlForId={id}>{label}</Label>
      <div
        className={css`
          position: relative;
          input {
            display: block;
            width: 100%;
            box-shadow: ${Shadow.Sm};
            font-size: ${FontSize.Sm};
            border-width: ${Border.Thin};
            border-radius: ${Rounding.Base};
            border-color: ${ExtendedColor.Input};
            height: ${Size.Base};
            &:focus {
              border-color: ${Color.Primary};
              outline: ${Color.Primary} solid ${Border.Thin};
              outline-offset: 0;
              & + div * {
                color: ${Color.Primary};
              }
            }
          }
          input[type="password"] {
            font-size: ${FontSize.Xl};
          }
        `}
      >
        <input
          disabled={disabled}
          tabIndex={tabIndex ?? -1}
          ref={inputRef}
          type={password ? "password" : "text"}
          id={id}
          onChange={onChange}
          readOnly={!onChange}
          onClick={onClick}
          placeholder={placeholder}
          value={value}
        />
        {Icon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <Icon className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;
