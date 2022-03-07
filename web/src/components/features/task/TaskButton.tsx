import Pill from "@/components/Pill";
import { useTasks } from "@/queries/taskQueries";
import React, { ReactElement } from "react";
import { Button, Icon } from "semantic-ui-react";

interface Props {
  resourceId: string;
}

function TaskButton({ resourceId }: Props): ReactElement {
  const tasks = useTasks(resourceId);

  return (
    <div className="w-min relative cursor-pointer">
      <Button icon primary size="tiny">
        <Icon name="wrench" />
      </Button>
      {tasks.data && tasks.data.length > 0 && (
        <Pill className="absolute -top-2.5 -right-2">{tasks.data.length}</Pill>
      )}
    </div>
  );
}

export default TaskButton;
