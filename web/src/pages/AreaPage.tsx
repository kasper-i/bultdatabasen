import Breadcrumbs from "components/Breadcrumbs";
import PageHeader from "components/PageHeader";
import { useArea } from "queries/areaQueries";
import React, { Fragment, ReactElement } from "react";
import { useParams } from "react-router";

interface Props {}

const AreaPage = ({}: Props): ReactElement => {
  const { areaId } =
    useParams<{
      areaId: string;
    }>();

  const area = useArea(areaId);

  if (area.data == null) {
    return <Fragment />;
  }

  return <PageHeader resourceId={areaId} resourceName={area.data.name} />;
};

export default AreaPage;
