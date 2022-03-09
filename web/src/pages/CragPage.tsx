import ChildrenTable from "@/components/ChildrenTable";
import PageHeader from "@/components/PageHeader";
import { useUnsafeParams } from "@/hooks/common";
import { useCrag } from "@/queries/cragQueries";
import React, { Fragment, ReactElement } from "react";

const CragPage = (): ReactElement => {
  const { resourceId } = useUnsafeParams<"resourceId">();

  const crag = useCrag(resourceId);

  if (crag.data == null) {
    return <Fragment />;
  }

  return (
    <div className="flex flex-col space-y-5">
      <PageHeader
        resourceId={resourceId}
        ancestors={crag.data.ancestors}
        showCounts
      />
      <ChildrenTable resourceId={resourceId} />
    </div>
  );
};

export default CragPage;
