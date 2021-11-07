import Pill from "@/components/Pill";
import { useSelectedResource } from "@/contexts/SelectedResourceProvider";
import { ResourceType } from "@/models/resource";
import { useTasks } from "@/queries/taskQueries";
import React, { ReactElement } from "react";
import { Icon } from "semantic-ui-react";
import CreateTask from "./CreateTask";
import TaskList from "./TaskList";

interface Props {
  onClose: () => void;
}

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

const TaskPanel = ({ onClose }: Props): ReactElement => {
  const { selectedResource } = useSelectedResource();

  const tasks = useTasks(selectedResource.id);

  return (
    <div className="w-full h-full absolute top-0 right-0 bottom-0 left-0 overflow-y-auto bg-gray-300">
      <div className="flex justify-end mt-2 mr-2">
        <Icon name="close" className="cursor-pointer" onClick={onClose} />
      </div>

      <div className="p-5 space-y-5">
        <h1 className="text-3xl font-bold pb-2 flex items-start">
          Uppdrag <Pill className="ml-2">{tasks.data?.length}</Pill>
        </h1>
        {selectedResource.name !== undefined &&
          locationDescription(selectedResource.name, selectedResource.type)}
        <CreateTask />
        <TaskList />
      </div>
    </div>
  );
};

export default TaskPanel;
