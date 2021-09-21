import { useSelectedResource } from "contexts/SelectedResourceProvider";
import { useTasks } from "queries/taskQueries";
import React, { ReactElement } from "react";
import TaskView from "./TaskView";

const TaskList = (): ReactElement => {
  const { selectedResource } = useSelectedResource();

  const tasks = useTasks(selectedResource.id);

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-5">
      {tasks.data?.map((task) => (
        <TaskView key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
