import { Bolt, BoltPosition } from "@/models/bolt";
import React, { FC } from "react";

const positionToLabel = (position?: BoltPosition) => {
  switch (position) {
    case "left":
      return "Vänster";
    case "right":
      return "Höger";
    default:
      return "Bultinfo";
  }
};

const LabelAndValue: FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => {
  return (
    <>
      <div className="text-xs text-gray-600 text-left">{label}</div>
      <div className="text-sm">
        {value ? (
          <span className="">{value}</span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </div>
    </>
  );
};

interface Props {
  bolt: Pick<Bolt, "type" | "position">;
  totalNumberOfBolts: number;
}

const BoltDetails = ({ bolt, totalNumberOfBolts }: Props) => {
  return (
    <div className="w-full xs:w-64 flex flex-col justify-between border p-2 rounded-md">
      <p className="text-left font-medium">
        {positionToLabel(totalNumberOfBolts === 1 ? undefined : bolt.position)}
      </p>

      <div className="grid grid-cols-2 gap-x-2 items-center">
        <LabelAndValue label="Tillverkare" />
        <LabelAndValue label="Modell" />
        <LabelAndValue
          label="Typ"
          value={bolt.type === "expansion" ? "Expander" : "Limbult"}
        />

        <LabelAndValue label="Material" />
        <LabelAndValue label="Diameter" />
        <LabelAndValue label="År" />
        <LabelAndValue label="Demonterad" value="Nej" />
      </div>
    </div>
  );
};

export default BoltDetails;
