import ChildrenTable from "@/components/ChildrenTable";
import PageHeader from "@/components/PageHeader";
import { useUnsafeParams } from "@/hooks/common";
import { useArea } from "@/queries/areaQueries";
import React, { Fragment, ReactElement } from "react";

const AreaPage = (): ReactElement => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const area = useArea(resourceId);

  if (!area.data) {
    return <Fragment />;
  }

  return (
    <div className="flex flex-col space-y-5">
      <PageHeader
        resourceId={resourceId}
        ancestors={area.data.ancestors}
        showCounts
      />
      <ChildrenTable
        resourceId={resourceId}
        filters={{ types: ["area", "crag", "route"] }}
      />
    </div>
  );
};

export default AreaPage;
