import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import RadioCardsGroup from "@/components/atoms/RadioCardsGroup";
import { Task } from "@/models/task";
import { useUpdateTask } from "@/queries/taskQueries";
import { FC, useEffect, useState } from "react";
import { priorityOptions } from "./CreateTask";

const TaskEdit: FC<{ task: Task; onDone: () => void }> = ({ task, onDone }) => {
  const [editedTask, setEditedTask] = useState(task);

  const updateTask = useUpdateTask(task.id);

  useEffect(() => {
    updateTask.isSuccess && onDone();
  }, [onDone, updateTask.isSuccess]);

  return (
    <div className="flex flex-col gap-2.5 items-start">
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

      <RadioCardsGroup<number>
        value={editedTask.priority}
        onChange={(value) =>
          value !== undefined &&
          setEditedTask((task) => ({
            ...task,
            priority: value,
          }))
        }
        options={priorityOptions}
        label="Prioritet"
        mandatory
      />

      <div className="flex justify-end gap-2.5 w-full">
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
