import { RoleContext } from "@/contexts/RoleContext";
import { Fragment, ReactNode, useContext } from "react";

interface Props {
  children: ReactNode;
}

const Restricted = ({ children }: Props) => {
  const { isOwner } = useContext(RoleContext);

  if (!isOwner) {
    return <Fragment />;
  }

  return <>{children}</>;
};

export default Restricted;
