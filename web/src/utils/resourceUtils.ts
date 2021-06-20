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
    default:
      return undefined;
  }
};

export const getResourceUrl = (
  type: string,
  resourceId: string
): string | undefined => {
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
      return undefined;
  }
};
