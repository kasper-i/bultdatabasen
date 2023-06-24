import { PermissionContext } from "@/contexts/PermissionContext";
import { usePermissions } from "@/hooks/authHooks";
import { useUnsafeParams } from "@/hooks/common";
import { Outlet } from "react-router-dom";

const Page = () => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const permissions = usePermissions(resourceId);

  return (
    <PermissionContext.Provider value={{ permissions }}>
      <Outlet />
    </PermissionContext.Provider>
  );
};

export default Page;
