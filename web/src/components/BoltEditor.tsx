import { InsertPosition } from "@/Api";
import { Point } from "@/models/point";
import { useAttachPoint } from "@/queries/pointQueries";
import { useRole } from "@/queries/roleQueries";
import { clear, selectPointId } from "@/slices/clipboardSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import clsx from "clsx";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import IconButton from "./atoms/IconButton";
import PointCard from "./PointCard";
import PointWizard from "./PointWizard";

interface Props {
  routeId: string;
  points: Point[];
}

const BoltEditor = ({ points, routeId }: Props): ReactElement => {
  const [selectedPointId, setSelectedPointId] = useState<string>();
  const { role } = useRole(routeId);
  const copiedPointId = useAppSelector(selectPointId);
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const createPoint = useAttachPoint(routeId);

  const changePoint = (pointId: string) => {
    if (pointId === selectedPointId) {
      setSearchParams({});
      setSelectedPointId(undefined);
    } else {
      setSearchParams({ p: pointId });
      setSelectedPointId(pointId);
    }
  };

  useEffect(() => {
    if (selectedPointId !== undefined) {
      return;
    }

    const pointId = searchParams.get("p");

    if (pointId !== null) {
      setSelectedPointId(pointId);
    }
  }, [selectedPointId, points]);

  const selectedPoint = useMemo(() => {
    return points.find((point) => point.id === selectedPointId);
  }, [points, selectedPointId]);

  const editable = role === "owner";

  const attachPoint = (position?: InsertPosition) => {
    createPoint.mutate({
      pointId: copiedPoint ?? undefined,
      position,
      bolts: [{}],
    });

    dispatch(clear);
  };

  const copiedPoint = copiedPointId;

  if (points.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-md">
        <IconButton
          onClick={() => attachPoint(undefined)}
          icon="plus"
          className="mb-2.5"
        />
        <div className="text-sm text-gray-600 text-center">
          <p className="mb-2">
            På den här leden finns ännu inga dokumenterade bultar.
          </p>
          <p className="font-medium">
            <span
              onClick={() => attachPoint(undefined)}
              className="text-primary-500 hover:text-primary-400 pr-1 cursor-pointer"
            >
              Lägg till
            </span>
            en första bult eller ankare.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {points
        .slice()
        .reverse()
        .map((point, index) => {
          const first = index === points.length - 1;
          const anchor = index === 0;
          const intermediate = !first && !anchor;
          const selected = point.id === selectedPointId;

          return (
            <li key={point.id} className="flex items-start gap-4">
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center w-full">
                  <div
                    onClick={() => changePoint(point.id)}
                    className={clsx(
                      "relative cursor-pointer rounded-full h-3 w-3 ring-2 ring-offset-2 ring-offset-gray-100 mr-4",
                      selected
                        ? "bg-primary-500 ring-primary-500"
                        : "bg-gray-100 ring-primary-500"
                    )}
                  />
                  <div className={clsx("relative w-full text-gray-600")}>
                    <div
                      onClick={() => changePoint(point.id)}
                      className={clsx(
                        "cursor-pointer text-gray-600",
                        selectedPointId && "opacity-20"
                      )}
                    >
                      {index === 0 ? (
                        "Ankare"
                      ) : (
                        <span>
                          Placering
                          <span className="font-medium text-primary-600 ml-1">
                            #{points.length - index}
                          </span>
                        </span>
                      )}
                    </div>

                    {point.id === selectedPointId && (
                      <div className="z-10 absolute top-0 left-0 right-0 pb-4">
                        {false ? (
                          <PointCard point={point} routeId={routeId} />
                        ) : (
                          <PointWizard point={point} routeId={routeId} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {index !== points.length - 1 && (
                  <div className="w-3 flex justify-center">
                    <div className="mx-auto h-10 border-l-4 border-dotted my-0.5 border-primary-500"></div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
    </ul>
  );
};

export default BoltEditor;
