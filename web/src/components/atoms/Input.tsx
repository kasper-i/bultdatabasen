import { css } from "@emotion/css";
import { PencilIcon } from "@heroicons/react/24/outline";
import React, { FC, InputHTMLAttributes, LegacyRef, useId } from "react";
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
  icon?: typeof PencilIcon;
  inputRef?: LegacyRef<HTMLInputElement>;
  password?: boolean;
  tabIndex?: number;
  disabled?: boolean;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  labelStyle?: "above" | "none";
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
  autoComplete,
  labelStyle = "above",
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
          autoComplete={autoComplete}
          disabled={disabled}
          tabIndex={tabIndex ?? -1}
          ref={inputRef}
          type={password ? "password" : "text"}
          id={id}
          onChange={onChange}
          readOnly={!onChange}
          onClick={onClick}
          onFocus={(e) => (onClick ? e.target.blur() : undefined)}
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
