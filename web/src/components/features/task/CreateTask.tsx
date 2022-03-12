import { useCreateTask } from "@/queries/taskQueries";
import React, { ReactElement, useState } from "react";
import Restricted from "../../Restricted";

interface Props {
  resourceId: string;
}

const CreateTask = ({ resourceId }: Props): ReactElement => {
  const createTask = useCreateTask(resourceId);

  const [description, setDescription] = useState("");

  const handleCreateTask = () => {
    createTask.mutate({ description });
    setDescription("");
  };

  return (
    <Restricted>
      <div className="sm:w-96 flex space-x-2">
        <Input
          className="flex-grow"
          fluid
          placeholder="Ankare i dåligt skick"
          onChange={(event) => setDescription(event.target.value)}
          value={description}
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
