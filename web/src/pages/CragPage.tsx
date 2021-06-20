import ChildrenTable from "components/ChildrenTable";
import PageHeader from "components/PageHeader";
import { useCrag } from "queries/cragQueries";
import React, { Fragment, ReactElement } from "react";
import { useParams } from "react-router";

const CragPage = (): ReactElement => {
  const { cragId } =
    useParams<{
      cragId: string;
    }>();

  const crag = useCrag(cragId);

  if (crag.data == null) {
    return <Fragment />;
  }

  return (
    <div>
      <PageHeader resourceId={cragId} resourceName={crag.data.name} />
      <ChildrenTable resourceId={cragId} />
    </div>
  );
};

export default CragPage;
