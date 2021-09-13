import ChildrenTable from "components/ChildrenTable";
import PageHeader from "components/PageHeader";
import { useSector } from "queries/sectorQueries";
import React, { Fragment, ReactElement } from "react";
import { useParams } from "react-router";

const SectorPage = (): ReactElement => {
  const { resourceId } = useParams<{
    resourceId: string;
  }>();

  const sector = useSector(resourceId);

  if (sector.data == null) {
    return <Fragment />;
  }

  return (
    <div className="flex flex-col space-y-5">
      <PageHeader
        resourceId={resourceId}
        resourceName={sector.data.name}
        showCounts
      />
      <ChildrenTable resourceId={resourceId} />
    </div>
  );
};

export default SectorPage;
