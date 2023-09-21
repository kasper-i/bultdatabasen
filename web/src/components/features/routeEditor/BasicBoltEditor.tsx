import IconButton from "@/components/atoms/IconButton";
import { Option } from "@/components/atoms/RadioGroup";
import { Bolt, BoltType } from "@/models/bolt";
import { positionToLabel, translateBoltType } from "@/utils/boltUtils";
import { Group, Radio } from "@mantine/core";

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
    <div className="w-28 border-2 border-primary-500 rounded-md flex flex-col justify-between p-2">
      <div className="flex justify-between items-center mb-2">
        <p className="text-left font-medium">
          {positionToLabel(
            totalNumberOfBolts === 1 ? undefined : bolt.position
          )}
        </p>
        {onRemove && (
          <IconButton tiny onClick={onRemove} icon="trash" color="danger" />
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
