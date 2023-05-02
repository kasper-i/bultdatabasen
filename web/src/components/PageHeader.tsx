import { Resource, ResourceType } from "@/models/resource";
import { useMaintainers, useResource } from "@/queries/resourceQueries";
import { getResourceLabel } from "@/utils/resourceUtils";
import React, { ReactElement } from "react";
import Breadcrumbs from "./Breadcrumbs";
import { Underlined } from "./Underlined";
import { Concatenator } from "@/components/Concatenator";

interface Props {
  resourceId: string;
  ancestors?: Resource[];
  showCounts?: boolean;
}

const locationDescription = (resourceType: ResourceType) => {
  switch (resourceType) {
    case "area":
      return `Detta område`;
    case "crag":
      return `Denna klippa`;
    case "sector":
      return `Denna sektor`;
    case "route":
      return `Denna led`;
    default:
      return undefined;
  }
};

const PageHeader = ({
  resourceId,
  ancestors,
  showCounts = false,
}: Props): ReactElement => {
  const { data: resource } = useResource(resourceId);
  const { data: maintainers } = useMaintainers(resourceId);

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
      {!!maintainers?.length && (
        <p className="border border-primary-300 bg-primary-50 rounded p-2 my-2">
          {locationDescription(resource.type)} underhålls av{" "}
          <Concatenator>
            {maintainers?.map((maintainer) => (
              <span key={maintainer.id}>{maintainer.name}</span>
            ))}
          </Concatenator>
        </p>
      )}
    </div>
  );
};

export default PageHeader;
