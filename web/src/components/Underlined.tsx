import React, { FC, ReactNode } from "react";

export const Underlined: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <span className="underline decoration-analogous-500 decoration-dotted decoration-2">
      {children}
    </span>
  );
};
