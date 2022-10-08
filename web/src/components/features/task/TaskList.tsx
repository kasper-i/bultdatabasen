import Pagination from "@/components/atoms/Pagination";
import { Switch } from "@/components/atoms/Switch";
import { useTasks } from "@/queries/taskQueries";
import React, { ReactElement, Suspense, useState } from "react";
import { Dots } from "react-activity";
import TaskView from "./TaskView";

interface Props {
  resourceId: string;
}

const ITEMS_PER_PAGE = 12;

const TaskList = ({ resourceId }: Props): ReactElement => {
  const [page, setPage] = useState(1);
  const [showClosed, setShowClosed] = useState(false);

  const { data: tasks } = useTasks(resourceId, {
    status: showClosed ? ["closed", "rejected"] : ["open", "assigned"],
    pagination: { page, itemsPerPage: ITEMS_PER_PAGE },
  });

  return (
    <Suspense fallback={<Dots />}>
      <div className="w-full border-b"></div>
      <Switch
        label="Visa åtgärdade"
        enabled={showClosed}
        onChange={() => {
          setShowClosed((state) => !state);
          setPage(1);
        }}
      />

      <div className="flex flex-col w-full">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-5 items-start">
          {tasks?.data?.map((task) => (
            <TaskView key={task.id} taskId={task.id} />
          ))}
        </div>
        <div className="w-full my-5">
          <Pagination
            page={page}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={tasks?.meta.totalItems ?? 0}
            onPageSelect={setPage}
          />
        </div>
      </div>
    </Suspense>
  );
};

export default TaskList;
