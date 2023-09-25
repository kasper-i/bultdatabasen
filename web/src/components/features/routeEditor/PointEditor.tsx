import { InsertPosition } from "@/Api";
import Restricted from "@/components/Restricted";
import { usePermissions } from "@/hooks/authHooks";
import { Point } from "@/models/point";
import { useAttachPoint } from "@/queries/pointQueries";
import { ActionIcon, Loader } from "@mantine/core";
import { IconChevronRight, IconPlus } from "@tabler/icons-react";
import clsx from "clsx";
import { FC, ReactElement, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "./Card";
import { usePointLabeler } from "./hooks";
import PointDetails from "./PointDetails";
import PointWizard from "./PointWizard";

interface Props {
  routeId: string;
  routeParentId: string;
  points: Point[];
}

const PointEditor = ({
  points,
  routeId,
  routeParentId,
}: Props): ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [insertPosition, setInsertPosition] = useState<InsertPosition>();
  const [openInitialWizard, setOpenInitialWizard] = useState(false);
  const createPoint = useAttachPoint(routeId);

  const editable = usePermissions(routeId)?.some(
    (permission) => permission === "write"
  );

  const selectedPointId = searchParams.get("p");

  useEffect(() => {
    const { data, isSuccess } = createPoint;

    if (isSuccess) {
      setInsertPosition(undefined);
      setOpenInitialWizard(false);
      changePoint(data.id);
    }
  }, [createPoint.isSuccess]);

  useEffect(() => {
    if (
      selectedPointId &&
      !points.some((point) => point.id === selectedPointId)
    ) {
      deselectPoint();
    }
  }, [points]);

  const pointLabeler = usePointLabeler(points);

  const changePoint = (pointId: string) => {
    setInsertPosition(undefined);

    if (pointId === selectedPointId) {
      deselectPoint();
    } else {
      setSearchParams({ p: pointId });
    }
  };

  const deselectPoint = () => {
    setSearchParams({});
  };

  const createFirst = () => {
    setOpenInitialWizard(true);
  };

  if (points.length === 0 || openInitialWizard) {
    return (
      <div data-tailwind="p-4 border-2 border-gray-300 border-dashed rounded-md">
        {openInitialWizard ? (
          <PointWizard
            mutation={createPoint}
            hint="anchor"
            position={insertPosition}
            onCancel={() => setOpenInitialWizard(false)}
            routeId={routeId}
            routeParentId={routeParentId}
            illegalPoints={points.map((point) => point.id)}
          />
        ) : (
          <div data-tailwind="flex flex-col items-center justify-center">
            <Restricted>
              <ActionIcon
                onClick={() => createFirst()}
                data-tailwind="mb-2.5"
                size="lg"
              >
                <IconPlus size={20} />
              </ActionIcon>
            </Restricted>
            <div data-tailwind="text-sm text-gray-600 text-center">
              <p>På den här leden finns ännu inga dokumenterade bultar.</p>
              <Restricted>
                <p data-tailwind="font-medium mt-2">
                  <span
                    onClick={() => createFirst()}
                    data-tailwind="text-primary-500 hover:text-primary-400 pr-1 cursor-pointer"
                  >
                    Lägg till
                  </span>
                  en första ledbult eller ankare.
                </p>
              </Restricted>
            </div>
          </div>
        )}
      </div>
    );
  }

  const selectedPoint = points.find((point) => point.id === selectedPointId);
  const navigable = insertPosition === undefined;

  const AddPointButton: FC<{ insertPosition: InsertPosition }> = ({
    insertPosition,
  }) => {
    return (
      <div data-tailwind="relative h-0 w-full my-0.5">
        <div data-tailwind="absolute z-10 w-full h-5 -top-2.5 flex justify-center items-center">
          <ActionIcon
            onClick={() => {
              deselectPoint();
              setInsertPosition(insertPosition);
            }}
            radius="xl"
            size="xs"
          >
            <IconPlus size={14} color="white" />
          </ActionIcon>
        </div>
      </div>
    );
  };

  return (
    <div
      data-tailwind={clsx("flex flex-col w-full sm:w-96", !editable && "gap-1")}
    >
      {points
        .slice()
        .reverse()
        .flatMap((point, index, array) => {
          const selected = point.id === selectedPointId;
          const showWizard = insertPosition?.pointId === point.id;
          const wizardAbove =
            insertPosition?.order === "after" ||
            (index > 0 &&
              insertPosition?.order === "before" &&
              insertPosition.pointId === array[index - 1].id);

          const { name, no } = pointLabeler(point.id);

          const cards = [];

          if (editable && index === 0) {
            cards.push(
              <AddPointButton
                key={`add-after-${point.id}`}
                insertPosition={{ pointId: point.id, order: "after" }}
              />
            );
          }

          cards.push(
            <Card
              key={point.id}
              lowerCutout={editable && !showWizard}
              upperCutout={editable && !wizardAbove}
            >
              {selected && selectedPoint !== undefined ? (
                <Suspense fallback={<Loader type="bars" />}>
                  <PointDetails
                    point={selectedPoint}
                    label={pointLabeler(selectedPoint.id)}
                    routeId={routeId}
                    onClose={deselectPoint}
                  />
                </Suspense>
              ) : (
                <div
                  data-tailwind={clsx(
                    "h-6 w-full cursor-pointer flex items-center justify-between",
                    navigable && "cursor-pointer"
                  )}
                  onClick={navigable ? () => changePoint(point.id) : undefined}
                >
                  <span>
                    {name}
                    <span data-tailwind="font-medium text-primary-500 ml-1">
                      {no}
                    </span>
                  </span>
                  <IconChevronRight size={14} />
                </div>
              )}
            </Card>
          );

          if (editable) {
            cards.push(
              <AddPointButton
                key={`add-before-${point.id}`}
                insertPosition={{ pointId: point.id, order: "before" }}
              />
            );
          }

          if (showWizard) {
            cards.splice(
              insertPosition.order === "after" ? 0 : cards.length - 1,
              1,
              <div key="new" data-tailwind="my-1">
                <Card dashed>
                  <PointWizard
                    mutation={createPoint}
                    position={insertPosition}
                    onCancel={() => setInsertPosition(undefined)}
                    routeId={routeId}
                    routeParentId={routeParentId}
                    illegalPoints={points.map((point) => point.id)}
                  />
                </Card>
              </div>
            );
          }

          return cards;
        })}
    </div>
  );
};

export default PointEditor;
