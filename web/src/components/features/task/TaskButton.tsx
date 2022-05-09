import IconButton from "@/components/atoms/IconButton";
import Pill from "@/components/Pill";
import { useTasks } from "@/queries/taskQueries";
import React, { ReactElement } from "react";

interface Props {
  resourceId: string;
}

function TaskButton({ resourceId }: Props): ReactElement {
  const { data: tasks } = useTasks(resourceId);

  const taskCount =
    tasks?.filter(
      (task) => task.status === "open" || task.status === "assigned"
    )?.length ?? 0;

  return (
    <div className="w-min relative cursor-pointer">
      <IconButton circular icon="wrench" />
      {taskCount > 0 && (
        <Pill className="absolute -top-2.5 -right-2">{taskCount}</Pill>
      )}
    </div>
  );
}

export default TaskButton;
