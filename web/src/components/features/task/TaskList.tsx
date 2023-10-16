import { useTasks } from "@/queries/taskQueries";
import { Center, Loader, Pagination, Stack } from "@mantine/core";
import { FC, ReactElement, Suspense, useEffect, useState } from "react";
import TaskView from "./TaskView";

const ITEMS_PER_PAGE = 12;

const TaskList: FC<{
  resourceId: string;
  showClosed?: boolean;
}> = ({ resourceId, showClosed }): ReactElement => {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [showClosed]);

  const { data: tasks } = useTasks(resourceId, {
    status: showClosed ? ["closed", "rejected"] : ["open", "assigned"],
    pagination: { page, itemsPerPage: ITEMS_PER_PAGE },
  });

  const pages = Math.ceil((tasks?.meta.totalItems ?? 0) / ITEMS_PER_PAGE);

  return (
    <Suspense fallback={<Loader type="bars" />}>
      <Stack gap="sm">
        {tasks?.data?.map((task) => (
          <TaskView
            key={task.id}
            taskId={task.id}
            parentResourceId={resourceId}
          />
        ))}
        {pages > 1 && (
          <Center>
            <Pagination
              value={page}
              total={pages}
              onChange={setPage}
              withEdges
            />
          </Center>
        )}
      </Stack>
    </Suspense>
  );
};

export default TaskList;
