import { PermissionContext } from "@/contexts/PermissionContext";
import { Fragment, ReactNode, useContext } from "react";

interface Props {
  children: ReactNode;
}

const Restricted = ({ children }: Props) => {
  const { permissions } = useContext(PermissionContext);

  if (permissions.some((permission) => permission === "write")) {
    return <>{children}</>;
  }

  return <Fragment />;
};

export default Restricted;
