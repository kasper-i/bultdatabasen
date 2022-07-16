import { Time } from "@/components/atoms/Time";
import { Bolt } from "@/models/bolt";
import { positionToLabel, translateBoltType } from "@/utils/boltUtils";
import clsx from "clsx";
import React, { FC, ReactNode } from "react";

const LabelAndValue: FC<{ label: string; value?: ReactNode }> = ({
  label,
  value,
}) => {
  return (
    <>
      <div className="text-xs text-gray-600 text-left">{label}</div>
      <div className="text-sm">
        {value ? value : <span className="text-gray-300">-</span>}
      </div>
    </>
  );
};

interface Props {
  bolt: Bolt;
  totalNumberOfBolts: number;
}

const BoltDetails = ({ bolt, totalNumberOfBolts }: Props) => {
  return (
    <div
      className={clsx(
        "w-full xs:w-64 flex flex-col justify-between border p-2 rounded-md",
        bolt.dismantled && "opacity-50"
      )}
    >
      <p
        className={clsx(
          "text-left font-medium",
          bolt.dismantled && "line-through"
        )}
      >
        {positionToLabel(totalNumberOfBolts === 1 ? undefined : bolt.position)}
      </p>

      <div className="grid grid-cols-2 gap-x-2 items-center">
        <LabelAndValue label="Tillverkare" />
        <LabelAndValue label="Modell" />
        <LabelAndValue label="Typ" value={translateBoltType(bolt.type)} />

        <LabelAndValue label="Material" />
        <LabelAndValue label="Diameter" />
        <LabelAndValue label="År" />
        <LabelAndValue
          label="Demonterad"
          value={bolt.dismantled ? <Time time={bolt.dismantled} /> : "Nej"}
        />
      </div>
    </div>
  );
};

export default BoltDetails;
