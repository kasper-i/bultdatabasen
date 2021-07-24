import React, { ReactNode } from "react";
import Connector from "./Connector";
import Edge from "./Edge";
import { Orientation } from "./Junction";
import Vertex from "./Vertex";

function reverseOrientation(orientation: Orientation) {
  switch (orientation) {
    case Orientation.NORTH:
      return Orientation.SOUTH;
    case Orientation.NORTH_EAST:
      return Orientation.SOUTH_WEST;
    case Orientation.SOUTH_EAST:
      return Orientation.NORTH_WEST;
    case Orientation.SOUTH:
      return Orientation.NORTH;
    case Orientation.SOUTH_WEST:
      return Orientation.NORTH_EAST;
    case Orientation.NORTH_WEST:
      return Orientation.SOUTH_EAST;
  }
}

interface Props {
  orientation: Orientation;
  main?: boolean;
  children: ReactNode;
}

function Branch({ orientation, main, children }: Props) {
  return (
    <Vertex orientation={orientation}>
      <Connector
        orientation={reverseOrientation(orientation)}
        half={
          orientation === Orientation.SOUTH || orientation === Orientation.NORTH
        }
      >
        <Edge dotted main={main} />
      </Connector>
      {children}
    </Vertex>
  );
}

export default Branch;
