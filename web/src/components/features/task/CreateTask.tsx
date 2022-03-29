import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
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
      <div className="sm:w-96 flex items-end space-x-2">
        <Input
          id="description"
          label="Beskrivning"
          placeholder="Ankare i dåligt skick"
          onChange={(event) => setDescription(event.target.value)}
          value={description}
        />
        <Button
          onClick={handleCreateTask}
          loading={createTask.isLoading}
          disabled={description.length === 0}
        >
          Skapa
        </Button>
      </div>
    </Restricted>
  );
};

export default CreateTask;
