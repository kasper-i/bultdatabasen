import { Point } from "@/models/point";
import { useMemo } from "react";

export type PointLabel = { name: string; no: number };

export const usePointLabeler = (points: Point[]) => {
  return useMemo(() => {
    const labels: Map<string, PointLabel> = new Map();

    let anchors = 1;
    let nonAnchors = 1;

    for (const point of points) {
      labels.set(point.id, {
        name: point.anchor ? "Ankare" : "Punkt",
        no: point.anchor ? anchors++ : nonAnchors++,
      });
    }

    return (pointId: string) => labels.get(pointId) ?? { name: "", no: 0 };
  }, [points]);
};
