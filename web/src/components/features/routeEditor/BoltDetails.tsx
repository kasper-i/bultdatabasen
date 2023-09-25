import { Time } from "@/components/atoms/Time";
import Restricted from "@/components/Restricted";
import { Bolt } from "@/models/bolt";
import { useUpdateBolt } from "@/queries/boltQueries";
import {
  diameterToFraction,
  positionToLabel,
  translateBoltType,
} from "@/utils/boltUtils";
import { ActionIcon, Button, Menu } from "@mantine/core";
import { IconArchive, IconEdit, IconMenu2 } from "@tabler/icons-react";
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
    <div
      data-tailwind="flex items-center justify-between"
      className={className}
    >
      <div data-tailwind="text-xs text-gray-600">{label}</div>
      <div data-tailwind="text-sm" className={className}>
        {value}
      </div>
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
    <div data-tailwind="w-full xs:w-64 flex flex-col justify-between border p-2 rounded-md">
      <div data-tailwind="flex justify-between">
        <p data-tailwind="text-left font-medium">
          <span>
            {positionToLabel(
              totalNumberOfBolts === 1 ? undefined : bolt.position
            )}
          </span>
        </p>

        <Restricted>
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon variant="light">
                <IconMenu2 size={14} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => setAction("edit")}
              >
                Redigera
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconArchive size={14} />}
                onClick={() =>
                  updateBolt.mutate({
                    ...bolt,
                    dismantled: new Date(),
                  })
                }
              >
                Demontera
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Restricted>
      </div>

      {action === "edit" ? (
        <div data-tailwind="flex flex-col items-start pt-2">
          <AdvancedBoltEditor bolt={editedBolt} onChange={setEditedBolt} />
          <div data-tailwind="flex gap-x-2.5 py-2 mt-2">
            <Button onClick={() => setAction(undefined)} variant="subtle">
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
          data-tailwind={clsx(
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
            data-tailwind="col-span-2"
          />
        </div>
      )}
    </div>
  );
};

export default BoltDetails;
