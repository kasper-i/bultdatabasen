import IconButton from "@/components/atoms/IconButton";
import Pill from "@/components/Pill";
import { useTasks } from "@/queries/taskQueries";
import React, { ReactElement } from "react";

interface Props {
  resourceId: string;
}

function TaskButton({ resourceId }: Props): ReactElement {
  const { data: tasks } = useTasks(resourceId);

  return (
    <div className="w-min relative cursor-pointer">
      <IconButton circular icon="wrench" />
      {tasks && tasks.length > 0 && (
        <Pill className="absolute -top-2.5 -right-2">
          {
            tasks.filter(
              (task) => task.status === "open" || task.status === "assigned"
            ).length
          }
        </Pill>
      )}
    </div>
  );
}

export default TaskButton;
