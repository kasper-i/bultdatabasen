import { Api } from "@/Api";
import { Combobox } from "@/components/atoms/Combobox";
import { Point } from "@/models/point";
import { Route } from "@/models/route";
import { useRoutes } from "@/queries/routeQueries";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { usePointLabeler } from "./hooks";

type Props = {
  value?: string;
  onSelect: (pointId: string | undefined) => void;
  targetRouteId: string;
  targetRouteParentId: string;
  illegalPoints: string[];
};

const PointPicker = ({
  value,
  onSelect,
  targetRouteId,
  targetRouteParentId,
  illegalPoints,
}: Props) => {
  const { data: routes } = useRoutes(targetRouteParentId);
  const [selectedRoute, setSelectedRoute] = useState<Route>();
  const { data: points } = useQuery<Point[]>(
    ["points", { resourceId: selectedRoute?.id }],
    () => Api.getPoints(`${selectedRoute?.id}`),
    { enabled: selectedRoute !== undefined }
  );

  const pointLabeler = usePointLabeler(points ?? []);

  return (
    <div>
      <div className="flex flex-col gap-2">
        <Combobox<Route>
          label="Närliggande led"
          value={selectedRoute}
          options={
            routes?.map((route) => ({
              label: route.name,
              value: route,
              key: route.id,
              disabled: route.id === targetRouteId,
            })) ?? []
          }
          onSelect={(route) => {
            onSelect(undefined);
            console.log("selecting route", route);
            setSelectedRoute(route);
          }}
          displayValue={(route) => route.name}
          noOptionsText="Inga närliggande leder"
        />

        <Combobox<Point>
          key={selectedRoute?.id}
          label="Ledbult eller ankare"
          value={points?.find((point) => point.id === value)}
          options={
            points
              ?.slice()
              ?.reverse()
              ?.map((point) => ({
                label: pointLabeler(point.id).name,
                sublabel: "#" + pointLabeler(point.id).no,
                value: point,
                key: point.id,
                disabled: illegalPoints.includes(point.id),
              })) ?? []
          }
          onSelect={(point) => onSelect(point.id)}
          displayValue={(point) => {
            const { name, no } = pointLabeler(point.id);
            return `${name} #${no}`;
          }}
          noOptionsText="Leden saknar bultar"
          disabled={selectedRoute === undefined}
        />
      </div>
    </div>
  );
};

export default PointPicker;
