import { useTasks } from "@/queries/taskQueries";
import React, { ReactElement, Suspense } from "react";
import { Dots } from "react-activity";
import TaskView from "./TaskView";

interface Props {
  resourceId: string;
}

const TaskList = ({ resourceId }: Props): ReactElement => {
  const tasks = useTasks(resourceId);

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-5 items-start">
      <Suspense fallback={<Dots />}>
        {tasks.data?.map((task) => (
          <TaskView key={task.id} parentId={resourceId} taskId={task.id} />
        ))}
      </Suspense>
    </div>
  );
};

export default TaskList;
