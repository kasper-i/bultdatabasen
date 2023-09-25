import RadioCardsGroup from "@/components/atoms/RadioCardsGroup";
import { Option } from "@/components/atoms/types";
import { usePoints } from "@/queries/pointQueries";
import { useCreateTask } from "@/queries/taskQueries";
import { Button, Select, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { ReactElement, useReducer, useState } from "react";
import { usePointLabeler } from "../routeEditor/hooks";

interface Props {
  routeId: string;
}

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
      <div data-tailwind="sm:w-96">
        <Button leftSection={<IconPlus size={14} />} onClick={() => openForm()}>
          Nytt uppdrag
        </Button>
      </div>
    );
  }

  return (
    <div data-tailwind="sm:w-96 flex flex-col gap-4">
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

      <RadioCardsGroup<number>
        value={priority}
        onChange={(value) => value !== undefined && setPriority(value)}
        options={priorityOptions}
        label="Prioritet"
        mandatory
      />

      <Button
        onClick={handleCreateTask}
        loading={createTask.isLoading}
        disabled={description.length === 0}
      >
        Skapa
      </Button>
    </div>
  );
};

export default CreateTask;
