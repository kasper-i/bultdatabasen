import Button from "@/components/atoms/Button";
import { Time } from "@/components/atoms/Time";
import { Menu } from "@/components/molecules/Menu";
import Restricted from "@/components/Restricted";
import { Bolt } from "@/models/bolt";
import { useUpdateBolt } from "@/queries/boltQueries";
import {
  diameterToFraction,
  positionToLabel,
  translateBoltType,
} from "@/utils/boltUtils";
import clsx from "clsx";
import React, { FC, Fragment, ReactNode, useEffect, useState } from "react";
import AdvancedBoltEditor from "./AdvancedBoltEditor";

const LabelAndValue: FC<{
  label: string;
  value?: ReactNode;
  className?: string;
}> = ({ label, value, className }) => {
  if (value === undefined) {
    return <Fragment />;
  }

  return (
    <div className={clsx("flex items-center justify-between", className)}>
      <div className="text-xs text-gray-600">{label}</div>
      <div className={clsx("text-sm", className)}>{value}</div>
    </div>
  );
};

interface Props {
  bolt: Bolt;
  totalNumberOfBolts: number;
}

const BoltDetails = ({ bolt, totalNumberOfBolts }: Props) => {
  const [action, setAction] = useState<"edit">();
  const [editedBolt, setEditedBolt] = useState(bolt);

  const updateBolt = useUpdateBolt(bolt.id);

  useEffect(() => {
    setEditedBolt(bolt);
  }, [bolt]);

  useEffect(() => {
    if (updateBolt.isSuccess) {
      setAction(undefined);
    }
  }, [updateBolt.isSuccess]);

  useEffect(() => {
    action === "edit" && setEditedBolt(bolt);
  }, [action]);

  const textStyle = bolt.dismantled ? "line-through opacity-50" : undefined;

  return (
    <div className="w-full xs:w-64 flex flex-col justify-between border p-2 rounded-md">
      <div className="flex justify-between">
        <p className="text-left font-medium">
          <span>
            {positionToLabel(
              totalNumberOfBolts === 1 ? undefined : bolt.position
            )}
          </span>
        </p>

        <Restricted>
          <Menu
            items={[
              {
                label: "Redigera",
                icon: "edit",
                onClick: () => setAction("edit"),
              },
              {
                label: "Demontera",
                icon: "archive",
                onClick: () =>
                  updateBolt.mutate({
                    ...bolt,
                    dismantled: new Date(),
                  }),
                disabled: !!bolt.dismantled,
              },
            ]}
          />
        </Restricted>
      </div>

      {action === "edit" ? (
        <div className="flex flex-col items-start pt-2">
          <AdvancedBoltEditor bolt={editedBolt} onChange={setEditedBolt} />
          <div className="flex gap-x-2.5 py-2 mt-2">
            <Button onClick={() => setAction(undefined)} outlined>
              Avbryt
            </Button>

            <Button
              loading={updateBolt.isLoading}
              onClick={() => updateBolt.mutate(editedBolt)}
            >
              Spara
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            "relative grid items-center text-left grid-cols-2 gap-x-2.5"
          )}
        >
          <LabelAndValue
            label="Tillverkare"
            value={bolt.manufacturer}
            className={textStyle}
          />
          <LabelAndValue
            label="Modell"
            value={bolt.model}
            className={textStyle}
          />
          <LabelAndValue
            label="Typ"
            value={translateBoltType(bolt.type)}
            className={textStyle}
          />

          <LabelAndValue
            label="Material"
            value={bolt.material}
            className={textStyle}
          />
          <LabelAndValue
            label="Diameter"
            value={
              bolt.diameter
                ? `${diameterToFraction(bolt.diameter)}${
                    bolt.diameterUnit === "inch" ? '"' : "mm"
                  }`
                : undefined
            }
            className={textStyle}
          />
          <LabelAndValue
            label="Installerad"
            value={
              bolt.installed ? (
                <Time time={bolt.installed} datetimeFormat="yyyy" />
              ) : undefined
            }
            className={textStyle}
          />
          <LabelAndValue
            label="Demonterad"
            value={
              bolt.dismantled ? <Time time={bolt.dismantled} /> : undefined
            }
            className="col-span-2"
          />
        </div>
      )}
    </div>
  );
};

export default BoltDetails;
