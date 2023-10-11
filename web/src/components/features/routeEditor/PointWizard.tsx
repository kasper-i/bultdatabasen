import { CreatePointRequest, InsertPosition } from "@/Api";
import { Bolt } from "@/models/bolt";
import { Point } from "@/models/point";
import { Button, Group, Loader, Switch, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { UseMutationResult } from "@tanstack/react-query";
import { ReactElement, Suspense, useState } from "react";
import BasicBoltEditor from "./BasicBoltEditor";
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
            bolts: bolts.map(([, bolt]) => bolt),
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
        <Button variant="outline" onClick={() => setMergeMode((mode) => !mode)}>
          Anslut till närliggande led
        </Button>
      )}

      {mergeMode ? (
        <Suspense fallback={<Loader type="bars" />}>
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
          <Switch
            checked={isAnchor}
            onChange={(event) => toggleAnchor(event.currentTarget.checked)}
            label="Ankare"
          />

          <Text fw={600}>Bultar</Text>

          <Group gap="sm">
            {bolts.map(([index, bolt]) => (
              <BasicBoltEditor
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
              <Button
                size="xl"
                leftSection={<IconPlus />}
                onClick={addRightBolt}
              >
                Lägg till en högerbult
              </Button>
            )}
          </Group>
        </>
      )}

      <Group gap="sm">
        <Button onClick={onCancel} variant="subtle">
          Avbryt
        </Button>
        <Button
          onClick={attachPoint}
          loading={mutation.isLoading}
          disabled={mergeMode && selectedPointId === undefined}
        >
          {mergeMode ? "Sammanfoga" : "Lägg till ny"}
        </Button>
      </Group>
    </div>
  );
}

export default PointWizard;
