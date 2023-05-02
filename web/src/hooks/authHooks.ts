import { useLazyResource } from "@/queries/resourceQueries";
import { useRoles } from "@/queries/roleQueries";
import { selectUserId } from "@/slices/authSlice";
import { useSelector } from "react-redux";

export const useIsOwner = (resourceId: string): boolean => {
  const { data: resource } = useLazyResource(resourceId);
  const userId = useSelector(selectUserId);
  const { roles } = useRoles(userId);
  const ancestors = resource?.ancestors ?? [];

  const role = roles?.find((role) => role.resourceId === resourceId)?.role;
  if (role === "owner" || role === "maintainer") {
    return true;
  }

  return (
    ancestors
      .filter((ancestor) => ancestor.type !== "root")
      .flatMap(
        (ancestor) =>
          roles?.find((role) => role.resourceId === ancestor.id)?.role
      )
      .findIndex((role) => role === "owner" || role === "maintainer") !== -1
  );
};
