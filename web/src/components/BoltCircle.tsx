import clsx from "clsx";
import { Point } from "models/point";
import React, { ReactElement } from "react";
import BoltIcon from "./icons/BoltIcon";

interface Props {
  main?: boolean;
  active?: boolean;
  point: Point;
  onClick: (pointId: string) => void;
}

function BoltCircle(props: Props): ReactElement {
  let style = {};
  if (!props.main) {
    style = {
      WebkitTransform: "scale(0.75)",
      MozTransform: "scale(0.75)",
      OTransform: "scale(0.75)",
      transform: "scale(0.75)",
    };
  }

  return (
    <div
      onClick={() => props.onClick(props.point.id)}
      className={clsx(
        "cursor-pointer rounded-full h-16 w-16 flex items-center justify-center shadow-md z-20",
        props.active ? "bg-blue-200" : "bg-gray-100"
      )}
      style={style}
    >
      <div
        className={clsx(
          "rounded-full h-12 w-12 flex items-center justify-center z-20",
          props.active ? "bg-blue-400" : "bg-gray-200"
        )}
      >
        <BoltIcon />
      </div>
    </div>
  );
}

export default BoltCircle;
