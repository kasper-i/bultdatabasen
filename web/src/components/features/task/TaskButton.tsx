import IconButton from "@/components/atoms/IconButton";
import Pill from "@/components/Pill";
import { useResource } from "@/queries/resourceQueries";
import React, { ReactElement } from "react";

interface Props {
  resourceId: string;
}

function TaskButton({ resourceId }: Props): ReactElement {
  const { data: resource } = useResource(resourceId);

  const taskCount = resource?.counters?.openTasks ?? 0;

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
