import clsx from "clsx";
import React, { ReactElement } from "react";

interface Props {
  main?: boolean;
  invisible?: true;
  dotted?: boolean;
}

function Edge({ invisible, main, dotted }: Props): ReactElement {
  return (
    <div
      className={clsx([
        "h-full",
        "w-full",
        "bg-transparent",
        "border-l-4",
        dotted && "border-dotted",
        invisible && "invisible",
        main ? "border-primary-500" : "border-gray-300",
      ])}
    ></div>
  );
}

export default Edge;
