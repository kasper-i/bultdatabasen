import Breadcrumbs from "@/components/Breadcrumbs";
import Restricted from "@/components/Restricted";
import CreateTask from "@/components/features/task/CreateTask";
import TaskList from "@/components/features/task/TaskList";
import { useUnsafeParams } from "@/hooks/common";
import { ResourceType } from "@/models/resource";
import { useResource } from "@/queries/resourceQueries";
import { Text, Title } from "@mantine/core";
import { Fragment, ReactElement } from "react";
import classes from "./TasksPage.module.css";

const locationDescription = (
  resourceName: string,
  resourceType: ResourceType
) => {
  switch (resourceType) {
    case "area":
    case "crag":
      return `i ${resourceName}`;
    case "sector":
    case "route":
      return `på ${resourceName}`;
    default:
      return undefined;
  }
};

const TasksPage = (): ReactElement => {
  const { resourceId } = useUnsafeParams<"resourceId">();
  const { data: resource } = useResource(resourceId);

  if (!resource) {
    return <Fragment />;
  }

  const ancestors = resource?.ancestors?.slice();
  ancestors?.push(resource);
  const onlyRoot = ancestors?.length === 1;

  return (
    <>
      {!onlyRoot && (
        <Breadcrumbs className={classes.breadcrumbs} resources={ancestors} />
      )}
      <Title order={1}>Uppdrag</Title>
      {resource.name !== undefined && (
        <Text size="sm">
          {locationDescription(resource.name, resource.type)}
        </Text>
      )}
      <Restricted>
        {resource.type === "route" && <CreateTask routeId={resourceId} />}
      </Restricted>
      <TaskList resourceId={resourceId} />
    </>
  );
};

export default TasksPage;
