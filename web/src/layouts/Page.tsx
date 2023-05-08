import TaskButton from "@/components/features/task/TaskButton";
import { PermissionContext } from "@/contexts/PermissionContext";
import { usePermissions } from "@/hooks/authHooks";
import { useUnsafeParams } from "@/hooks/common";
import { Link, Outlet } from "react-router-dom";

const Page = () => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const permissions = usePermissions(resourceId);

  return (
    <PermissionContext.Provider value={{ permissions }}>
      <div className="absolute top-0 right-0 p-5">
        <Link to="tasks">
          <TaskButton resourceId={resourceId} />
        </Link>
      </div>
      <Outlet />
    </PermissionContext.Provider>
  );
};

export default Page;
