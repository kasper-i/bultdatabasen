import Breadcrumbs from "components/Breadcrumbs";
import PageHeader from "components/PageHeader";
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
  const { routeId } =
    useParams<{
      routeId: string;
    }>();

  const route = useRoute(routeId);

  if (route.data == null) {
    return <Fragment />;
  }

  return (
    <div className="flex flex-col">
      <PageHeader resourceId={routeId} resourceName={route.data.name} />
      <div>{route.data.year}</div>
      <div>{renderRouteType(route.data.routeType)}</div>
    </div>
  );
};

export default RoutePage;
