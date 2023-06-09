import { RouteType } from "@/models/route";

export const renderRouteType = (routeType: RouteType) => {
  switch (routeType) {
    case "sport":
      return "Sportled";
    case "traditional":
      return "Tradled";
    case "partially_bolted":
      return "Mixled";
    case "top_rope":
      return "Topprepsled";
    case "aid":
      return "Aidled";
    case "dws":
      return "Djupvattensolo";
  }
};
