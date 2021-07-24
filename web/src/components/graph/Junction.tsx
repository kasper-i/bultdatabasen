import React, { ReactElement } from "react";

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
}

function Junction({ children }: Props): ReactElement {
  return (
    <div>
      <div className={`relative w-20 h-20 mt-10 mb-10`}>{children}</div>
    </div>
  );
}

export default Junction;
