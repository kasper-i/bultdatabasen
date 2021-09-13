import { useTasks } from "queries/taskQueries";
import React, { ReactElement } from "react";
import { useParams } from "react-router-dom";
import TaskView from "./TaskView";

const TaskList = (): ReactElement => {
  const { resourceId } = useParams<{
    resourceId: string;
  }>();

  const tasks = useTasks(resourceId);

  return (
    <div>
      <h1 className="text-3xl font-bold pb-5">
        Uppdrag <span className="text-sm">{`(${tasks.data?.length})`}</span>
      </h1>

      <div className="flex flex-col space-y-5">
        {tasks.data?.map((task) => (
          <TaskView key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default TaskList;
