import ChildrenTable from "@/components/ChildrenTable";
import PageHeader from "@/components/PageHeader";
import { useSelectedResource } from "@/contexts/SelectedResourceProvider";
import { useArea } from "@/queries/areaQueries";
import React, { Fragment, ReactElement, useEffect } from "react";
import { useParams } from "react-router-dom";

const AreaPage = (): ReactElement => {
  const { updateSelectedResource } = useSelectedResource();

  const { resourceId } = useParams<{
    resourceId: string;
  }>();

  const area = useArea(resourceId);

  useEffect(() => {
    if (area.data !== undefined) {
      updateSelectedResource({
        id: area.data.id,
        name: area.data.name,
        type: "area",
        parentId: area.data.parentId,
      });
    }
  }, [area.data, updateSelectedResource]);

  if (area.data == null) {
    return <Fragment />;
  }

  return (
    <div className="flex flex-col space-y-5">
      <PageHeader
        resourceId={resourceId}
        resourceName={area.data.name}
        ancestors={area.data.ancestors}
        showCounts
      />
      <ChildrenTable resourceId={resourceId} />
    </div>
  );
};

export default AreaPage;
