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
import { ActionIcon, Menu } from "@mantine/core";
import { IconEdit, IconMenu2, IconTrash } from "@tabler/icons-react";
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
    <div data-tailwind="flex flex-col">
      <PageHeader
        resourceId={resourceId}
        ancestors={route.ancestors}
        menu={
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon variant="light">
                <IconMenu2 size={14} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => naviate("edit")}
              >
                Redigera
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => setAction("delete")}
              >
                Radera
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        }
      />

      {action === "delete" && (
        <DeleteDialog
          mutation={deleteRoute}
          target="leden"
          onClose={() => setAction(undefined)}
        />
      )}

      <div data-tailwind="flex items-center gap-2">
        <p data-tailwind="text-sm">
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

      <div data-tailwind="mt-5">
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
