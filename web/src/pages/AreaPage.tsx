import ChildrenTable from "components/ChildrenTable";
import PageHeader from "components/PageHeader";
import { useArea } from "queries/areaQueries";
import React, { Fragment, ReactElement } from "react";
import { useParams } from "react-router";

const AreaPage = (): ReactElement => {
  const { resourceId } = useParams<{
    resourceId: string;
  }>();

  const area = useArea(resourceId);

  if (area.data == null) {
    return <Fragment />;
  }

  return (
    <div className="flex flex-col space-y-5">
      <PageHeader
        resourceId={resourceId}
        resourceName={area.data.name}
        showCounts
      />
      <ChildrenTable resourceId={resourceId} />
    </div>
  );
};

export default AreaPage;
