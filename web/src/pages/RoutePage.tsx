import BoltEditor from "@/components/BoltEditor";
import PageHeader from "@/components/PageHeader";
import { RoleContext } from "@/contexts/RoleContext";
import { useUnsafeParams } from "@/hooks/common";
import { useBolts } from "@/queries/boltQueries";
import { usePoints } from "@/queries/pointQueries";
import { useRole } from "@/queries/roleQueries";
import { useRoute } from "@/queries/routeQueries";
import React, { Fragment, ReactElement } from "react";

const renderRouteType = (routeType: string) => {
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
  const { role } = useRole(resourceId);

  if (route.data == null || points.data == null || bolts.data == null) {
    return <Fragment />;
  }

  return (
    <RoleContext.Provider value={{ role }}>
      <div className="flex flex-col">
        <PageHeader
          resourceId={resourceId}
          resourceName={route.data.name}
          ancestors={route.data.ancestors}
        />
        <a href={route.data.externalLink}>{route.data.externalLink}</a>
        <div className="flex gap-2">
          <div>{route.data.year}</div>
          <div>{route.data.length} m</div>
          <div>{renderRouteType(route.data.routeType)}</div>
          <h3 className="text-xl font-bold">Bultar ({bolts.data.length})</h3>
        </div>

        <div className="mt-5">
          <BoltEditor routeId={resourceId} points={points.data} />
        </div>
      </div>
    </RoleContext.Provider>
  );
};

export default RoutePage;
