import { Option } from "@/components/atoms/types";
import { Bolt, BoltType, DiameterUnit } from "@/models/bolt";
import { useManufacturers } from "@/queries/manufacturerQueries";
import { useMaterials } from "@/queries/materialQueries";
import { useModels } from "@/queries/modelQueries";
import { translateBoltType } from "@/utils/boltUtils";
import { Chip, Grid, Group, Select } from "@mantine/core";
import { DatePickerInput, YearPickerInput } from "@mantine/dates";
import { useMemo } from "react";

const typeOptions = (["expansion", "glue", "piton"] as const).map<
  Option<BoltType>
>((type) => ({
  key: type,
  value: type,
  label: translateBoltType(type),
}));

interface DiameterAndUnit {
  diameter: number;
  unit: DiameterUnit;
}

const diameterOptions: Option<DiameterAndUnit>[] = [
  {
    key: "8mm",
    label: "8mm",
    value: { diameter: 8, unit: "mm" },
  },
  {
    key: "10mm",
    label: "10mm",
    value: { diameter: 10, unit: "mm" },
  },
  {
    key: "12mm",
    label: "12mm",
    value: { diameter: 12, unit: "mm" },
  },
  {
    key: "14mm",
    label: "14mm",
    value: { diameter: 14, unit: "mm" },
  },
  {
    key: "1_2in",
    label: '1/2"',
    value: { diameter: 0.5, unit: "inch" },
  },
  {
    key: "3_8in",
    label: '3/8"',
    value: { diameter: 0.375, unit: "inch" },
  },
];

type Props<T> = {
  bolt: T;
  onChange?: (bolt: T) => void;
  hideDismantled?: boolean;
};

const AdvancedBoltEditor = <T extends Omit<Bolt, "id" | "parentId">>({
  bolt,
  onChange,
  hideDismantled,
}: Props<T>) => {
  const updateBolt = (updates: Partial<Bolt>) => {
    onChange?.({ ...bolt, ...updates });
  };

  const { data: materials } = useMaterials();
  const { data: manufacturers } = useManufacturers();
  const { data: models } = useModels(bolt.manufacturerId);

  const materialOptions = useMemo(
    () =>
      materials?.map(({ id, name }) => ({
        key: id,
        label: name,
        value: id,
      })) ?? [],
    [materials]
  );

  const manufacturerOptions = useMemo(
    () =>
      manufacturers?.map(({ id, name }) => ({
        key: id,
        label: name,
        value: id,
      })) ?? [],
    [manufacturers]
  );

  const modelOptions = useMemo(
    () =>
      models?.map(({ id, name }) => ({
        key: id,
        label: name,
        value: id,
      })) ?? [],
    [models]
  );

  return (
    <Grid>
      <Grid.Col>
        <Select
          value={bolt.manufacturerId}
          data={manufacturerOptions}
          onSelect={(event) =>
            updateBolt({
              manufacturerId: event.currentTarget.value,
              modelId: undefined,
            })
          }
          label="Tillverkare"
          nothingFoundMessage="Inga tillverkare hittades"
          multiple={false}
        />
      </Grid.Col>

      <Grid.Col>
        <Select
          value={bolt.modelId}
          data={modelOptions}
          onSelect={(event) => {
            const modelId = event.currentTarget.value;
            const model = models?.find((model) => model.id === modelId);
            if (model) {
              const { materialId, type, diameter, diameterUnit } = model;
              updateBolt({ modelId, materialId, type, diameter, diameterUnit });
            }
          }}
          label="Modell"
          nothingFoundMessage="Inga modeller hittades"
          multiple={false}
        />
      </Grid.Col>

      <Grid.Col>
        <Chip.Group
          defaultValue={bolt.type}
          onChange={(type) => updateBolt({ type: type as Bolt["type"] })}
        >
          <Group>
            {typeOptions.map(({ key, value, label }) => (
              <Chip key={key} value={value} variant="outline">
                {label}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Grid.Col>

      <Grid.Col>
        <Select
          value={bolt.materialId}
          data={materialOptions}
          onSelect={(event) =>
            updateBolt({ materialId: event.currentTarget.value })
          }
          label="Material"
          nothingFoundMessage="Inga material hittades"
          multiple={false}
        />
      </Grid.Col>

      <Grid.Col>
        <Chip.Group
          defaultValue={
            diameterOptions.find(
              ({ value: { diameter, unit } }) =>
                diameter === bolt.diameter && unit === bolt.diameterUnit
            )?.key
          }
          onChange={(value) => {
            if (value) {
              const { diameter, unit: diameterUnit } = diameterOptions.find(
                ({ key }) => key === value
              )?.value ?? { diameter: undefined, unit: undefined };
              updateBolt({ diameter, diameterUnit });
            }
          }}
        >
          <Group>
            {diameterOptions.map(({ key, label }) => (
              <Chip key={key} value={key} variant="outline">
                {label}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Grid.Col>

      <Grid.Col>
        <YearPickerInput
          value={bolt.installed}
          label="År"
          placeholder="År"
          onSelect={(value) =>
            updateBolt({
              installed: new Date(Date.UTC(Number(value), 0, 1)),
            })
          }
          clearable
        />
      </Grid.Col>

      {!hideDismantled && (
        <Grid.Col>
          <DatePickerInput
            label="Demonterad"
            placeholder="Demonterad"
            value={bolt.dismantled}
            onChange={(value) => updateBolt({ dismantled: value ?? undefined })}
            clearable
          />
        </Grid.Col>
      )}
    </Grid>
  );
};

export default AdvancedBoltEditor;
