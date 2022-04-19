import IconButton from "@/components/atoms/IconButton";
import RadioGroup, { Option } from "@/components/atoms/RadioGroup";
import { Bolt, BoltPosition, BoltType } from "@/models/bolt";
import React from "react";

const typeOptions: Option<BoltType>[] = [
  { key: "expansion", value: "expansion", label: "Expander" },
  { key: "glue", value: "glue", label: "Limbult" },
];

const positionToLabel = (position?: BoltPosition) => {
  switch (position) {
    case "left":
      return "Vänster";
    case "right":
      return "Höger";
    default:
      return "Ledbult";
  }
};

interface Props {
  bolt: Pick<Bolt, "type" | "position">;
  onRemove?: () => void;
  onChange?: (bolt: Pick<Bolt, "type" | "position">) => void;
  totalNumberOfBolts: number;
}

const BoltDetails = ({
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

      <RadioGroup<BoltType>
        options={typeOptions}
        value={bolt.type}
        onChange={(type) => updateBolt({ type })}
      />
    </div>
  );
};

export default BoltDetails;
