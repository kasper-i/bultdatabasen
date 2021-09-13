import { RoleContext } from "contexts/RoleContext";
import { useRole } from "queries/roleQueries";
import React, { ReactElement, ReactNode } from "react";
import { useParams } from "react-router-dom";

interface Props {
  children: ReactNode;
}

const SidePanel = ({ children }: Props): ReactElement => {
  const { resourceId } = useParams<{
    resourceId: string;
  }>();

  const { role } = useRole(resourceId);

  return (
    <RoleContext.Provider value={{ role }}>
      <div
        style={{ width: 300 }}
        className="fixed top-16 bottom-0 right-0 bg-white border-l-2 shadow-sm overflow-y-auto"
      >
        <div className="p-5 space-y-5">{children}</div>
      </div>
    </RoleContext.Provider>
  );
};

export default SidePanel;
