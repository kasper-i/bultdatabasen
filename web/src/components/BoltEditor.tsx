import { InsertPosition } from "@/Api";
import { Point } from "@/models/point";
import { useAttachPoint } from "@/queries/pointQueries";
import { useRole } from "@/queries/roleQueries";
import { clear, selectPointId } from "@/slices/clipboardSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import clsx from "clsx";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import IconButton from "./base/IconButton";

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
    setSearchParams({ p: pointId });
    setSelectedPointId(pointId);
  };

  useEffect(() => {
    if (selectedPointId !== undefined) {
      return;
    }

    const pointId = searchParams.get("p");

    if (pointId !== null) {
      setSelectedPointId(pointId);
    } else {
      setSelectedPointId(
        points.length > 0 ? points[points.length - 1].id : undefined
      );
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
              <div className="flex flex-col items-start">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => changePoint(point.id)}
                >
                  <div
                    className={clsx(
                      "relative rounded-full h-3 w-3 ring-2 ring-offset-2 ring-offset-gray-100",

                      selected
                        ? "bg-primary-500 ring-primary-500"
                        : "bg-gray-100 ring-primary-500"
                    )}
                  />
                  <div className="ml-4 text-gray-600">
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
