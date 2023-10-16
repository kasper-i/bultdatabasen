import PointEditor from "@/components/features/routeEditor/PointEditor";
import TaskList from "@/components/features/task/TaskList";
import DeleteDialog from "@/components/molecules/DeleteDialog";
import PageHeader from "@/components/PageHeader";
import { useUnsafeParams } from "@/hooks/common";
import { usePoints } from "@/queries/pointQueries";
import { useDeleteRoute, useRoute } from "@/queries/routeQueries";
import { getParent } from "@/utils/resourceUtils";
import { renderRouteType } from "@/utils/routeUtils";
import { ActionIcon, Menu, Text } from "@mantine/core";
import { IconEdit, IconMenu2, IconTrash } from "@tabler/icons-react";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./RoutePage.module.css";

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
    <div className={classes.container}>
      <PageHeader
        className={classes.header}
        resourceId={resourceId}
        ancestors={route.ancestors}
        menu={
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon variant="outline" color="white">
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
      >
        <Text size="sm">
          {renderRouteType(routeType)}
          {year && <> från {year}</>}
          {" som "}
          {length && <> är {length}m lång och </>}
          har {numInstalledBolts} dokumenterade bult
          {numInstalledBolts !== 1 && "ar"}.
        </Text>
      </PageHeader>

      {action === "delete" && (
        <DeleteDialog
          mutation={deleteRoute}
          target="leden"
          onClose={() => setAction(undefined)}
        />
      )}

      <PointEditor
        routeId={resourceId}
        routeParentId={parentId}
        points={points}
      />

      <TaskList resourceId={resourceId} />
    </div>
  );
};

export default RoutePage;
