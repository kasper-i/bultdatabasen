import { RoleContext } from "contexts/RoleContext";
import React, { Fragment, ReactElement } from "react";
import { useContext } from "react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const Restricted = ({ children }: Props): JSX.Element => {
  const { role } = useContext(RoleContext);

  if (role != "owner") {
    return <Fragment />;
  }

  return <>{children}</>;
};

export default Restricted;
