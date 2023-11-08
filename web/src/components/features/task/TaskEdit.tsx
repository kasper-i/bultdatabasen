import { Option } from "@/components/atoms/types";
import { Task } from "@/models/task";
import { useUpdateTask } from "@/queries/taskQueries";
import { Button, Group, Radio, Stack, TextInput } from "@mantine/core";
import { FC, useEffect, useState } from "react";

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
    <Stack gap="sm">
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

      <Radio.Group
        label="Prioritet"
        defaultValue={editedTask.priority.toString()}
        onChange={(value) =>
          value !== undefined &&
          setEditedTask((task) => ({
            ...task,
            priority: Number(value),
          }))
        }
      >
        <Group>
          <Radio value="3" label="Låg" />
          <Radio value="2" label="Normal" />
          <Radio value="1" label="Hög" />
        </Group>
      </Radio.Group>

      <Group justify="end">
        <Button onClick={() => onDone()} variant="subtle">
          Avbryt
        </Button>
        <Button
          onClick={() => updateTask.mutate(editedTask)}
          loading={updateTask.isLoading}
        >
          Spara
        </Button>
      </Group>
    </Stack>
  );
};

export default TaskEdit;
