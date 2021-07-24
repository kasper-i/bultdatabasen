import React, { ReactElement } from "react";
import clsx from "clsx";

export enum Orientation {
  NORTH,
  NORTH_EAST,
  SOUTH_EAST,
  SOUTH,
  SOUTH_WEST,
  NORTH_WEST,
}

interface Props {
  children?: React.ReactNode;
  compact: boolean;
  compressTop?: boolean;
  compressBottom?: boolean;
}

function Junction({
  children,
  compact,
  compressTop,
  compressBottom,
}: Props): ReactElement {
  return (
    <div>
      <div
        className={clsx(
          "relative w-16 h-16",
          compressTop ? "mt-0" : compact ? "mt-4" : "mt-8",
          compressBottom ? "mb-0" : compact ? "mb-4" : "mb-8"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default Junction;
