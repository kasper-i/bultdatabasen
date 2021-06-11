import Breadcrumbs from "components/Breadcrumbs";
import PageHeader from "components/PageHeader";
import { useRoute } from "queries/routeQueries";
import React, { Fragment, ReactElement } from "react";
import { useParams } from "react-router";

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
    <div>
      <PageHeader resourceId={routeId} resourceName={route.data.name} />
    </div>
  );
};

export default RoutePage;
