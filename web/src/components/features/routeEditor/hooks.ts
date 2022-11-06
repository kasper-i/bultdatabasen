import { Point } from "@/models/point";
import { useMemo } from "react";

export type PointLabel = { name: string; no?: string };

export const usePointLabeler = (points: Point[]) => {
  return useMemo(() => {
    const labels: Map<string, PointLabel> = new Map();

    let anchorNo = 1;
    let nonAnchorNo = 1;

    const multiAnchorRoute = points.filter((point) => point.anchor).length > 1;

    for (const point of points) {
      let no: number | undefined = point.anchor ? anchorNo++ : nonAnchorNo++;
      if (point.anchor && !multiAnchorRoute) {
        no = undefined;
      }

      labels.set(point.id, {
        name: point.anchor ? "Ankare" : "Punkt",
        no: no ? `№${no}` : undefined,
      });
    }

    return (pointId: string): PointLabel =>
      labels.get(pointId) ?? { name: "?", no: "" };
  }, [points]);
};
