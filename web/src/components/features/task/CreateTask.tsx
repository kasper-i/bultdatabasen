import { useSelectedResource } from "@/contexts/SelectedResourceProvider";
import { useCreateTask } from "@/queries/taskQueries";
import React, { ReactElement, useState } from "react";
import { Button, Input } from "semantic-ui-react";
import Restricted from "../../Restricted";

const CreateTask = (): ReactElement => {
  const { selectedResource } = useSelectedResource();

  const createTask = useCreateTask(selectedResource.id);

  const [description, setDescription] = useState("");

  const handleCreateTask = () => {
    createTask.mutate({ description });
  };

  return (
    <Restricted>
      <div className="sm:w-96 flex space-x-2">
        <Input
          className="flex-grow"
          fluid
          placeholder="Ankare i dåligt skick"
          onChange={(event) => setDescription(event.target.value)}
        />
        <Button
          color="blue"
          onClick={handleCreateTask}
          loading={createTask.isLoading}
        >
          Skapa
        </Button>
      </div>
    </Restricted>
  );
};

export default CreateTask;
