import { Resource } from "@/models/resource";
import { useCounts } from "@/queries/resourceQueries";
import React, { ReactElement } from "react";
import Breadcrumbs from "./Breadcrumbs";
import ResourceCountRenderer from "./ResourceCountRenderer";

interface Props {
  resourceId: string;
  resourceName: string;
  ancestors?: Resource[];
  showCounts?: boolean;
}

const PageHeader = ({
  resourceId,
  resourceName,
  ancestors,
  showCounts = false,
}: Props): ReactElement => {
  const counts = useCounts(resourceId, showCounts);

  return (
    <div className="flex flex-col gap-2.5">
      <Breadcrumbs
        resourceId={resourceId}
        resourceName={resourceName}
        ancestors={ancestors}
      />
      <div className="flex flex-col items-start">
        <h1 className="text-3xl font-bold">{resourceName}</h1>
      </div>
      {counts.data != null && showCounts && (
        <div className="flex gap-2.5">
          <ResourceCountRenderer label="Leder" count={counts.data.route} />
          <ResourceCountRenderer label="Bultar" count={counts.data.bolt} />
        </div>
      )}
    </div>
  );
};

export default PageHeader;
