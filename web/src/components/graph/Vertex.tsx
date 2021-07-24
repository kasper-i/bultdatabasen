import clsx from "clsx";
import React, { ReactElement } from "react";
import { Orientation } from "./Junction";

interface Props {
  orientation?: Orientation;
  children?: React.ReactNode;
  debug?: boolean;
}

function Vertex({ orientation, children, debug }: Props): ReactElement {
  return (
    <div
      className={clsx(
        "absolute",
        "flex",
        "items-center",
        "justify-center",
        "w-full",
        "h-full",
        debug && ["ring-2", "ring-inset"],
        orientation === Orientation.SOUTH_EAST && ["left-full", "top-1/2"],
        orientation === Orientation.SOUTH_WEST && ["right-full", "top-1/2"],
        orientation === Orientation.NORTH_WEST && ["right-full", "bottom-1/2"],
        orientation === Orientation.NORTH_EAST && ["left-full", "bottom-1/2"],
        orientation === Orientation.SOUTH && ["top-full"],
        orientation === Orientation.NORTH && ["bottom-full"]
      )}
    >
      {children}
    </div>
  );
}

export default Vertex;
