import clsx from "clsx";
import { Point } from "models/point";
import React, { ReactElement } from "react";

interface Props {
  main?: boolean;
  active?: boolean;
  point: Point;
  onClick: (pointId: string) => void;
}

function BoltCircle({ main, active, point, onClick }: Props): ReactElement {
  let style = {};
  if (!main) {
    style = {
      WebkitTransform: "scale(0.75)",
      MozTransform: "scale(0.75)",
      OTransform: "scale(0.75)",
      transform: "scale(0.75)",
    };
  }

  return (
    <div
      onClick={() => onClick(point.id)}
      className={clsx(
        "cursor-pointer rounded-full h-16 w-16 flex items-center justify-center shadow-md z-20",
        active ? "bg-blue-200" : "bg-gray-100"
      )}
      style={style}
    >
      <div
        className={clsx(
          "rounded-full h-12 w-12 flex items-center justify-center z-20",
          active ? "bg-blue-400" : "bg-gray-200"
        )}
      >
        <span className="font-bold">{point.number}</span>
      </div>
    </div>
  );
}

export default BoltCircle;
