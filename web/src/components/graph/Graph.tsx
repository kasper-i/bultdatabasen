import React, { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

function Graph({ children }: Props): ReactElement {
  return <div className="relative z-0 flex flex-col py-10">{children}</div>;
}

export default Graph;
