import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import RadioCardsGroup from "@/components/atoms/RadioCardsGroup";
import { Option } from "@/components/atoms/RadioGroup";
import { Select } from "@/components/atoms/Select";
import { Point } from "@/models/point";
import { usePoints } from "@/queries/pointQueries";
import { useCreateTask } from "@/queries/taskQueries";
import { ReactElement, useState } from "react";
import Restricted from "../../Restricted";
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

  const createTask = useCreateTask(routeId, selectedPointId ?? routeId);

  const handleCreateTask = () => {
    createTask.mutate({ description, priority });
    setDescription("");
  };

  return (
    <Restricted>
      <div className="sm:w-96 flex flex-col gap-4">
        <Input
          label="Beskrivning"
          placeholder="Byt nedsliten firningskarbin"
          onChange={(event) => setDescription(event.target.value)}
          value={description}
        />

        <Select<Point>
          label="Ledbult eller ankare"
          value={points?.find((point) => point.id === selectedPointId)}
          options={
            points
              ?.slice()
              ?.reverse()
              ?.map((point) => ({
                label: pointLabeler(point.id).name,
                sublabel: "№" + pointLabeler(point.id).no,
                value: point,
                key: point.id,
              })) ?? []
          }
          onSelect={(point) => setSelectedPointId(point.id)}
          displayValue={(point) => {
            const { name, no } = pointLabeler(point.id);
            return `${name} №${no}`;
          }}
          noOptionsText="Leden saknar bultar"
          disabled={points === undefined}
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
    </Restricted>
  );
};

export default CreateTask;
