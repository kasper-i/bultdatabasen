import { Point } from "models/point";
import { useCreatePoint } from "queries/pointQueries";
import { useRole } from "queries/roleQueries";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { Button } from "semantic-ui-react";
import BoltCircle from "./BoltCircle";
import Branch from "./graph/Branch";
import Connector from "./graph/Connector";
import Edge from "./graph/Edge";
import Graph from "./graph/Graph";
import Junction, { Orientation } from "./graph/Junction";
import Vertex from "./graph/Vertex";
import Restricted from "./Restricted";
import PointCard from "./PointCard";

interface Props {
  routeId: string;
  points: Point[];
}

const BoltEditor = ({ points, routeId }: Props): ReactElement => {
  const [selectedPointId, setSelectedPointId] = useState<string>();
  const { role } = useRole(routeId);

  const location = useLocation();

  const createPoint = useCreatePoint(routeId);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const point = query.get("point");

    if (point != null) {
      setSelectedPointId(point);
    }
  }, [location]);

  const mainPoints = useMemo(() => {
    return new Map(points.map((point) => [point.id, point]));
  }, [points]);

  const orderedPoints = useMemo(() => {
    let firstPoint: Point | undefined = undefined;

    for (const point of points) {
      if (
        point.incoming == null ||
        point.incoming.filter((point) => mainPoints.has(point.id)).length === 0
      ) {
        firstPoint = point;
        break;
      }
    }

    if (firstPoint == null) {
      return [];
    }

    const orderedPoints: Point[] = [firstPoint];
    let currentPoint: Point = firstPoint;

    while (true) {
      let nextPoint: Point | undefined = undefined;

      if (
        currentPoint?.outgoing == null ||
        currentPoint.outgoing.length === 0
      ) {
        break;
      } else {
        const candidates = currentPoint.outgoing.filter((point) =>
          mainPoints.has(point.id)
        );

        if (candidates.length !== 1) {
          break;
        } else {
          const nextPointId = candidates[0].id;
          nextPoint = mainPoints.get(nextPointId);
        }
      }

      if (nextPoint != null) {
        orderedPoints.push(nextPoint);
        currentPoint = nextPoint;
      } else {
        break;
      }
    }

    return orderedPoints;
  }, [points, mainPoints]);

  useEffect(() => {
    if (selectedPoint === undefined) {
      setSelectedPointId(
        orderedPoints.length > 0
          ? orderedPoints[orderedPoints.length - 1].id
          : undefined
      );
    }
  }, [orderedPoints]);

  const selectedPointNumber = useMemo(() => {
    let number = 1;
    for (const point of orderedPoints) {
      if (point.id === selectedPointId) {
        break;
      }

      number += 1;
    }

    return number;
  }, [orderedPoints, selectedPointId]);

  const selectedPoint = useMemo(() => {
    return orderedPoints.find((point) => point.id === selectedPointId);
  }, [orderedPoints, selectedPointId]);

  const editable = role === "owner";

  const getOffset = () => {
    if (editable) {
      return (orderedPoints.length - selectedPointNumber) * 112 + 56;
    } else {
      return (orderedPoints.length - selectedPointNumber) * 84;
    }
  };

  return (
    <div className="flex items-start">
      <Graph expandable={editable}>
        {orderedPoints
          .slice()
          .reverse()
          .map((point, index) => {
            const first = index === orderedPoints.length - 1;
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
                    onClick={setSelectedPointId}
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
                      <Button size="mini" circular icon="plus" />
                    </Restricted>
                  </Vertex>
                )}

                {anchor && (
                  <Restricted>
                    <Branch main orientation={Orientation.NORTH}>
                      <Button
                        circular
                        size="mini"
                        icon="plus"
                        onClick={() =>
                          createPoint.mutate({
                            direction: "outgoing",
                            linkedPointId: point.id,
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
                        icon="plus"
                        onClick={() =>
                          createPoint.mutate({
                            direction: "incoming",
                            linkedPointId: point.id,
                          })
                        }
                      />
                    </Branch>
                  </Restricted>
                )}
              </Junction>
            );
          })}
        {orderedPoints.length === 0 && (
          <Restricted>
            <Junction compact>
              <Vertex>
                <Button
                  circular
                  icon="plus"
                  onClick={() => createPoint.mutate(undefined)}
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
