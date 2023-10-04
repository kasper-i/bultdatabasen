import RadioCardsGroup from "@/components/atoms/RadioCardsGroup";
import { Task } from "@/models/task";
import { useUpdateTask } from "@/queries/taskQueries";
import { Button, TextInput } from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { Option } from "@/components/atoms/types";

export const priorityOptions: Option<number>[] = [
  {
    key: "3",
    label: "Låg",
    value: 3,
  },
  {
    key: "2",
    label: "Normal",
    value: 2,
  },
  {
    key: "1",
    label: "Hög",
    value: 1,
  },
];

const TaskEdit: FC<{ task: Task; onDone: () => void }> = ({ task, onDone }) => {
  const [editedTask, setEditedTask] = useState(task);

  const updateTask = useUpdateTask(task.id);

  useEffect(() => {
    updateTask.isSuccess && onDone();
  }, [onDone, updateTask.isSuccess]);

  return (
    <div data-tailwind="flex flex-col gap-2.5">
      <TextInput
        label="Beskrivning"
        value={editedTask.description}
        onChange={(event) =>
          setEditedTask((task) => ({
            ...task,
            description: event.target.value,
          }))
        }
        required
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

      <div data-tailwind="flex justify-end gap-2.5 w-full">
        <Button onClick={() => onDone()} variant="subtle">
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
