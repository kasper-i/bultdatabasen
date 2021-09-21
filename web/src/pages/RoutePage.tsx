import BoltEditor from "components/BoltEditor";
import PageHeader from "components/PageHeader";
import { RoleContext } from "contexts/RoleContext";
import { useSelectedResource } from "contexts/SelectedResourceProvider";
import { useBolts } from "queries/boltQueries";
import { usePoints } from "queries/pointQueries";
import { useRole } from "queries/roleQueries";
import { useRoute } from "queries/routeQueries";
import React, { Fragment, ReactElement, useEffect } from "react";
import { useParams } from "react-router-dom";

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
  const { updateSelectedResource } = useSelectedResource();

  const { resourceId } = useParams<{
    resourceId: string;
  }>();

  const route = useRoute(resourceId);

  useEffect(() => {
    if (route.data !== undefined) {
      updateSelectedResource({
        id: route.data.id,
        name: route.data.name,
        type: "route",
        parentId: route.data.parentId,
      });
    }
  }, [route.data, updateSelectedResource]);

  const points = usePoints(resourceId);
  const bolts = useBolts(resourceId);
  const { role } = useRole(resourceId);

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
        <PageHeader resourceId={resourceId} resourceName={route.data.name} />
        <div>{route.data.year}</div>
        <div>{route.data.length} m</div>
        <div>{renderRouteType(route.data.routeType)}</div>
        <div>
          <a href={route.data.externalLink}>{route.data.externalLink}</a>
        </div>

        <h3 className="text-xl font-bold">Bultar ({bolts.data.length})</h3>
        <div>{boltInfo()}</div>
        <div className="mt-5">
          <BoltEditor routeId={resourceId} points={points.data} />
        </div>
      </div>
    </RoleContext.Provider>
  );
};

export default RoutePage;
