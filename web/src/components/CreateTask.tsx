import { useCreateTask } from "queries/taskQueries";
import React, { ReactElement, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Input } from "semantic-ui-react";
import Restricted from "./Restricted";

const CreateTask = (): ReactElement => {
  const { resourceId } = useParams<{
    resourceId: string;
  }>();

  const createTask = useCreateTask(resourceId);

  const [description, setDescription] = useState("");

  const handleCreateTask = () => {
    createTask.mutate({ description });
  };

  return (
    <Restricted>
      <div className="flex space-x-2">
        <Input
          className="flex-grow"
          fluid
          placeholder="Ankare i dåligt skick"
          onChange={(event) => setDescription(event.target.value)}
        />
        <Button onClick={handleCreateTask} loading={createTask.isLoading}>
          Skapa
        </Button>
      </div>
    </Restricted>
  );
};

export default CreateTask;
