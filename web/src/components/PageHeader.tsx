import { Concatenator } from "@/components/Concatenator";
import { Resource } from "@/models/resource";
import { useMaintainers, useResource } from "@/queries/resourceQueries";
import { IconTool } from "@tabler/icons-react";
import { ReactElement, ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";
import { Counter } from "./Counter";
import Restricted from "./Restricted";
import { Underlined } from "./Underlined";

interface Props {
  resourceId: string;
  ancestors?: Resource[];
  showCounts?: boolean;
  menu?: ReactNode;
}

const PageHeader = ({
  resourceId,
  ancestors,
  showCounts = false,
  menu,
}: Props): ReactElement => {
  const { data: resource } = useResource(resourceId);
  const { data: maintainers } = useMaintainers(resourceId);

  if (!resource) {
    return <></>;
  }

  const crumbs = ancestors?.slice();
  const onlyRoot = crumbs?.length === 1 && crumbs[0].type === "root";

  return (
    <div data-tailwind="flex flex-col">
      {crumbs && !onlyRoot && (
        <div data-tailwind="mr-14 mb-2.5">
          <Breadcrumbs resources={crumbs} />
        </div>
      )}
      <div data-tailwind="flex justify-between">
        <h1 data-tailwind="text-2xl font-bold">{resource.name}</h1>
        <Restricted>{menu}</Restricted>
      </div>

      <p data-tailwind="text-sm leading-snug">
        <IconTool size={14} />
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

      <div data-tailwind="h-2.5" />

      {showCounts && (
        <div data-tailwind="text-md flex gap-4">
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
