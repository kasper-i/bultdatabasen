import ChildrenTable from "components/ChildrenTable";
import PageHeader from "components/PageHeader";
import { useSector } from "queries/sectorQueries";
import React, { Fragment, ReactElement } from "react";
import { useParams } from "react-router";

const SectorPage = (): ReactElement => {
  const { sectorId } =
    useParams<{
      sectorId: string;
    }>();

  const sector = useSector(sectorId);

  if (sector.data == null) {
    return <Fragment />;
  }

  return (
    <div>
      <PageHeader resourceId={sectorId} resourceName={sector.data.name} />
      <ChildrenTable resourceId={sectorId} />
    </div>
  );
};

export default SectorPage;
