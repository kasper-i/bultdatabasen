import BoltEditor from "components/BoltEditor";
import PageHeader from "components/PageHeader";
import { RoleContext } from "contexts/RoleContext";
import { useBolts } from "queries/boltQueries";
import { usePoints } from "queries/pointQueries";
import { useRole } from "queries/roleQueries";
import { useRoute } from "queries/routeQueries";
import React, { Fragment, ReactElement } from "react";
import { useParams } from "react-router";

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
  const { routeId } = useParams<{
    routeId: string;
  }>();

  const route = useRoute(routeId);
  const points = usePoints(routeId);
  const bolts = useBolts(routeId);
  const { role } = useRole(routeId);

  if (route.data == null || points.data == null || bolts.data == null) {
    return <Fragment />;
  }

  const glueBolts = bolts.data.filter((bolt) => bolt.type === "glue");
  const expansionBolts = bolts.data.filter((bolt) => bolt.type === "expansion");

  const boltInfo = () => {
    return bolts.data.length > 0
      ? `${glueBolts.length} lim, ${expansionBolts.length} expander`
      : "";
  };

  return (
    <RoleContext.Provider value={{ role }}>
      <div className="flex flex-col">
        <PageHeader resourceId={routeId} resourceName={route.data.name} />
        <div>{route.data.year}</div>
        <div>{route.data.length} m</div>
        <div>{renderRouteType(route.data.routeType)}</div>
        <div>
          <a href={route.data.externalLink}>{route.data.externalLink}</a>
        </div>

        <h3 className="text-xl font-bold">Bultar ({bolts.data.length})</h3>
        <div>{boltInfo()}</div>
        <div className="mt-5">
          <BoltEditor routeId={routeId} points={points.data} />
        </div>
      </div>
    </RoleContext.Provider>
  );
};

export default RoutePage;
