import { usePoints } from "@/queries/pointQueries";
import { useCreateTask } from "@/queries/taskQueries";
import { Button, Group, Radio, Select, Stack, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { ReactElement, useReducer, useState } from "react";
import { usePointLabeler } from "../routeEditor/hooks";

interface Props {
  routeId: string;
}

const CreateTask = ({ routeId }: Props): ReactElement => {
  const { data: points } = usePoints(routeId);

  const pointLabeler = usePointLabeler(points ?? []);

  const [description, setDescription] = useState("");
  const [selectedPointId, setSelectedPointId] = useState<string>();
  const [priority, setPriority] = useState(2);
  const [showForm, openForm] = useReducer(() => true, false);

  const createTask = useCreateTask(routeId, selectedPointId ?? routeId);

  const handleCreateTask = () => {
    createTask.mutate({ description, priority });
    setDescription("");
  };

  if (!showForm) {
    return (
      <Button leftSection={<IconPlus size={14} />} onClick={() => openForm()}>
        Nytt uppdrag
      </Button>
    );
  }

  return (
    <Stack gap="sm">
      <TextInput
        label="Beskrivning"
        placeholder="Byt nedsliten firningskarbin"
        onChange={(event) => setDescription(event.target.value)}
        value={description}
        required
      />

      <Select
        label="Ledbult eller ankare"
        value={selectedPointId}
        data={
          points
            ?.slice()
            ?.reverse()
            ?.map((point) => ({
              label: pointLabeler(point.id).name,
              sublabel: pointLabeler(point.id).no,
              value: point.id,
            })) ?? []
        }
        onSelect={(event) => setSelectedPointId(event.currentTarget.value)}
        nothingFoundMessage="Leden saknar dokumenterade bultar."
        disabled={points === undefined}
        multiple={false}
      />

      <Radio.Group
        label="Prioritet"
        defaultValue={priority.toString()}
        onChange={(value) => value !== undefined && setPriority(Number(value))}
      >
        <Group>
          <Radio value="3" label="Låg" />
          <Radio value="2" label="Normal" />
          <Radio value="1" label="Hög" />
        </Group>
      </Radio.Group>

      <Group justify="end">
        <Button
          onClick={handleCreateTask}
          loading={createTask.isLoading}
          disabled={description.length === 0}
        >
          Skapa
        </Button>
      </Group>
    </Stack>
  );
};

export default CreateTask;
