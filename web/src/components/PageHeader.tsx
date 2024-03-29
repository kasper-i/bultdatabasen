import { Concatenator } from "@/components/Concatenator";
import { Resource } from "@/models/resource";
import { useMaintainers, useResource } from "@/queries/resourceQueries";
import { ReactElement } from "react";
import Icon from "./atoms/Icon";
import Breadcrumbs from "./Breadcrumbs";
import { Counter } from "./Counter";
import { Menu, MenuItem } from "./molecules/Menu";
import Restricted from "./Restricted";
import { Underlined } from "./Underlined";

interface Props {
  resourceId: string;
  ancestors?: Resource[];
  showCounts?: boolean;
  menuItems?: MenuItem[];
}

const PageHeader = ({
  resourceId,
  ancestors,
  showCounts = false,
  menuItems,
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
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">{resource.name}</h1>
        <Restricted>{menuItems && <Menu items={menuItems} />}</Restricted>
      </div>

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
        <div className="text-md flex gap-4">
          <Counter
            label="Bultar"
            count={resource.counters?.installedBolts ?? 0}
          />
          <Counter label="Leder" count={resource.counters?.routes ?? 0} />
        </div>
      )}
    </div>
  );
};

export default PageHeader;
