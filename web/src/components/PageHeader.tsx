import { useCounts } from "queries/commonQueries";
import React, { ReactElement } from "react";
import Breadcrumbs from "./Breadcrumbs";
import ResourceCountRenderer from "./ResourceCountRenderer";

interface Props {
  resourceId: string;
  resourceName: string;
  showCounts?: boolean;
}

const PageHeader = ({
  resourceId,
  resourceName,
  showCounts,
}: Props): ReactElement => {
  const counts = useCounts(resourceId);

  return (
    <div className="flex flex-col space-y-2.5">
      <Breadcrumbs resourceId={resourceId} resourceName={resourceName} />
      <div className="flex justify-start space-x-10">
        <h1 className="text-4xl font-bold">{resourceName}</h1>
        {counts.data != null && showCounts && (
          <>
            <ResourceCountRenderer label="Leder" count={counts.data.route} />
            <ResourceCountRenderer label="Bultar" count={counts.data.bolt} />
          </>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
