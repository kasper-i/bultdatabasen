import ChildrenTable from "components/ChildrenTable";
import PageHeader from "components/PageHeader";
import { useCrag } from "queries/cragQueries";
import React, { Fragment, ReactElement } from "react";
import { useParams } from "react-router";

const CragPage = (): ReactElement => {
  const { resourceId } = useParams<{
    resourceId: string;
  }>();

  const crag = useCrag(resourceId);

  if (crag.data == null) {
    return <Fragment />;
  }

  return (
    <div className="flex flex-col space-y-5">
      <PageHeader
        resourceId={resourceId}
        resourceName={crag.data.name}
        showCounts
      />
      <ChildrenTable resourceId={resourceId} />
    </div>
  );
};

export default CragPage;
