import { InsertPosition } from "@/Api";
import { Point } from "@/models/point";
import { useRole } from "@/queries/roleQueries";
import React, { ReactElement, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import IconButton from "../../atoms/IconButton";
import { Card } from "./Card";
import PointCard from "./PointCard";
import { PointList } from "./PointList";
import PointWizard from "./PointWizard";

interface Props {
  routeId: string;
  points: Point[];
}

const PointEditor = ({ points, routeId }: Props): ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [insertPosition, setInsertPosition] = useState<InsertPosition>();
  const [openInitialWizard, setOpenInitialWizard] = useState(false);
  const { role } = useRole(routeId);

  const selectedPointId = searchParams.get("p");

  useEffect(() => {
    if (!points.some((point) => point.id === selectedPointId)) {
      deselectPoint();
    }
  }, [points]);

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
            hint="anchor"
            position={insertPosition}
            routeId={routeId}
            onCancel={() => setOpenInitialWizard(false)}
            onDone={(pointId) => {
              setOpenInitialWizard(false);
              changePoint(pointId);
            }}
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

  const dimmed = selectedPointId !== null;

  return (
    <PointList
      expandable={role === "owner"}
      onExpand={(index, order) => {
        deselectPoint();
        setInsertPosition({
          pointId: points[points.length - 1 - index].id,
          order,
        });
      }}
    >
      {points
        .slice()
        .reverse()
        .map((point, index) => {
          const selected = point.id === selectedPointId;

          const label =
            index === 0 ? (
              "Ankare"
            ) : (
              <span>
                Ledbult
                <span className="font-medium text-primary-600 ml-1">
                  #{points.length - index}
                </span>
              </span>
            );

          if (insertPosition && insertPosition.pointId === point.id) {
            return (
              <PointList.Entry
                key={point.id}
                label={label}
                selected={false}
                position={insertPosition.order === "after" ? "above" : "below"}
              >
                <Card>
                  <PointWizard
                    position={insertPosition}
                    routeId={routeId}
                    onCancel={() => setInsertPosition(undefined)}
                    onDone={(pointId) => {
                      setInsertPosition(undefined);
                      changePoint(pointId);
                    }}
                  />
                </Card>
              </PointList.Entry>
            );
          } else {
            return (
              <PointList.Entry
                key={point.id}
                label={label}
                onClick={() => changePoint(point.id)}
                selected={selected}
                dimmed={dimmed}
              >
                {selected && (
                  <Card>
                    <PointCard point={point} routeId={routeId} />
                  </Card>
                )}
              </PointList.Entry>
            );
          }
        })}
    </PointList>
  );
};

export default PointEditor;
