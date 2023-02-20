import TaskButton from "@/components/features/task/TaskButton";
import { RoleContext } from "@/contexts/RoleContext";
import { useIsOwner } from "@/hooks/authHooks";
import { useUnsafeParams } from "@/hooks/common";
import { Link, Outlet } from "react-router-dom";

const Page = () => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const isOwner = useIsOwner(resourceId);

  return (
    <RoleContext.Provider value={{ isOwner }}>
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
