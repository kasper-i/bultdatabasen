import React, { ReactElement, ReactNode } from "react";
import Edge from "./Edge";
import { Orientation } from "./Junction";

interface Props {
  orientation: Orientation;
  main?: boolean;
  children?: ReactNode;
  half?: boolean;
}

function Connector({ orientation, children, half }: Props): ReactElement {
  let style: React.CSSProperties = {
    transformOrigin: "50% bottom",
    bottom: "50%",
    height: "111.8033%",
    zIndex: -10,
  };

  switch (orientation) {
    case Orientation.NORTH:
      style = { ...style, height: `${half ? "100" : "200"}%` };
      break;
    case Orientation.SOUTH:
      style = {
        ...style,
        height: `${half ? "100" : "200"}%`,
        transform: "rotate(180deg) scaleX(-1)",
      };
      break;
    case Orientation.NORTH_EAST:
      style = {
        ...style,
        transform: "rotate(63.43deg)",
      };
      break;
    case Orientation.SOUTH_EAST:
      style = {
        ...style,
        transform: "rotate(116.57deg)",
      };
      break;
    case Orientation.SOUTH_WEST:
      style = {
        ...style,
        transform: "rotate(243.43deg)",
      };
      break;
    case Orientation.NORTH_WEST:
      style = {
        ...style,
        transform: "rotate(296.57deg)",
      };
      break;
  }

  return (
    <div className="absolute" style={style}>
      <div className="flex w-full h-full">
        {React.Children.count(children) % 2 === 0 && <Edge invisible />}
        {children}
      </div>
    </div>
  );
}

export default Connector;
