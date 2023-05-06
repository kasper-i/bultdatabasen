import { Permission } from "@/models/permission";
import { UserRole } from "@/models/role";
import { useLazyResource } from "@/queries/resourceQueries";
import { useRoles } from "@/queries/roleQueries";
import { selectUserId } from "@/slices/authSlice";
import { useMemo } from "react";
import { useSelector } from "react-redux";

const roleToPermissions = (role: UserRole): Permission[] => {
  switch (role) {
    case "owner":
    case "maintainer":
      return ["read", "write"];
    default:
      return ["read"];
  }
};

export const usePermissions = (resourceId: string): Permission[] => {
  const { data: resource } = useLazyResource(resourceId);
  const userId = useSelector(selectUserId);
  const { roles } = useRoles(userId);
  const ancestors = resource?.ancestors ?? [];

  return useMemo(() => {
    const permissions: Set<Permission> = new Set();

    const role = roles?.find((role) => role.resourceId === resourceId)?.role;
    if (role) {
      roleToPermissions(role).forEach((permission) =>
        permissions.add(permission)
      );
    }

    ancestors
      .filter((ancestor) => ancestor.type !== "root")
      .forEach((ancestor) => {
        const role = roles?.find(
          (role) => role.resourceId === ancestor.id
        )?.role;

        if (role) {
          roleToPermissions(role).forEach((permission) =>
            permissions.add(permission)
          );
        }
      });

    return [...permissions.values()];
  }, [resourceId, roles, ancestors]);
};
