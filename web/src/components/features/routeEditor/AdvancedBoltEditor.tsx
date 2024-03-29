import { Datepicker } from "@/components/atoms/DatePicker";
import IconButton from "@/components/atoms/IconButton";
import RadioCardsGroup from "@/components/atoms/RadioCardsGroup";
import { Option } from "@/components/atoms/RadioGroup";
import { Select } from "@/components/atoms/Select";
import { Bolt, BoltType, DiameterUnit } from "@/models/bolt";
import { useManufacturers } from "@/queries/manufacturerQueries";
import { useMaterials } from "@/queries/materialQueries";
import { useModels } from "@/queries/modelQueries";
import { translateBoltType } from "@/utils/boltUtils";
import clsx from "clsx";
import { FC, useMemo } from "react";

const typeOptions = (["expansion", "glue", "piton"] as const).map<
  Option<BoltType>
>((type) => ({
  key: type,
  value: type,
  label: translateBoltType(type),
}));

const ClearButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <div className="mt-6 h-[2.125rem] flex justify-center items-center">
      <IconButton icon="x" tiny onClick={onClick} />
    </div>
  );
};

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

  const yearOptions = useMemo(() => {
    const yearOptions: Option<number>[] = [];
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= 1960; year--) {
      yearOptions.push({
        key: year,
        label: year.toString(),
        value: year,
      });
    }

    return yearOptions;
  }, []);

  return (
    <div
      className={clsx("w-full grid gap-x-2 gap-y-2 content-center")}
      style={{
        gridTemplateColumns: "1fr 1rem",
      }}
    >
      <Select
        value={bolt.manufacturerId}
        options={manufacturerOptions}
        onSelect={(manufacturerId) =>
          updateBolt({ manufacturerId, modelId: undefined })
        }
        label="Tillverkare"
        noOptionsText="Inga tillverkare hittades"
        multiple={false}
      />

      <ClearButton onClick={() => updateBolt({ manufacturerId: undefined })} />

      <Select
        value={bolt.modelId}
        options={modelOptions}
        onSelect={(modelId) => {
          const model = models?.find((model) => model.id === modelId);
          if (model) {
            const { materialId, type, diameter, diameterUnit } = model;
            updateBolt({ modelId, materialId, type, diameter, diameterUnit });
          }
        }}
        label="Modell"
        noOptionsText="Inga modeller hittades"
        multiple={false}
      />

      <ClearButton onClick={() => updateBolt({ modelId: undefined })} />

      <RadioCardsGroup<BoltType>
        value={bolt.type}
        options={typeOptions}
        onChange={(type) => updateBolt({ type })}
        label="Typ"
      />

      <div />

      <Select<Bolt["materialId"]>
        value={bolt.materialId}
        options={materialOptions}
        onSelect={(materialId) => updateBolt({ materialId })}
        label="Material"
        noOptionsText="Inga material hittades"
        multiple={false}
      />

      <ClearButton onClick={() => updateBolt({ materialId: undefined })} />

      <RadioCardsGroup<DiameterAndUnit>
        value={
          bolt.diameter && bolt.diameterUnit
            ? { diameter: bolt.diameter, unit: bolt.diameterUnit }
            : undefined
        }
        onChange={(value) => {
          if (value) {
            const { diameter, unit: diameterUnit } = value;
            updateBolt({ diameter, diameterUnit });
          } else {
            updateBolt({ diameter: undefined, diameterUnit: undefined });
          }
        }}
        options={diameterOptions}
        label="Diameter"
      />

      <div />

      <Select
        value={bolt.installed ? new Date(bolt.installed).getFullYear() : ""}
        label="År"
        onSelect={(value) =>
          updateBolt({
            installed: new Date(Date.UTC(Number(value), 0, 1)),
          })
        }
        options={yearOptions}
        multiple={false}
      />

      <ClearButton onClick={() => updateBolt({ installed: undefined })} />

      {!hideDismantled && (
        <>
          <Datepicker
            label="Demonterad"
            value={bolt.dismantled ? new Date(bolt.dismantled) : undefined}
            onChange={(value) => updateBolt({ dismantled: new Date(value) })}
          />

          <ClearButton onClick={() => updateBolt({ dismantled: undefined })} />
        </>
      )}
    </div>
  );
};

export default AdvancedBoltEditor;
