import IconButton from "@/components/atoms/IconButton";
import Pill from "@/components/Pill";
import { useLazyResource } from "@/queries/resourceQueries";
import { ReactElement } from "react";

interface Props {
  resourceId: string;
}

function TaskButton({ resourceId }: Props): ReactElement {
  const { data: resource } = useLazyResource(resourceId);

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
