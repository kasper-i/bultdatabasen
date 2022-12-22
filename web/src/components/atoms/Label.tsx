import { css } from "@emotion/css";
import { FC, ReactNode } from "react";
import { ExtendedColor, FontSize, FontWeight } from "./constants";

export const Label: FC<{ children: ReactNode; htmlForId: string }> = ({
  children: label,
  htmlForId,
}) => {
  return (
    <label
      htmlFor={htmlForId}
      className={css`
        display: block;
        font-size: ${FontSize.Xs};
        font-weight: ${FontWeight.Md};
        color: ${ExtendedColor.Label};
        margin-bottom: 0.25rem;
      `}
    >
      {label}
    </label>
  );
};
