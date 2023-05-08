import { Resource, ResourceType } from "@/models/resource";
import { useMaintainers, useResource } from "@/queries/resourceQueries";
import { getResourceLabel } from "@/utils/resourceUtils";
import React, { ReactElement } from "react";
import Breadcrumbs from "./Breadcrumbs";
import { Underlined } from "./Underlined";
import { Concatenator } from "@/components/Concatenator";
import Icon from "./atoms/Icon";

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
    <div className="flex flex-col">
      {crumbs && !onlyRoot && (
        <div className="mr-14 mb-2.5">
          <Breadcrumbs resources={crumbs} />
        </div>
      )}
      <h1 className="text-2xl font-bold">{resource.name}</h1>

      {!!maintainers?.length && (
        <div className="flex items-center gap-1 mb-2.5 text-sm">
          <p>
            <Icon name="wrench" className="mr-1" />
            <Concatenator>
              {maintainers?.map((maintainer) => (
                <Underlined key={maintainer.id}>{maintainer.name}</Underlined>
              ))}
            </Concatenator>
          </p>
        </div>
      )}

      {showCounts && (
        <p className="text-md">
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
