import React, { FC } from "react";

const Input: FC<Record<string, any>> = ({ children }) => {
  return <button className="bg-green-50 rounded p-2">{children}</button>;
};

export default Input;
