import PointEditor from "@/components/features/routeEditor/PointEditor";
import { TaskAlert } from "@/components/features/task/TaskAlert";
import DeleteDialog from "@/components/molecules/DeleteDialog";
import PageHeader from "@/components/PageHeader";
import { Underlined } from "@/components/Underlined";
import { useUnsafeParams } from "@/hooks/common";
import { usePoints } from "@/queries/pointQueries";
import { useDeleteRoute, useRoute } from "@/queries/routeQueries";
import { getParent } from "@/utils/resourceUtils";
import { renderRouteType } from "@/utils/routeUtils";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RoutePage = () => {
  const { resourceId } = useUnsafeParams<"resourceId">();
  const naviate = useNavigate();
  const [action, setAction] = useState<"delete">();
  const deleteRoute = useDeleteRoute(resourceId);

  const { data: route } = useRoute(resourceId);
  const { data: points } = usePoints(resourceId);

  useEffect(() => {
    if (deleteRoute.isSuccess && route?.ancestors) {
      const parent = getParent(route.ancestors);
      naviate(`/${parent?.type}/${parent?.id}`);
    }
  }, [deleteRoute.isSuccess]);

  if (route === undefined || points === undefined) {
    return <Fragment />;
  }

  const { routeType, year, length } = route;
  const parentId = route.ancestors?.slice(-1)[0]?.id;

  const numInstalledBolts = route?.counters?.installedBolts ?? 0;

  if (!parentId) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        resourceId={resourceId}
        ancestors={route.ancestors}
        menuItems={[
          {
            label: "Radera",
            icon: "trash",
            className: "text-red-500",
            onClick: () => setAction("delete"),
          },
          {
            label: "Redigera",
            icon: "edit",
            onClick: () => naviate("edit"),
          },
        ]}
      />

      {action === "delete" && (
        <DeleteDialog
          mutation={deleteRoute}
          target="leden"
          onClose={() => setAction(undefined)}
        />
      )}

      <div className="flex items-center gap-2">
        <p className="text-sm">
          <Underlined>{renderRouteType(routeType)}</Underlined>
          {year && (
            <>
              {" "}
              från <Underlined>{year}</Underlined>
            </>
          )}
          {" som "}
          {length && (
            <>
              {" "}
              är <Underlined>{length}m</Underlined> lång och{" "}
            </>
          )}
          har <Underlined>{numInstalledBolts}</Underlined> dokumenterade bult
          {numInstalledBolts !== 1 && "ar"}.
        </p>
      </div>

      <TaskAlert openTasks={route.counters?.openTasks ?? 0} />

      <div className="mt-5">
        <PointEditor
          routeId={resourceId}
          routeParentId={parentId}
          points={points}
        />
      </div>
    </div>
  );
};

export default RoutePage;
