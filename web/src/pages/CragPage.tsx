import ChildrenTable from "@/components/ChildrenTable";
import PageHeader from "@/components/PageHeader";
import { useSelectedResource } from "@/contexts/SelectedResourceProvider";
import { useCrag } from "@/queries/cragQueries";
import React, { Fragment, ReactElement, useEffect } from "react";
import { useParams } from "react-router-dom";

const CragPage = (): ReactElement => {
  const { updateSelectedResource } = useSelectedResource();

  const { resourceId } = useParams<{
    resourceId: string;
  }>();

  const crag = useCrag(resourceId);

  useEffect(() => {
    if (crag.data !== undefined) {
      updateSelectedResource({
        id: crag.data.id,
        name: crag.data.name,
        type: "crag",
        parentId: crag.data.parentId,
      });
    }
  }, [crag.data, updateSelectedResource]);

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
