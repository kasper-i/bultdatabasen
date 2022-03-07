import TaskButton from "@/components/features/task/TaskButton";
import { RoleContext } from "@/contexts/RoleContext";
import { useUnsafeParams } from "@/hooks/common";
import { useRole } from "@/queries/roleQueries";
import React from "react";
import { Link, Outlet } from "react-router-dom";

const Page = () => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const { role } = useRole(resourceId);

  return (
    <RoleContext.Provider value={{ role }}>
      <div className="absolute top-0 right-0 p-5">
        <Link to="tasks">
          <TaskButton resourceId={resourceId} />
        </Link>
      </div>
      <Outlet />
    </RoleContext.Provider>
  );
};

export default Page;
