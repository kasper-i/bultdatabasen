import PageHeader from "components/PageHeader";
import { useBolts } from "queries/boltQueries";
import { useRoute } from "queries/routeQueries";
import React, { Fragment, ReactElement } from "react";
import { useParams } from "react-router";
import { Button } from "semantic-ui-react";

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
  const bolts = useBolts(routeId);

  if (route.data == null || bolts.data == null) {
    return <Fragment />;
  }

  const glueBolts = bolts.data.filter((bolt) => bolt.type == "glue");
  const expansionBolts = bolts.data.filter((bolt) => bolt.type == "expansion");

  const boltInfo = () => {
    return bolts.data.length > 0
      ? `${glueBolts.length} lim, ${expansionBolts.length} expander`
      : "";
  };

  return (
    <div className="flex flex-col">
      <PageHeader resourceId={routeId} resourceName={route.data.name} />
      <div>{route.data.year}</div>
      <div>{route.data.length} m</div>
      <div>{renderRouteType(route.data.routeType)}</div>
      <div>
        <a href={route.data.externalLink}>{route.data.externalLink}</a>
      </div>

      <h3 className="text-xl font-bold pt-5">Bultar ({bolts.data.length})</h3>
      <div>{boltInfo()}</div>
      <Button fluid={false} disabled>
        Lägg till bult
      </Button>
    </div>
  );
};

export default RoutePage;
