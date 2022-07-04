import Breadcrumbs from "@/components/Breadcrumbs";
import CreateTask from "@/components/features/task/CreateTask";
import TaskList from "@/components/features/task/TaskList";
import Pill from "@/components/Pill";
import { useUnsafeParams } from "@/hooks/common";
import { ResourceType } from "@/models/resource";
import { useResource } from "@/queries/resourceQueries";
import { useTasks } from "@/queries/taskQueries";
import React, { Fragment, ReactElement } from "react";

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
  const { data: tasks } = useTasks(resourceId, {
    pagination: { page: 1, itemsPerPage: 1000 },
  });

  const ancestors = resource?.ancestors?.slice().reverse();
  const onlyRoot = ancestors?.length === 1;

  if (!resource) {
    return <Fragment />;
  }

  return (
    <div className="w-full h-full absolute inset-0 overflow-y-auto bg-gray-50 p-5 space-y-4">
      {!onlyRoot && <Breadcrumbs resources={ancestors} />}
      <div>
        <h1 className="text-2xl font-bold pb-1 flex items-start leading-none">
          Uppdrag
          <Pill className="ml-2">
            {
              tasks?.filter(
                (task) => task.status === "open" || task.status === "assigned"
              )?.length
            }
          </Pill>
        </h1>
        {resource.name !== undefined && (
          <span className="text-sm">
            {locationDescription(resource.name, resource.type)}
          </span>
        )}
      </div>
      <CreateTask resourceId={resourceId} />
      <TaskList resourceId={resourceId} />
    </div>
  );
};

export default TasksPage;
