import ChildrenTable from "components/ChildrenTable";
import PageHeader from "components/PageHeader";
import { useSelectedResource } from "contexts/SelectedResourceProvider";
import { useSector } from "queries/sectorQueries";
import React, { Fragment, ReactElement, useEffect } from "react";
import { useParams } from "react-router-dom";

const SectorPage = (): ReactElement => {
  const { updateSelectedResource } = useSelectedResource();

  const { resourceId } = useParams<{
    resourceId: string;
  }>();

  const sector = useSector(resourceId);

  useEffect(() => {
    if (sector.data !== undefined) {
      updateSelectedResource({
        id: sector.data.id,
        name: sector.data.name,
        type: "sector",
        parentId: sector.data.parentId,
      });
    }
  }, [sector.data, updateSelectedResource]);

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
