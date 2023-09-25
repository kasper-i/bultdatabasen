import { Option } from "@/components/atoms/types";
import { Bolt, BoltType } from "@/models/bolt";
import { positionToLabel, translateBoltType } from "@/utils/boltUtils";
import { ActionIcon, Group, Radio } from "@mantine/core";
import { IconTrack, IconTrash } from "@tabler/icons-react";

const typeOptions = (["expansion", "glue", "piton"] as const).map<
  Option<BoltType>
>((type) => ({
  key: type,
  value: type,
  label: translateBoltType(type),
}));

interface Props {
  bolt: Pick<Bolt, "type" | "position">;
  onRemove?: () => void;
  onChange?: (bolt: Pick<Bolt, "type" | "position">) => void;
  totalNumberOfBolts: number;
}

const BasicBoltEditor = ({
  bolt,
  onRemove,
  onChange,
  totalNumberOfBolts,
}: Props) => {
  const updateBolt = (updates: Partial<Pick<Bolt, "type" | "position">>) => {
    onChange?.({ ...bolt, ...updates });
  };

  return (
    <div data-tailwind="w-28 border-2 border-primary-500 rounded-md flex flex-col justify-between p-2">
      <div data-tailwind="flex justify-between items-center mb-2">
        <p data-tailwind="text-left font-medium">
          {positionToLabel(
            totalNumberOfBolts === 1 ? undefined : bolt.position
          )}
        </p>
        {onRemove && (
          <ActionIcon onClick={onRemove} variant="subtle" color="red">
            <IconTrash size={14} />
          </ActionIcon>
        )}
      </div>

      <Radio.Group
        label="Typ"
        required
        onChange={(value) =>
          updateBolt({
            type: value as BoltType,
          })
        }
      >
        <Group mt="xs">
          {typeOptions.map(({ key, value, label }) => (
            <Radio key={key} value={value} label={label} />
          ))}
        </Group>
      </Radio.Group>
    </div>
  );
};

export default BasicBoltEditor;
