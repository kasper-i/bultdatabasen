import { InsertPosition } from "@/Api";
import Button from "@/components/atoms/Button";
import Icon from "@/components/atoms/Icon";
import { Switch } from "@/components/atoms/Switch";
import { Bolt } from "@/models/bolt";
import { useAttachPoint } from "@/queries/pointQueries";
import React, { ReactElement, useEffect, useState } from "react";
import BoltDetails from "./BoltDetails";

interface Props {
  routeId: string;
  hint?: "anchor";
  position?: InsertPosition;
  onCancel: () => void;
  onDone: (pointId: string) => void;
}

function PointWizard({
  routeId,
  hint,
  position,
  onCancel,
  onDone,
}: Props): ReactElement {
  const [isAnchor, setIsAnchor] = useState(hint === "anchor");
  const createPoint = useAttachPoint(routeId);

  const [bolts, setBolts] = useState<
    [number, Pick<Bolt, "type" | "position">][]
  >(
    Array(hint === "anchor" ? 2 : 1)
      .fill(0)
      .map((_, index) => [
        index,
        {
          type: "expansion",
          position: index === 0 ? "left" : "right",
        },
      ])
  );
  const toggleAnchor = (state: boolean) => {
    if (state && bolts.length === 1) {
      addRightBolt();
    } else {
      removeBolt(1);
    }

    setIsAnchor(state);
  };

  useEffect(() => {
    if (createPoint.isSuccess) {
      onDone(createPoint.data.id);
    }
  }, [createPoint.isSuccess]);

  const attachPoint = () => {
    createPoint.mutate({
      pointId: undefined,
      position,
      anchor: isAnchor,
      bolts: bolts.map(([_, bolt]) => bolt),
    });
  };

  const addRightBolt = () => {
    setBolts((bolts) => [
      ...bolts,
      [bolts.length, { type: "expansion", position: "right" }],
    ]);
    setIsAnchor(true);
  };

  const removeBolt = (index: number) => {
    setBolts((bolts) => bolts.filter(([i]) => i !== index));
  };

  const updateBolt = (index: number, bolt: Pick<Bolt, "type" | "position">) => {
    setBolts((bolts) =>
      bolts.map((entry) => {
        const [i] = entry;

        if (i === index) {
          return [i, bolt];
        } else {
          return entry;
        }
      })
    );
  };

  return (
    <div>
      <Switch enabled={isAnchor} onChange={toggleAnchor} label="Ankare" />
      <p className="mt-4 mb-1 font-medium">Bultar</p>
      <div className="flex flex-wrap gap-4 mb-4">
        {bolts.map(([index, bolt]) => (
          <BoltDetails
            key={index}
            bolt={bolt}
            onRemove={() => removeBolt(index)}
            onChange={(bolt) => updateBolt(index, bolt)}
            totalNumberOfBolts={bolts.length}
          />
        ))}
        {bolts.length < 2 && (
          <div
            key="new"
            className="h-24 w-28 border-2 border-gray-300 border-dashed rounded-md flex justify-center items-center"
          >
            <div className="text-center" onClick={addRightBolt}>
              <Icon
                big
                name="plus"
                className="cursor-pointer text-primary-500"
              />
              <p className="cursor-pointer text-gray-700 text-sm">
                Lägg till en högerbult
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-start gap-2 w-full">
        <Button onClick={onCancel} outlined>
          Avbryt
        </Button>
        <Button onClick={attachPoint} loading={createPoint.isLoading}>
          Lägg till
        </Button>
      </div>
    </div>
  );
}

export default PointWizard;
