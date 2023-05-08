import { Concatenator } from "@/components/Concatenator";
import { Resource } from "@/models/resource";
import { useMaintainers, useResource } from "@/queries/resourceQueries";
import { getResourceLabel } from "@/utils/resourceUtils";
import { ReactElement } from "react";
import Icon from "./atoms/Icon";
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

      <p className="text-sm leading-snug">
        <Icon name="wrench" className="mr-0.5" />
        {maintainers?.length ? (
          <Concatenator>
            {maintainers?.map((maintainer) => (
              <Underlined key={maintainer.id}>{maintainer.name}</Underlined>
            ))}
          </Concatenator>
        ) : (
          <Underlined>Underhållsansvarig saknas</Underlined>
        )}
      </p>

      <div className="h-2.5" />

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
