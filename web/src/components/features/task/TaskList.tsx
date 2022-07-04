import Pagination from "@/components/atoms/Pagination";
import { Switch } from "@/components/atoms/Switch";
import { useTasks } from "@/queries/taskQueries";
import React, { ReactElement, Suspense, useState } from "react";
import { Dots } from "react-activity";
import TaskView from "./TaskView";

interface Props {
  resourceId: string;
}

const TaskList = ({ resourceId }: Props): ReactElement => {
  const [page, setPage] = useState(1);
  const [includeCompleted, setIncludeCompleted] = useState(false);

  const allTasks = useTasks(resourceId, {
    includeCompleted,
    pagination: { page: 1, itemsPerPage: 1000 },
  });

  const tasks = useTasks(resourceId, {
    includeCompleted,
    pagination: { page, itemsPerPage: 10 },
  });

  return (
    <Suspense fallback={<Dots />}>
      <div className="w-full border-b"></div>
      <Switch
        label="Visa åtgärdade"
        enabled={includeCompleted}
        onChange={() => setIncludeCompleted((state) => !state)}
      />

      <div className="flex flex-col w-full">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-5 items-start">
          {tasks.data?.map((task) => (
            <TaskView key={task.id} parentId={resourceId} taskId={task.id} />
          ))}
        </div>
        <div className="w-full my-5">
          <Pagination
            page={page}
            itemsPerPage={10}
            totalItems={allTasks.data?.length ?? 0}
            onPageSelect={setPage}
          />
        </div>
      </div>
    </Suspense>
  );
};

export default TaskList;
