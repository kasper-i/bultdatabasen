import { InsertPosition } from "@/Api";
import Icon from "@/components/atoms/Icon";
import Loader from "@/components/atoms/Loader";
import { Point } from "@/models/point";
import { useAttachPoint } from "@/queries/pointQueries";
import { useRole } from "@/queries/roleQueries";
import clsx from "clsx";
import React, { FC, ReactElement, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import IconButton from "../../atoms/IconButton";
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

  const { role } = useRole(routeId);

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
    if (!points.some((point) => point.id === selectedPointId)) {
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
      <div className="p-4 border-2 border-gray-300 border-dashed rounded-md">
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
          <div className="flex flex-col items-center justify-center">
            <IconButton
              onClick={() => createFirst()}
              icon="plus"
              className="mb-2.5"
            />
            <div className="text-sm text-gray-600 text-center">
              <p className="mb-2">
                På den här leden finns ännu inga dokumenterade bultar.
              </p>
              <p className="font-medium">
                <span
                  onClick={() => createFirst()}
                  className="text-primary-500 hover:text-primary-400 pr-1 cursor-pointer"
                >
                  Lägg till
                </span>
                en första ledbult eller ankare.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const selectedPoint = points.find((point) => point.id === selectedPointId);
  const editable = role === "owner";

  const AddPointButton: FC<{ insertPosition: InsertPosition }> = ({
    insertPosition,
  }) => {
    return (
      <div className="relative h-0 w-full my-0.5">
        <div className="absolute z-10 w-full h-5 -top-2.5 flex justify-center items-center">
          <button
            onClick={() => {
              deselectPoint();
              setInsertPosition(insertPosition);
            }}
            className="flex justify-center items-center h-5 w-5 bg-primary-500 hover:bg-primary-600 focus:ring-primary-400 shadow-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-gray-100"
          >
            <Icon name="plus" className="h-4 w-4 text-white"></Icon>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx("flex flex-col", !editable && "gap-1")}>
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
                <Suspense fallback={<Loader active />}>
                  <PointDetails
                    point={selectedPoint}
                    label={pointLabeler(selectedPoint.id)}
                    routeId={routeId}
                    onClose={deselectPoint}
                  />
                </Suspense>
              ) : (
                <p
                  className="cursor-pointer"
                  onClick={() => changePoint(point.id)}
                >
                  {name}
                  <span className="font-medium text-primary-600 ml-1">
                    #{no}
                  </span>
                </p>
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
              <div key="new" className="my-1">
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
