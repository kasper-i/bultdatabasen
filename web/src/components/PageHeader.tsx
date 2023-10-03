import { Concatenator } from "@/components/Concatenator";
import { Resource } from "@/models/resource";
import { useMaintainers, useResource } from "@/queries/resourceQueries";
import { IconTool } from "@tabler/icons-react";
import { ReactElement, ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";
import { Counter } from "./Counter";
import Restricted from "./Restricted";
import { Underlined } from "./Underlined";
import { Group, Space, Stack, Text, Title } from "@mantine/core";
import classes from "./PageHeader.module.css";

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
    <Stack>
      {crumbs && !onlyRoot && (
        <Breadcrumbs className={classes.breadcrumbs} resources={crumbs} />
      )}
      <Group justify="space-between">
        <Title order={1}>{resource.name}</Title>
        <Restricted>{menu}</Restricted>
      </Group>

      <Text className={classes.maintainer}>
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
      </Text>

      <Space h="sm" />

      {showCounts && (
        <Group>
          <Counter
            label="Bultar"
            count={resource.counters?.installedBolts ?? 0}
          />
          <Counter label="Leder" count={resource.counters?.routes ?? 0} />
        </Group>
      )}
    </Stack>
  );
};

export default PageHeader;
