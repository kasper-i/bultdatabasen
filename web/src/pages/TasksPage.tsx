import Breadcrumbs from "@/components/Breadcrumbs";
import CreateTask from "@/components/features/task/CreateTask";
import TaskList from "@/components/features/task/TaskList";
import Pill from "@/components/Pill";
import Restricted from "@/components/Restricted";
import { useUnsafeParams } from "@/hooks/common";
import { ResourceType } from "@/models/resource";
import { useResource } from "@/queries/resourceQueries";
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

  if (!resource) {
    return <Fragment />;
  }

  const ancestors = resource?.ancestors?.slice();
  ancestors?.push(resource);
  const onlyRoot = ancestors?.length === 1;

  return (
    <div data-tailwind="w-full h-full absolute inset-0 overflow-y-auto bg-gray-50 p-5 space-y-4">
      {!onlyRoot && <Breadcrumbs resources={ancestors} />}
      <div>
        <h1 data-tailwind="text-2xl font-bold pb-1 flex items-start leading-none">
          Uppdrag
          {(resource.counters?.openTasks ?? 0) > 0 && (
            <Pill data-tailwind="ml-2">{resource.counters?.openTasks}</Pill>
          )}
        </h1>
        {resource.name !== undefined && (
          <span data-tailwind="text-sm">
            {locationDescription(resource.name, resource.type)}
          </span>
        )}
      </div>
      <Restricted>
        {resource.type === "route" && <CreateTask routeId={resourceId} />}
      </Restricted>
      <TaskList resourceId={resourceId} />
    </div>
  );
};

export default TasksPage;
