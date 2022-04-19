import PointEditor from "@/components/features/routeEditor/PointEditor";
import PageHeader from "@/components/PageHeader";
import { Underlined } from "@/components/Underlined";
import { useUnsafeParams } from "@/hooks/common";
import { RouteType } from "@/models/route";
import { useBolts } from "@/queries/boltQueries";
import { usePoints } from "@/queries/pointQueries";
import { useRoute } from "@/queries/routeQueries";
import React, { Fragment, ReactElement } from "react";

const renderRouteType = (routeType: RouteType) => {
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
  }
};

const RoutePage = (): ReactElement => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const route = useRoute(resourceId);
  const points = usePoints(resourceId);
  const bolts = useBolts(resourceId);

  if (
    route.data === undefined ||
    points.data === undefined ||
    bolts.data === undefined
  ) {
    return <Fragment />;
  }

  const { routeType, parentId, year, length } = route.data;

  return (
    <div className="flex flex-col">
      <PageHeader resourceId={resourceId} ancestors={route.data.ancestors} />

      <div className="flex items-center gap-2">
        <p className="text-lg">
          <Underlined>{renderRouteType(routeType)}</Underlined> från{" "}
          <Underlined>{year}</Underlined> som är{" "}
          <Underlined>{length}m</Underlined> lång och består av{" "}
          <Underlined>{bolts.data.length}</Underlined> bultar.
        </p>
      </div>

      <div className="mt-5">
        <PointEditor
          routeId={resourceId}
          routeParentId={parentId}
          points={points.data}
        />
      </div>
    </div>
  );
};

export default RoutePage;
