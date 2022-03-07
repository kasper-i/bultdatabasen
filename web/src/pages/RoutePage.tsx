import BoltEditor from "@/components/BoltEditor";
import PageHeader from "@/components/PageHeader";
import { useUnsafeParams } from "@/hooks/common";
import { RouteType } from "@/models/route";
import { useBolts } from "@/queries/boltQueries";
import { usePoints } from "@/queries/pointQueries";
import { useRoute } from "@/queries/routeQueries";
import React, { Fragment, ReactElement } from "react";
import { Button, Icon } from "semantic-ui-react";

const renderRouteType = (routeType: RouteType) => {
  switch (routeType) {
    case "sport":
      return "Sport";
    case "traditional":
      return "Trad";
    case "partially_bolted":
      return "Mix";
  }
};

const RoutePage = (): ReactElement => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const route = useRoute(resourceId);
  const points = usePoints(resourceId);
  const bolts = useBolts(resourceId);

  if (route.data == null || points.data == null || bolts.data == null) {
    return <Fragment />;
  }

  const { routeType, year, length, externalLink } = route.data;

  return (
    <div className="flex flex-col">
      <PageHeader
        resourceId={resourceId}
        resourceName={route.data.name}
        ancestors={route.data.ancestors}
      />

      <div className="flex items-center gap-2">
        <div>{renderRouteType(routeType)}</div>
        {year && <div>{year}</div>}
        {length && <div>{length}m</div>}
        <a href={externalLink}>
          <Icon name="external" />
        </a>
      </div>

      <div className="mt-5">
        <BoltEditor routeId={resourceId} points={points.data} />
      </div>
    </div>
  );
};

export default RoutePage;
