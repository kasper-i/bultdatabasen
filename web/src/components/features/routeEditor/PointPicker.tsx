import { Api } from "@/Api";
import { Point } from "@/models/point";
import { Route } from "@/models/route";
import { useRoutes } from "@/queries/routeQueries";
import { Select, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
    { enabled: selectedRoute !== undefined, suspense: false }
  );

  const pointLabeler = usePointLabeler(points ?? []);

  return (
    <Stack gap="sm">
      <Select
        label="Närliggande led"
        value={selectedRoute?.id}
        data={
          routes?.map((route) => ({
            label: route.name,
            value: route.id,
            disabled: route.id === targetRouteId,
          })) ?? []
        }
        onSelect={(event) => {
          onSelect(undefined);
          setSelectedRoute(
            routes?.find((route) => route.id == event.currentTarget.value)
          );
        }}
        nothingFoundMessage="Inga närliggande leder"
        multiple={false}
      />

      <Select
        key={selectedRoute?.id}
        label="Ledbult eller ankare"
        value={value}
        data={
          points
            ?.slice()
            ?.reverse()
            ?.map((point) => ({
              label: pointLabeler(point.id).name,
              sublabel: pointLabeler(point.id).no,
              value: point.id,
              disabled: illegalPoints.includes(point.id),
            })) ?? []
        }
        onSelect={(event) => onSelect(event.currentTarget.value)}
        nothingFoundMessage="Leden saknar dokumenterade bultar."
        disabled={selectedRoute === undefined}
        multiple={false}
      />
    </Stack>
  );
};

export default PointPicker;
