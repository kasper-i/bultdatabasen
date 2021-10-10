import { queryClient } from "index";
import { Bolt } from "models/bolt";
import { Point } from "models/point";
import { useMutation, useQuery } from "react-query";
import { Api, CreatePointRequest } from "../Api";

export const usePoints = (routeId: string) =>
  useQuery<Point[]>(["points", { resourceId: routeId }], () =>
    Api.getPoints(routeId)
  );

export const useAttachPoint = (routeId: string) =>
  useMutation((request: CreatePointRequest) => Api.addPoint(routeId, request), {
    onSuccess: async (data, variables, context) => {
      queryClient.setQueryData<Point[] | undefined>(
        ["points", { resourceId: routeId }],
        (points) => {
          if (points === undefined) {
            return undefined;
          }

          if (points.length === 0) {
            return [{ ...data, number: 1 }];
          }

          const index = points.findIndex(
            (point) => point.id === variables.position?.pointId
          );

          const updatedPoints = [...points];

          if (variables.position?.order === "after") {
            updatedPoints.splice(index + 1, 0, data);
          } else {
            updatedPoints.splice(index, 0, data);
          }

          let number = 1;
          return updatedPoints.map((point) => ({ ...point, number: number++ }));
        }
      );

      queryClient.refetchQueries(["bolts", { resourceId: routeId }]);
    },
  });

export const useDetachPoint = (routeId: string, pointId: string) =>
  useMutation(() => Api.detachPoint(routeId, pointId), {
    onSuccess: async (data, variables, context) => {
      queryClient.setQueryData<Point[] | undefined>(
        ["points", { resourceId: routeId }],
        (points) => {
          if (points === undefined) {
            return undefined;
          }

          const updatedPoints = points.filter((point) => point.id !== pointId);

          let number = 1;
          return updatedPoints.map((point) => ({ ...point, number: number++ }));
        }
      );

      queryClient.setQueryData<Bolt[] | undefined>(
        ["bolts", { resourceId: routeId }],
        (bolts) => {
          if (bolts === undefined) {
            return undefined;
          }

          return bolts.filter((bolt) => bolt.parentId !== pointId);
        }
      );
    },
  });
