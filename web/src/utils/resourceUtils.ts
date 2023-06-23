import { Ancestor, ResourceType } from "@/models/resource";

export const getResourceLabel = (type: string): string | undefined => {
  switch (type) {
    case "area":
      return "Område";
    case "crag":
      return "Klippa";
    case "sector":
      return "Sektor";
    case "route":
      return "Led";
    case "image":
      return "Bild";
    case "bolt":
      return "Bult";
    case "task":
      return "Uppdrag";
    default:
      return undefined;
  }
};

export const getResourceRoute = (
  type: ResourceType,
  resourceId: string
): string => {
  switch (type) {
    case "area":
      return `/area/${resourceId}`;
    case "crag":
      return `/crag/${resourceId}`;
    case "sector":
      return `/sector/${resourceId}`;
    case "route":
      return `/route/${resourceId}`;
    default:
      return "/";
  }
};

export const getParent = (ancestors: Ancestor[]) => ancestors?.slice(-1)[0];
