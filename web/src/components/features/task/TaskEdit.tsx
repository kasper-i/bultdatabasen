import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { Task } from "@/models/task";
import { useUpdateTask } from "@/queries/taskQueries";
import React, { FC, useEffect, useState } from "react";

const TaskEdit: FC<{ task: Task; onDone: () => void }> = ({ task, onDone }) => {
  const [editedTask, setEditedTask] = useState(task);

  const updateTask = useUpdateTask(task.id);

  useEffect(() => {
    updateTask.isSuccess && onDone();
  }, [onDone, updateTask.isSuccess]);

  return (
    <div className="flex flex-col gap-2.5 items-end">
      <Input
        label="Beskrivning"
        value={editedTask.description}
        onChange={(event) =>
          setEditedTask((task) => ({
            ...task,
            description: event.target.value,
          }))
        }
      />
      <div className="flex justify-end gap-2.5">
        <Button onClick={() => onDone()} outlined>
          Avbryt
        </Button>
        <Button
          onClick={() => updateTask.mutate(editedTask)}
          loading={updateTask.isLoading}
        >
          Spara
        </Button>
      </div>
    </div>
  );
};

export default TaskEdit;
