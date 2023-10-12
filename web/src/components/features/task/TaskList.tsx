import { useTasks } from "@/queries/taskQueries";
import {
  Center,
  Divider,
  Flex,
  Loader,
  Pagination,
  Space,
  Stack,
  Switch,
} from "@mantine/core";
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
      <Divider my="sm" />
      <Switch
        label="Visa åtgärdade"
        checked={showClosed}
        onChange={() => {
          setShowClosed((state) => !state);
          setPage(1);
        }}
      />

      <Stack gap="sm">
        {tasks?.data?.map((task) => (
          <TaskView
            key={task.id}
            taskId={task.id}
            parentResourceId={resourceId}
          />
        ))}
        <Center>
          <Pagination
            value={page}
            total={Math.ceil((tasks?.meta.totalItems ?? 0) / ITEMS_PER_PAGE)}
            onChange={setPage}
            withEdges
          />
        </Center>
      </Stack>
    </Suspense>
  );
};

export default TaskList;
