import { InsertPosition } from "Api";
import { Point } from "models/point";
import { useAttachPoint } from "queries/pointQueries";
import { useRole } from "queries/roleQueries";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Button } from "semantic-ui-react";
import BoltCircle from "./BoltCircle";
import Branch from "./graph/Branch";
import Connector from "./graph/Connector";
import Edge from "./graph/Edge";
import Graph from "./graph/Graph";
import Junction, { Orientation } from "./graph/Junction";
import Vertex from "./graph/Vertex";
import PointCard from "./PointCard";
import Restricted from "./Restricted";

interface Props {
  routeId: string;
  points: Point[];
}

const BoltEditor = ({ points, routeId }: Props): ReactElement => {
  const [selectedPointId, setSelectedPointId] = useState<string>();
  const { role } = useRole(routeId);
  const history = useHistory();

  const createPoint = useAttachPoint(routeId);

  const { pointId } = useParams<{
    pointId?: string;
  }>();

  const changePoint = (pointId: string) => {
    history.replace(`/route/${routeId}/point/${pointId}`);
    setSelectedPointId(pointId);
  };

  useEffect(() => {
    if (selectedPointId !== undefined) {
      return;
    }

    if (pointId !== undefined) {
      setSelectedPointId(pointId);
    } else {
      setSelectedPointId(
        points.length > 0 ? points[points.length - 1].id : undefined
      );
    }
  }, [pointId, selectedPointId, points]);

  const selectedPointNumber = useMemo(() => {
    let number = 1;
    for (const point of points) {
      if (point.id === selectedPointId) {
        break;
      }

      number += 1;
    }

    return number;
  }, [points, selectedPointId]);

  const selectedPoint = useMemo(() => {
    return points.find((point) => point.id === selectedPointId);
  }, [points, selectedPointId]);

  const editable = role === "owner";

  const getOffset = () => {
    if (editable) {
      return (points.length - selectedPointNumber) * 112 + 56;
    } else {
      return (points.length - selectedPointNumber) * 84;
    }
  };

  const attachPoint = (position?: InsertPosition) => {
    createPoint.mutate({
      pointId: copiedPoint ?? undefined,
      position,
    });

    sessionStorage.removeItem("copiedPoint");
  };

  const copiedPoint = sessionStorage.getItem("copiedPoint");
  const attachIcon = copiedPoint != null ? "paste" : "plus";

  return (
    <div className="flex items-start">
      <Graph expandable={editable}>
        {points
          .slice()
          .reverse()
          .map((point, index) => {
            const first = index === points.length - 1;
            const anchor = index === 0;
            const intermediate = !first && !anchor;
            const selected = point.id === selectedPointId;

            return (
              <Junction
                key={point.id}
                compact={!editable}
                compressTop={!editable && anchor}
                compressBottom={!editable && first}
              >
                <Vertex>
                  <BoltCircle
                    active={selected}
                    point={point}
                    onClick={changePoint}
                    main
                  />

                  {(anchor || intermediate) && (
                    <Connector half orientation={Orientation.SOUTH}>
                      <Edge main />
                    </Connector>
                  )}

                  {(first || intermediate) && (
                    <Connector half orientation={Orientation.NORTH}>
                      <Edge main />
                    </Connector>
                  )}
                </Vertex>

                {(first || intermediate) && (
                  <Vertex orientation={Orientation.NORTH}>
                    <Restricted>
                      <Button
                        circular
                        size="mini"
                        icon={attachIcon}
                        onClick={() =>
                          attachPoint({
                            pointId: point.id,
                            order: "after",
                          })
                        }
                      />
                    </Restricted>
                  </Vertex>
                )}

                {anchor && (
                  <Restricted>
                    <Branch main orientation={Orientation.NORTH}>
                      <Button
                        circular
                        size="mini"
                        icon={attachIcon}
                        onClick={() =>
                          attachPoint({
                            pointId: point.id,
                            order: "after",
                          })
                        }
                      />
                    </Branch>
                  </Restricted>
                )}

                {first && (
                  <Restricted>
                    <Branch main orientation={Orientation.SOUTH}>
                      <Button
                        circular
                        size="mini"
                        icon={attachIcon}
                        onClick={() =>
                          attachPoint({
                            pointId: point.id,
                            order: "before",
                          })
                        }
                      />
                    </Branch>
                  </Restricted>
                )}
              </Junction>
            );
          })}
        {points.length === 0 && (
          <Restricted>
            <Junction compact>
              <Vertex>
                <Button
                  circular
                  icon={attachIcon}
                  onClick={() => attachPoint(undefined)}
                />
              </Vertex>
            </Junction>
          </Restricted>
        )}
      </Graph>
      {selectedPoint && (
        <div
          style={{
            marginTop: getOffset(),
          }}
          className="w-full bg-white rounded shadow-sm ml-5 mb-5 flex-shrink"
        >
          <PointCard
            point={selectedPoint}
            routeId={routeId}
            number={selectedPointNumber}
          />
        </div>
      )}
    </div>
  );
};

export default BoltEditor;
