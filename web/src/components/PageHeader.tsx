import { Resource } from "@/models/resource";
import { useResource } from "@/queries/resourceQueries";
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

  if (!resource) {
    return <></>;
  }

  const crumbs = ancestors?.slice();
  const onlyRoot = crumbs?.length === 1 && crumbs[0].type === "root";

  return (
    <div className="flex flex-col gap-2.5">
      {crumbs && !onlyRoot && (
        <div className="mr-14">
          <Breadcrumbs resources={crumbs} />
        </div>
      )}
      <h1 className="text-2xl font-bold">{resource.name}</h1>
      {showCounts && (
        <p className="text-lg">
          {getResourceLabel(resource.type)} med{" "}
          <Underlined>{resource.counters?.routes ?? 0}</Underlined> leder och{" "}
          <Underlined>{resource.counters?.installedBolts ?? 0}</Underlined>{" "}
          dokumenterade bultar.
        </p>
      )}
    </div>
  );
};

export default PageHeader;
