import ChildrenTable from "components/ChildrenTable";
import PageHeader from "components/PageHeader";
import { useArea } from "queries/areaQueries";
import React, { Fragment, ReactElement } from "react";
import { useParams } from "react-router";

const AreaPage = (): ReactElement => {
  const { areaId } =
    useParams<{
      areaId: string;
    }>();

  const area = useArea(areaId);

  if (area.data == null) {
    return <Fragment />;
  }

  return (
    <div>
      <PageHeader resourceId={areaId} resourceName={area.data.name} />
      <ChildrenTable resourceId={areaId} />
    </div>
  );
};

export default AreaPage;
