import { Option } from "@/components/atoms/types";
import { Bolt, BoltType } from "@/models/bolt";
import { positionToLabel, translateBoltType } from "@/utils/boltUtils";
import { ActionIcon, Card, Group, Radio, Stack, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

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
    <Card withBorder>
      <Group justify="space-between" align="center">
        <Text fw={500}>
          {positionToLabel(
            totalNumberOfBolts === 1 ? undefined : bolt.position
          )}
        </Text>
        {onRemove && (
          <ActionIcon onClick={onRemove} variant="subtle" color="red">
            <IconTrash size={14} />
          </ActionIcon>
        )}
      </Group>

      <Radio.Group
        label="Typ"
        required
        onChange={(value) =>
          updateBolt({
            type: value as BoltType,
          })
        }
      >
        <Stack mt="xs">
          {typeOptions.map(({ key, value, label }) => (
            <Radio key={key} value={value} label={label} />
          ))}
        </Stack>
      </Radio.Group>
    </Card>
  );
};

export default BasicBoltEditor;
