import React, { FC } from "react";

export const Underlined: FC = ({ children }) => {
  return (
    <span className="underline decoration-pink-500 decoration-dotted decoration-2">
      {children}
    </span>
  );
};
