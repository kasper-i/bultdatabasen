import React, { ReactElement, ReactNode } from "react";
import clsx from "clsx";

interface Props {
  children: ReactNode;
  expandable: boolean;
}

function Graph({ children, expandable }: Props): ReactElement {
  return (
    <div className={clsx("relative z-0 flex flex-col", expandable && "py-8")}>
      {children}
    </div>
  );
}

export default Graph;
