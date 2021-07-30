import { RoleContext } from "contexts/RoleContext";
import React, { Fragment, ReactNode, useContext } from "react";

interface Props {
  children: ReactNode;
}

const Restricted = ({ children }: Props): JSX.Element => {
  const { role } = useContext(RoleContext);

  if (role !== "owner") {
    return <Fragment />;
  }

  return <>{children}</>;
};

export default Restricted;
