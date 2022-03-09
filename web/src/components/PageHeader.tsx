import { Resource } from "@/models/resource";
import { useCounts, useResource } from "@/queries/resourceQueries";
import { getResourceLabel } from "@/utils/resourceUtils";
import React, { ReactElement } from "react";
import Breadcrumbs from "./Breadcrumbs";
import { Underlined } from "./Underlined";

interface Props {
  resourceId: string;
  ancestors?: Resource[];
  showCounts?: boolean;
}

const PageHeader = ({
  resourceId,
  ancestors,
  showCounts = false,
}: Props): ReactElement => {
  const { data: resource } = useResource(resourceId);
  const counts = useCounts(resourceId, showCounts);

  if (!resource) {
    return <></>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      <Breadcrumbs
        resourceId={resourceId}
        resourceName={resource.name ?? ""}
        ancestors={ancestors}
      />
      <div className="flex flex-col items-start">
        <h1 className="text-3xl font-bold">{resource.name}</h1>
      </div>
      {counts.data != null && showCounts && (
        <p className="text-lg">
          {getResourceLabel(resource.type)} med{" "}
          <Underlined>{counts.data.route}</Underlined> leder och{" "}
          <Underlined>{counts.data.bolt}</Underlined> bultar.
        </p>
      )}
    </div>
  );
};

export default PageHeader;
