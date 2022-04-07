import { InsertPosition } from "@/Api";
import { Point } from "@/models/point";
import { useAttachPoint } from "@/queries/pointQueries";
import { useRole } from "@/queries/roleQueries";
import React, { ReactElement, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePrevious } from "react-use";
import IconButton from "../../atoms/IconButton";
import { Card } from "./Card";
import { usePointLabeler } from "./hooks";
import PointDetails from "./PointDetails";
import { Entry, PointNavigator } from "./PointNavigator";
import PointWizard from "./PointWizard";

interface Props {
  routeId: string;
  points: Point[];
}

const PointEditor = ({ points, routeId }: Props): ReactElement => {
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

  const hideLabels = selectedPointId !== null || insertPosition !== undefined;

  const selectedPoint = points.find((point) => point.id === selectedPointId);

  const entries = points
    .slice()
    .reverse()
    .map<Entry>((point) => {
      const selected = point.id === selectedPointId;

      const { name, no } = pointLabeler(point.id);

      return {
        pointId: point.id,
        label: (
          <p>
            {name}
            <span className="font-medium text-primary-600 ml-1">#{no}</span>
          </p>
        ),
        selected,
        onClick: () => changePoint(point.id),
      };
    });

  const renderCard = () => {
    if (insertPosition) {
      return (
        <Card dashed>
          <PointWizard
            mutation={createPoint}
            position={insertPosition}
            onCancel={() => setInsertPosition(undefined)}
          />
        </Card>
      );
    }

    if (selectedPoint) {
      return (
        <Card>
          <PointDetails
            point={selectedPoint}
            label={pointLabeler(selectedPoint.id)}
            routeId={routeId}
          />
        </Card>
      );
    }

    return null;
  };

  return (
    <PointNavigator
      expandable={role === "owner"}
      onExpand={(pointId, order) => {
        deselectPoint();
        setInsertPosition({
          pointId,
          order,
        });
      }}
      entries={entries}
      contentPointId={insertPosition ? insertPosition.pointId : selectedPointId}
      position={insertPosition?.order}
      hideLabels={hideLabels}
    >
      {renderCard()}
    </PointNavigator>
  );
};

export default PointEditor;
