import { CreatePointRequest, InsertPosition } from "@/Api";
import Button from "@/components/atoms/Button";
import Dots from "@/components/atoms/Dots";
import Icon from "@/components/atoms/Icon";
import { Switch } from "@/components/atoms/Switch";
import { Bolt } from "@/models/bolt";
import { Point } from "@/models/point";
import React, { ReactElement, Suspense, useState } from "react";
import { UseMutationResult } from "react-query";
import BoltEditor from "./BoltEditor";
import PointPicker from "./PointPicker";

interface Props {
  mutation: UseMutationResult<Point, unknown, CreatePointRequest, unknown>;
  hint?: "anchor";
  position?: InsertPosition;
  onCancel: () => void;
  routeId: string;
  routeParentId: string;
  illegalPoints: string[];
}

function PointWizard({
  mutation,
  hint,
  position,
  onCancel,
  routeId,
  routeParentId,
  illegalPoints,
}: Props): ReactElement {
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState<string>();
  const [isAnchor, setIsAnchor] = useState(hint === "anchor");

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

  const attachPoint = () => {
    mutation.mutate(
      selectedPointId
        ? { pointId: selectedPointId, position }
        : {
            pointId: undefined,
            position,
            anchor: isAnchor,
            bolts: bolts.map(([_, bolt]) => bolt),
          }
    );
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
      {!mergeMode && (
        <button
          className="text-primary-500 underline mb-4"
          onClick={() => setMergeMode((mode) => !mode)}
        >
          Anslut till närliggande led
        </button>
      )}

      {mergeMode ? (
        <Suspense fallback={<Dots />}>
          <PointPicker
            targetRouteId={routeId}
            targetRouteParentId={routeParentId}
            illegalPoints={illegalPoints}
            value={selectedPointId}
            onSelect={setSelectedPointId}
          />
        </Suspense>
      ) : (
        <>
          <Switch enabled={isAnchor} onChange={toggleAnchor} label="Ankare" />

          <p className="mt-4 mb-1 font-medium">Bultar</p>

          <div className="flex flex-wrap gap-4">
            {bolts.map(([index, bolt]) => (
              <BoltEditor
                key={index}
                bolt={bolt}
                onRemove={
                  bolt.position === "right"
                    ? () => removeBolt(index)
                    : undefined
                }
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
        </>
      )}

      <div className="flex gap-2 w-full mt-4">
        <Button onClick={onCancel} outlined>
          Avbryt
        </Button>
        <Button
          onClick={attachPoint}
          loading={mutation.isLoading}
          disabled={mergeMode && selectedPointId === undefined}
        >
          {mergeMode ? "Sammanfoga" : "Lägg till ny"}
        </Button>
      </div>
    </div>
  );
}

export default PointWizard;
