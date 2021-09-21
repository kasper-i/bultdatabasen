import Pill from "components/Pill";
import { useSelectedResource } from "contexts/SelectedResourceProvider";
import { useTasks } from "queries/taskQueries";
import React, { ReactElement } from "react";
import { Button, Icon } from "semantic-ui-react";

interface Props {
  onClick?: () => void;
}

function TaskIcon({ onClick }: Props): ReactElement {
  const { selectedResource } = useSelectedResource();

  const tasks = useTasks(selectedResource.id);

  return (
    <div className="w-min relative cursor-pointer" onClick={onClick}>
      <Button icon primary size="tiny">
        <Icon name="wrench" />
      </Button>
      {tasks.data && (
        <Pill className="absolute -top-2.5 -right-2">{tasks.data?.length}</Pill>
      )}
    </div>
  );
}

export default TaskIcon;
