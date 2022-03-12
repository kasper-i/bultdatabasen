import Icon from "@/components/base/Icon";
import CreateTask from "@/components/features/task/CreateTask";
import TaskList from "@/components/features/task/TaskList";
import Pill from "@/components/Pill";
import { useUnsafeParams } from "@/hooks/common";
import { ResourceType } from "@/models/resource";
import { useResource } from "@/queries/resourceQueries";
import { useTasks } from "@/queries/taskQueries";
import React, { Fragment, ReactElement } from "react";
import { Link } from "react-router-dom";

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
  const tasks = useTasks(resourceId);

  if (!resource) {
    return <Fragment />;
  }

  return (
    <div className="w-full h-full absolute inset-0 overflow-y-auto bg-gray-300">
      <div className="p-5 space-y-5">
        <div className="flex justify-start mt-2 mr-2">
          <Link to="..">
            <Icon name="arrow left" className="cursor-pointer" />{" "}
            {`Tillbaka till ${resource.name}`}
          </Link>
        </div>
        <h1 className="text-3xl font-bold pb-2 flex items-start">
          Uppdrag <Pill className="ml-2">{tasks.data?.length}</Pill>
        </h1>
        {resource.name !== undefined &&
          locationDescription(resource.name, resource.type)}
        <CreateTask resourceId={resourceId} />
        <TaskList resourceId={resourceId} />
      </div>
    </div>
  );
};

export default TasksPage;
