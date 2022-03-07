import ChildrenTable from "@/components/ChildrenTable";
import PageHeader from "@/components/PageHeader";
import { useUnsafeParams } from "@/hooks/common";
import { useSector } from "@/queries/sectorQueries";
import React, { Fragment, ReactElement } from "react";

const SectorPage = (): ReactElement => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const sector = useSector(resourceId);

  if (!sector.data) {
    return <Fragment />;
  }

  return (
    <div className="flex flex-col space-y-5">
      <PageHeader
        resourceId={resourceId}
        resourceName={sector.data.name}
        ancestors={sector.data.ancestors}
        showCounts
      />
      <ChildrenTable resourceId={resourceId} />
    </div>
  );
};

export default SectorPage;
