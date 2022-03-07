import { useTasks } from "@/queries/taskQueries";
import React, { ReactElement } from "react";
import TaskView from "./TaskView";

interface Props {
  resourceId: string;
}

const TaskList = ({ resourceId }: Props): ReactElement => {
  const tasks = useTasks(resourceId);

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-5">
      {tasks.data?.map((task) => (
        <TaskView key={task.id} resourceId={resourceId} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
