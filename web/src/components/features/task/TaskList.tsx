import { useTasks } from "@/queries/taskQueries";
import { Loader, Pagination, Switch } from "@mantine/core";
import { ReactElement, Suspense, useState } from "react";
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
    <Suspense fallback={<Loader type="bars" />}>
      <div data-tailwind="w-full border-b" />
      <Switch
        label="Visa åtgärdade"
        checked={showClosed}
        onChange={() => {
          setShowClosed((state) => !state);
          setPage(1);
        }}
      />

      <div data-tailwind="flex flex-col w-full">
        <div data-tailwind="flex flex-col sm:flex-row sm:flex-wrap gap-5 items-start">
          {tasks?.data?.map((task) => (
            <TaskView
              key={task.id}
              taskId={task.id}
              parentResourceId={resourceId}
            />
          ))}
        </div>
        <div data-tailwind="w-full my-5">
          <Pagination
            value={page}
            total={Math.ceil(tasks?.meta.totalItems ?? 0 / ITEMS_PER_PAGE)}
            onChange={setPage}
            withEdges
          />
        </div>
      </div>
    </Suspense>
  );
};

export default TaskList;
